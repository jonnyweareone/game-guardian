import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const deviceId = req.headers.get("x-device-id") ?? "";
    if (!deviceId) return new Response(JSON.stringify({ error: "Missing x-device-id" }), { 
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    const { data: dev, error: devErr } = await supabase
      .from("guardian_devices")
      .select("status, config_version")
      .eq("device_id", deviceId)
      .single();
    
    if (devErr) return new Response(JSON.stringify({ error: devErr.message }), { 
      status: 404,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
    
    if (dev.status !== "active") return new Response(JSON.stringify({ error: "Not active" }), { 
      status: 403,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    const { data: cfg, error: cfgErr } = await supabase
      .from("guardian_device_configs")
      .select("version, effective_manifest, policies, apps, nextdns_profile")
      .eq("device_id", deviceId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

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