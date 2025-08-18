
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    let deviceId: string | null = null;

    // Support both GET and POST requests
    if (req.method === "GET") {
      const url = new URL(req.url);
      deviceId = url.searchParams.get("device_id");
    } else if (req.method === "POST") {
      const body = await req.json();
      deviceId = body.device_id;
    }

    if (!deviceId) {
      return json({ error: "device_id required" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: device, error } = await supabase
      .from("devices")
      .select("id, kind, platform, mdm_enrolled, vpn_active, last_seen, battery, status, is_active")
      .eq("id", deviceId)
      .single();

    if (error || !device) {
      return json({ error: "device_not_found" }, { status: 404 });
    }

    const activation_status = device.mdm_enrolled ? "supervised" : device.is_active ? "enrolled" : "pending";

    return json({
      ...device,
      activation_status
    });

  } catch (error) {
    console.error("Activation status error:", error);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
