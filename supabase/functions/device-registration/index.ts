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
    const deviceCode = req.headers.get("x-device-id") ?? "";
    if (!deviceCode) return new Response(JSON.stringify({ error: "Missing x-device-id" }), { 
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    const body = await req.json().catch(() => ({}));
    const hw_info = body?.hw_info ?? {};
    const labels = body?.labels ?? {};

    // upsert device as pending using device_code (not device_id)
    const { data, error } = await supabase
      .from("devices")
      .upsert({
        device_code: deviceCode,
        status: "pending", 
        last_seen: new Date().toISOString(),
        // Set required parent_id to prevent constraint violations
        parent_id: "00000000-0000-0000-0000-000000000000"
      }, { onConflict: "device_code" })
      .select("*")
      .single();

    if (error) {
      console.error("Device registration error:", error);
      return new Response(JSON.stringify({ 
        error: "Registration failed", 
        details: error.message 
      }), { 
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      status: data.status,
      approval_required: true
    }), { headers: { "content-type": "application/json", ...corsHeaders } });

  } catch (e) {
    console.error("Device registration error:", e);
    return new Response(JSON.stringify({ 
      error: "Registration failed", 
      details: String(e) 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});