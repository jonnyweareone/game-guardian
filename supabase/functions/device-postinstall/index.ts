import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id, x-child-id',
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

type ParsedData = {
  device_id?: string;
  deviceCode?: string;
  child_id?: string;
  selectedChildId?: string;
  app_ids?: string[];
  web_filter_config?: unknown;
};

function safeJsonParse(text: string): ParsedData {
  try { 
    return text ? (JSON.parse(text) as ParsedData) : {}; 
  } catch { 
    return {}; 
  }
}

function getQuery(url: string) {
  const u = new URL(url);
  return (key: string) => u.searchParams.get(key) || undefined;
}

// Robust base64url decoding
function b64urlToBytes(b64url: string): Uint8Array {
  // base64url -> base64
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

async function verifyDeviceJWT(jwt: string, expectedAud = "device") {
  try {
    // format checks
    const parts = jwt.split(".");
    if (parts.length !== 3) throw new Error("format");
    const [h, p, s] = parts;

    // parse header + payload
    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    if (header.alg !== "HS256" || header.typ !== "JWT") throw new Error("alg");

    // timing-safe signature verify
    const DEVICE_JWT_SECRET = Deno.env.get("DEVICE_JWT_SECRET");
    if (!DEVICE_JWT_SECRET) throw new Error("no-secret");
    
    const key = await importHmacKey(DEVICE_JWT_SECRET);
    const signingInput = new TextEncoder().encode(`${h}.${p}`);
    const sigBytes = b64urlToBytes(s);
    const ok = await crypto.subtle.verify("HMAC", key, sigBytes, signingInput);
    if (!ok) throw new Error("signature");

    // claims checks
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now >= payload.exp) throw new Error("expired");
    if (payload.nbf && now < payload.nbf) throw new Error("nbf");
    if (expectedAud && payload.aud !== expectedAud) throw new Error("aud");

    return { ok: true, deviceCode: String(payload.device_id || payload.sub) };
  } catch (e) {
    const reason = String(e?.message || e);
    console.log('device-postinstall: JWT verify failed:', reason);
    return { ok: false, error: reason };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Device JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const token = authHeader.slice(7);
    const verification = await verifyDeviceJWT(token);
    
    if (!verification.ok) {
      console.error('JWT verification failed:', verification);
      return json({ error: 'Invalid device JWT' }, 401);
    }

    const deviceCodeFromJWT = verification.deviceCode;

    // Parse body with robust fallbacks
    const raw = await req.text(); // works even if Content-Type is wrong
    const body = safeJsonParse(raw);
    
    const q = getQuery(req.url);
    const deviceIdHeader = req.headers.get('x-device-id') || undefined;
    const childIdHeader = req.headers.get('x-child-id') || undefined;

    // Extract child_id from multiple sources
    const child_id =
      body.child_id ||
      body.selectedChildId ||
      childIdHeader ||
      q('child_id') ||
      q('selectedChildId') ||
      undefined;

    // Extract app_ids from multiple sources
    const app_ids: string[] =
      Array.isArray(body.app_ids) ? body.app_ids
        : (q('app_ids')?.split(',').filter(Boolean) || []);

    // Extract web_filter_config
    const web_filter_config =
      body.web_filter_config ?? safeJsonParse(q('web_filter_config') || '{}');

    // Always use device from JWT, never trust client
    const device_id = deviceCodeFromJWT;

    console.log('Device postinstall parsed:', {
      device_id,
      child_id_present: !!child_id,
      app_ids_count: app_ids.length,
      raw_len: raw.length,
      has_web_filter_config: !!web_filter_config
    });

    if (!child_id) {
      return json({ error: 'Missing child_id' }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Use deviceCode from JWT to look up the device (more secure than trusting body)
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, parent_id')
      .eq('device_code', device_id)
      .single();

    if (deviceError || !device) {
      console.error('device-postinstall: Device not found', deviceError);
      return json({ error: "Device not found" }, { status: 404 });
    }

    console.log('device-postinstall: Device verified', { device_id: device.id, parent_id: device.parent_id });

    // Update device to link to child directly
    const { error: deviceUpdateError } = await supabase
      .from('devices')
      .update({ 
        child_id: child_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', device.id);

    if (deviceUpdateError) {
      console.error('device-postinstall: Error updating device', deviceUpdateError);
      return json({ error: "Failed to link device to child" }, { status: 400 });
    }

    console.log('device-postinstall: Device-child link updated');

    // Clear existing app selections for this child and add new ones
    if (Array.isArray(app_ids) && app_ids.length > 0) {
      // First delete existing selections
      const { error: deleteError } = await supabase
        .from('child_app_selections')
        .delete()
        .eq('child_id', child_id);

      if (deleteError) {
        console.log('device-postinstall: Note - could not clear existing app selections', deleteError);
      }

      // Insert new selections
      const appSelections = app_ids.map((app_id: string) => ({ child_id, app_id }));
      const { error: appError } = await supabase
        .from('child_app_selections')
        .insert(appSelections);

      if (appError) {
        console.error('device-postinstall: Error saving app selections', appError);
        // Don't fail the whole operation for app selection errors
      } else {
        console.log('device-postinstall: App selections saved', { count: app_ids.length });
      }
    }

    // Fetch app catalog details for job payload
    let apps = [];
    if (Array.isArray(app_ids) && app_ids.length > 0) {
      const { data: appData, error: appFetchError } = await supabase
        .from('app_catalog')
        .select('id, name, type, platform, is_essential, category')
        .in('id', app_ids);

      if (appFetchError) {
        console.error('device-postinstall: Error fetching app details', appFetchError);
      } else {
        apps = appData || [];
        console.log('device-postinstall: App details fetched', { count: apps.length });
      }
    }

    // Fetch child details
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name')
      .eq('id', child_id)
      .single();

    if (childError) {
      console.error('device-postinstall: Error fetching child', childError);
    }

    // Create job payload with web filter configuration
    const payload = { 
      child: child || { id: child_id }, 
      apps: apps,
      web_filters: web_filter_config || {
        schoolHoursEnabled: false,
        socialMediaBlocked: true,
        gamingBlocked: false,
        entertainmentBlocked: false
      }
    };

    console.log('device-postinstall: Creating job with payload', { 
      child_name: child?.name, 
      apps_count: apps.length,
      web_filters: payload.web_filters
    });

    // Enqueue post-install job for device agent using new table structure
    const { error: jobError } = await supabase
      .from('device_jobs')
      .insert({
        device_id: device.id,
        type: 'POST_INSTALL',
        payload,
        status: 'queued'
      });

    if (jobError) {
      console.error('device-postinstall: Error creating job', jobError);
      return json({ error: "Failed to queue installation job" }, { status: 400 });
    }

    console.log('device-postinstall: Job queued successfully');

    return json({ ok: true });

  } catch (error: any) {
    console.error('device-postinstall: Unexpected error', error);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});