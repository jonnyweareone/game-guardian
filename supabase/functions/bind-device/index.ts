/**
 * Supabase Edge Function: bind-device
 * - Requires a logged-in parent (Authorization: Bearer <access_token>)
 * - Upserts the device row (parent-owned), marks active, and mints a device_jwt
 * - Stores device_jwt in devices for polling via device-status
 * - NEW: records activation consent and starts a 30-day trial subscription if none exists
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

function b64url(buf: Uint8Array) {
  return btoa(String.fromCharCode(...buf)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}

async function sha256b64url(data: string) {
  const enc = new TextEncoder().encode(data);
  const d = await crypto.subtle.digest("SHA-256", enc);
  return b64url(new Uint8Array(d));
}

// Inline JWT functions to avoid import issues
async function signDeviceJWT(deviceCode: string) {
  const DEVICE_JWT_SECRET = Deno.env.get("DEVICE_JWT_SECRET");
  const JWT_ISSUER = Deno.env.get("JWT_ISSUER") ?? "gameguardian";
  const JWT_AUDIENCE = Deno.env.get("JWT_AUDIENCE") ?? "device";

  if (!DEVICE_JWT_SECRET) {
    throw new Error("DEVICE_JWT_SECRET environment variable is not set");
  }

  // Create a proper key for HS256
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(DEVICE_JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const payload = {
    sub: deviceCode,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
  };

  const header = { alg: "HS256", typ: "JWT" };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  return `${data}.${encodedSignature}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  console.log("bind-device: Function invoked");

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.log("bind-device: No authorization header");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Service-role client for privileged writes (bypass RLS)
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    console.log("bind-device: Getting user from auth");
    // Identify the current user (parent)
    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData?.user) {
      console.log("bind-device: User auth failed", userErr);
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = userData.user;
    console.log("bind-device: User authenticated", user.id);

    // Parse body - accept both device_id and device_code for compatibility
    const body = await req.json().catch(() => ({}));
    const deviceCode = (body?.device_id ?? body?.device_code as string | undefined)?.toUpperCase();
    const deviceName = body?.device_name as string | undefined;
    const childId = body?.child_id as string | undefined;
    const consentVersion = (body?.consent_version as string | undefined) ?? "1.0";

    console.log("bind-device: Request body parsed", { deviceCode, deviceName, childId });

    if (!deviceCode) {
      console.log("bind-device: Missing device_id");
      return json({ error: "device_id required" }, { status: 400 });
    }

    // Optionally validate child belongs to this parent
    let validChildId: string | null = null;
    if (childId) {
      console.log("bind-device: Validating child ownership", childId);
      const { data: child, error: childErr } = await anonClient
        .from("children")
        .select("id")
        .eq("id", childId)
        .eq("parent_id", user.id)
        .maybeSingle();
      if (childErr) {
        console.error("bind-device child lookup error:", childErr);
        return json({ error: "Failed to validate child" }, { status: 400 });
      }
      validChildId = child ? child.id : null;
      if (childId && !validChildId) {
        console.log("bind-device: Child not found or not owned by parent");
        return json({ error: "Child not found or not owned by parent" }, { status: 403 });
      }
      console.log("bind-device: Child validation successful", validChildId);
    }

    // Upsert device by device_code (unique) and mark as active
    const row: Record<string, unknown> = {
      device_code: deviceCode,
      parent_id: user.id,
      is_active: true,
      status: 'active', // Set status to active for activation-status function
      paired_at: new Date().toISOString(),
    };
    if (deviceName) row.device_name = deviceName;
    if (validChildId) row.child_id = validChildId;

    console.log("bind-device: Upserting device", row);

    const { data: upserted, error: upsertErr } = await anonClient
      .from("devices")
      .upsert(row, { onConflict: "device_code" })
      .select("id, device_code, parent_id")
      .single();

    if (upsertErr) {
      console.error("bind-device upsert error:", upsertErr);
      // Most likely the device_code is already owned by another account
      return json({ error: "This device is already paired to another account." }, { status: 409 });
    }

    console.log("bind-device: Device upserted successfully", upserted);

    // Check for existing bootstrap secret first, then generate new one
    let refresh_secret = "";
    let refresh_secret_hash = "";
    
    const { data: bootstrapSecret, error: bootstrapError } = await serviceClient
      .from("device_bootstrap_secrets")
      .select("refresh_secret_hash")
      .eq("device_code", deviceCode)
      .maybeSingle();

    if (bootstrapSecret?.refresh_secret_hash) {
      // Use existing bootstrap secret
      refresh_secret_hash = bootstrapSecret.refresh_secret_hash;
      refresh_secret = ""; // Don't expose in response since device already has it
      console.log("bind-device: Using existing bootstrap secret");
      
      // Mark as used
      await serviceClient
        .from("device_bootstrap_secrets")
        .update({ used_at: new Date().toISOString() })
        .eq("device_code", deviceCode);
    } else {
      // Generate new refresh secret
      const raw = new Uint8Array(48);
      crypto.getRandomValues(raw);
      refresh_secret = b64url(raw);
      refresh_secret_hash = await sha256b64url(refresh_secret);
      console.log("bind-device: Generated new refresh secret");
    }

    const token = await signDeviceJWT(deviceCode);

    // Cache token and refresh secret hash on the device row
    const { error: updErr } = await anonClient
      .from("devices")
      .update({ 
        device_jwt: token, 
        refresh_secret_hash,
        last_token_issued_at: new Date().toISOString(),
        is_active: true,
        status: 'active' // Ensure status is set to active
      })
      .eq("device_code", deviceCode);

    if (updErr) {
      console.error("bind-device update token error:", updErr);
      // Continue; token will still be returned to caller
    }

    // Record device activation consent (service role)
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");
    let ip: string | undefined;
    
    if (xForwardedFor) {
      // Handle comma-separated list of IPs by taking the first one
      ip = xForwardedFor.split(',')[0].trim();
    } else if (xRealIp) {
      ip = xRealIp;
    }
    
    const ua = req.headers.get("user-agent") || undefined;

    // We need device UUID for device_activations and device_config linkage
    const deviceId = upserted.id as string;

    console.log("bind-device: Recording activation consent", { deviceId, ip, ua });

    const { error: actErr } = await serviceClient
      .from("device_activations")
      .insert({
        device_id: deviceId,
        user_id: user.id,
        consent_version: consentVersion,
        consent_ip: ip || null,
        consent_user_agent: ua,
      } as any); // cast for safety if types lag

    if (actErr) {
      console.error("bind-device activation insert error:", actErr);
      // Non-fatal
    }

    // Ensure device_config row exists for this device (service role)
    const { data: cfg, error: cfgSelErr } = await serviceClient
      .from("device_config")
      .select("device_id")
      .eq("device_id", deviceId)
      .maybeSingle();
    if (cfgSelErr) {
      console.error("bind-device device_config select error:", cfgSelErr);
    }
    if (!cfg) {
      const { error: cfgInsErr } = await serviceClient
        .from("device_config")
        .insert({
          device_id: deviceId,
          features: { monitoring: false, creator: false },
        } as any);
      if (cfgInsErr) console.error("bind-device device_config insert error:", cfgInsErr);
    }

    // Create device-child assignment if child was specified
    if (validChildId) {
      console.log("bind-device: Creating device-child assignment", { deviceId, validChildId });
      const { error: assignErr } = await serviceClient
        .from("device_child_assignments")
        .upsert({
          device_id: deviceId,
          child_id: validChildId,
          is_active: true,
        } as any, { onConflict: "device_id,child_id" });
      
      if (assignErr) {
        console.error("bind-device device-child assignment error:", assignErr);
        // Non-fatal, but log it
      } else {
        console.log("bind-device: Device-child assignment created successfully");
      }
    }

    // Start 30-day trial subscription if none exists (service role)
    const { data: subRow, error: subErr } = await serviceClient
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subErr) {
      console.error("bind-device subscriptions select error:", subErr);
    }
    if (!subRow) {
      const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error: subInsErr } = await serviceClient
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "trial",
          status: "trialing",
          trial_ends_at: trialEnds,
        } as any);
      if (subInsErr) console.error("bind-device subscriptions insert error:", subInsErr);
    }

    console.log("bind-device: Process completed successfully");

    const response: Record<string, any> = { 
      ok: true, 
      device_id: deviceId, 
      device_code: deviceCode, 
      device_jwt: token,
      trial_started: !subRow,
      child_assigned: !!validChildId
    };

    // Only include refresh_secret if we generated a new one
    if (refresh_secret) {
      response.refresh_secret = refresh_secret;
    }

    return json(response);
  } catch (e) {
    console.error("bind-device error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});