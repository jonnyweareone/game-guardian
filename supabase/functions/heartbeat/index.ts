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

    const body = await req.json().catch(() => ({}));
    const { agent_version, metrics = {}, alerts = [] } = body;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";

    const { error: insErr } = await supabase.from("guardian_device_heartbeats").insert({
      device_id: deviceId,
      agent_version,
      metrics,
      alerts,
      ip
    });
    if (insErr) throw insErr;

    const { error: updErr } = await supabase
      .from("guardian_devices")
      .update({ last_seen: new Date().toISOString() })
      .eq("device_id", deviceId);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { "content-type": "application/json", ...corsHeaders } 
    });

  } catch (e) {
    console.error("Heartbeat error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});