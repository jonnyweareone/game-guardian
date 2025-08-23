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

    const { data, error } = await supabase
      .from("guardian_devices")
      .select("status, owner_user, config_version")
      .eq("device_id", deviceId)
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { 
      status: 404,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    return new Response(JSON.stringify({
      ok: true,
      status: data.status,
      approved: !!data.owner_user && data.status === "active",
      config_version: data.config_version ?? 0
    }), { headers: { "content-type": "application/json", ...corsHeaders } });

  } catch (e) {
    console.error("Activation status error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});