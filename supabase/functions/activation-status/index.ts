
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
    const q = url.searchParams.get("device_id") ?? req.headers.get("x-device-id") ?? "";
    if (!q) return new Response(JSON.stringify({ error: "Missing device_id" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // First try by device_code (canonical approach)
    let { data: row, error } = await supabase
      .from("devices")
      .select("id, device_code, status")
      .eq("device_code", q)
      .maybeSingle();

    // If not found and q looks like a UUID, try by id for backward compatibility
    if (!row && /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(q)) {
      const { data: byId } = await supabase
        .from("devices")
        .select("id, device_code, status")
        .eq("id", q)
        .maybeSingle();
      if (byId) row = byId;
    }

    if (error) throw error;

    const activated = row?.status === "active";
    if (!activated) {
      return new Response(JSON.stringify({ 
        activated: false, 
        status: row?.status ?? "pending",
        device_code: row?.device_code
      }), { 
        headers: { "content-type": "application/json", ...corsHeaders } 
      });
    }

    // Use the canonical device_code for token generation
    const token = await signDeviceJWT(row.device_code);
    return new Response(JSON.stringify({ 
      activated: true, 
      device_jwt: token, 
      device_id: row.device_code, 
      device_code: row.device_code,
      status: "online" 
    }), {
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  } catch (e) {
    console.error("activation-status error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
