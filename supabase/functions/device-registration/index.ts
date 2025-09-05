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

    // Check if device already exists and is owned
    const { data: existingDevice, error: checkError } = await supabase
      .from("devices")
      .select("id, device_code, parent_id, status")
      .eq("device_code", deviceCode)
      .maybeSingle();

    if (checkError) {
      console.error("device-registration check error", checkError);
      return new Response(JSON.stringify({ error: "Registration check failed", details: checkError.message }), { status: 500, headers: corsHeaders });
    }

    // If device exists and is owned, return appropriate status
    if (existingDevice?.parent_id) {
      return new Response(JSON.stringify({ 
        ok: true, 
        status: existingDevice.status || "active",
        approval_required: false,
        message: "Device already registered and owned"
      }), { 
        headers: { "content-type": "application/json", ...corsHeaders } 
      });
    }

    // Upsert device (create or update last_seen)
    const { data, error } = await supabase
      .from("devices")
      .upsert({
        device_code: deviceCode,
        status: existingDevice ? existingDevice.status : "pending",
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