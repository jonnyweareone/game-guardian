import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { signDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const deviceCode = url.searchParams.get("device_id") ?? req.headers.get("x-device-id") ?? "";
    if (!deviceCode) return new Response(JSON.stringify({ error: "Missing device_id" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("devices")
      .select("status")
      .eq("device_code", deviceCode)
      .maybeSingle();

    if (error) throw error;

    const activated = data?.status === "active"; // or "approved" depending on your flow
    if (!activated) {
      return new Response(JSON.stringify({ activated: false, status: data?.status ?? "pending" }), { 
        headers: { "content-type": "application/json", ...corsHeaders } 
      });
    }

    const token = await signDeviceJWT(deviceCode);
    return new Response(JSON.stringify({ 
      activated: true, 
      device_jwt: token, 
      device_id: deviceCode, 
      status: "online" 
    }), {
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  } catch (e) {
    console.error("activation-status error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});