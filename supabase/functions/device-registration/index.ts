// deno-lint-ignore-file no-explicit-any
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
    const hw_info = body?.hw_info ?? {};
    const labels = body?.labels ?? {};

    // upsert device as pending
    const { data, error } = await supabase
      .from("devices")
      .upsert({
        device_id: deviceId,
        status: "pending",
        last_seen: new Date().toISOString(),
        hw_info,
        labels
      }, { onConflict: "device_id" })
      .select("*")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      ok: true,
      status: data.status,
      approval_required: true
    }), { headers: { "content-type": "application/json", ...corsHeaders } });

  } catch (e) {
    console.error("Device registration error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});