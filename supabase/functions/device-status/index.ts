
/**
 * Supabase Edge Function: device-status
 * - Public endpoint for devices to poll until device_jwt is ready
 * - Returns { device_jwt, is_active, activated } for a given device_id (device_code)
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const deviceCode = url.searchParams.get("device_id");
    if (!deviceCode) return json({ error: "device_id required" }, { status: 400 });

    // Service role client (public endpoint reads device_jwt)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("devices")
      .select("device_jwt, is_active, paired_at")
      .eq("device_code", deviceCode.toUpperCase())
      .maybeSingle();

    if (error) {
      console.error("device-status select error:", error);
      return json({ error: "Query failed" }, { status: 400 });
    }

    const activated = !!(data?.is_active || data?.paired_at || data?.device_jwt);
    return json({ ...(data || {}), activated });
  } catch (e) {
    console.error("device-status error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
