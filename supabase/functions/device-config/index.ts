import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Device JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Device JWT" }), { 
        status: 401,
        headers: { "content-type": "application/json", ...corsHeaders }
      });
    }

    const token = authHeader.slice(7);
    const { ok, deviceCode, error: verifyError } = await verifyDeviceJWT(token);
    if (!ok || !deviceCode) {
      console.error("device-config auth error:", verifyError);
      return new Response(JSON.stringify({ error: "Unauthorized", details: verifyError }), { 
        status: 401,
        headers: { "content-type": "application/json", ...corsHeaders }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get device by device code
    const { data: dev, error: devErr } = await supabase
      .from("devices")
      .select("id, status, config_version")
      .eq("device_code", deviceCode)
      .single();
    
    if (devErr) return new Response(JSON.stringify({ error: devErr.message }), { 
      status: 404,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
    
    if (dev.status !== "active") return new Response(JSON.stringify({ error: "Not active" }), { 
      status: 403,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    // Check if device_configs table exists, otherwise return default config
    const { data: cfg, error: cfgErr } = await supabase
      .from("device_configs")
      .select("version, effective_manifest, policies, apps, nextdns_profile")
      .eq("device_id", dev.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    // If device_configs table doesn't exist or no config found, return defaults
    if (cfgErr && cfgErr.code === '42P01') {
      // Table doesn't exist, return default config
      return new Response(JSON.stringify({
        ok: true,
        version: 0,
        manifest: {},
        policies: {},
        apps: [],
        nextdns_profile: null
      }), { headers: { "content-type": "application/json", ...corsHeaders } });
    }

    if (cfgErr) return new Response(JSON.stringify({ error: cfgErr.message }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    return new Response(JSON.stringify({
      ok: true,
      version: cfg?.version ?? 0,
      manifest: cfg?.effective_manifest ?? {},
      policies: cfg?.policies ?? {},
      apps: cfg?.apps ?? [],
      nextdns_profile: cfg?.nextdns_profile ?? null
    }), { headers: { "content-type": "application/json", ...corsHeaders } });

  } catch (e) {
    console.error("Device config error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});