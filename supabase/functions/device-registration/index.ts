import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: corsHeaders });

  try {
    const deviceCode = req.headers.get("x-device-id") ?? "";
    if (!deviceCode) return new Response(JSON.stringify({ error: "Missing x-device-id" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { "x-gg-fn": "device-registration" } } },
    );

    const { data, error } = await supabase
      .from("devices")
      .upsert({
        device_code: deviceCode,
        status: "pending",
        last_seen: new Date().toISOString(),
      }, { onConflict: "device_code" })
      .select("*")
      .single();

    if (error) {
      console.error("device-registration upsert error", error);
      return new Response(JSON.stringify({ error: "Registration failed", details: error.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true, status: data.status, approval_required: true }), { 
      headers: { "content-type": "application/json", ...corsHeaders } 
    });
  } catch (e) {
    console.error("device-registration exception", e);
    return new Response(JSON.stringify({ error: "Registration failed", details: String(e) }), { status: 500, headers: corsHeaders });
  }
});