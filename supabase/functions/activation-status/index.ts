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
    // Accept device_id from either query parameter or header
    const url = new URL(req.url);
    const deviceCode = url.searchParams.get("device_id") || req.headers.get("x-device-id") || "";
    
    if (!deviceCode) return new Response(JSON.stringify({ error: "Missing device_id" }), { 
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders }
    });

    const { data, error } = await supabase
      .from("devices")
      .select("status, parent_id, is_active, paired_at")
      .eq("device_code", deviceCode)
      .maybeSingle();

    // Always return 200 - never 404 for "not yet activated"
    const activated = !!(data?.is_active || data?.paired_at || (data?.parent_id && data?.status === "active"));
    
    return new Response(JSON.stringify({
      activated,
      status: data?.status || "pending"
    }), { headers: { "content-type": "application/json", ...corsHeaders } });

  } catch (e) {
    console.error("Activation status error:", e);
    return new Response(JSON.stringify({ 
      activated: false,
      error: "Internal error" 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});