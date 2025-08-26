import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

// Inline JWT functions to avoid import issues
async function signDeviceJWT(deviceCode: string) {
  const DEVICE_JWT_SECRET = Deno.env.get("DEVICE_JWT_SECRET");
  const JWT_ISSUER = Deno.env.get("JWT_ISSUER") ?? "gameguardian";
  const JWT_AUDIENCE = Deno.env.get("JWT_AUDIENCE") ?? "device";

  if (!DEVICE_JWT_SECRET) {
    throw new Error("DEVICE_JWT_SECRET environment variable is not set");
  }

  // Create a proper key for HS256
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(DEVICE_JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const payload = {
    sub: deviceCode,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
  };

  const header = { alg: "HS256", typ: "JWT" };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  return `${data}.${encodedSignature}`;
}

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
      .select("id, device_code, status, is_active, paired_at, device_jwt")
      .eq("device_code", q)
      .maybeSingle();

    // If not found and q looks like a UUID, try by id for backward compatibility
    if (!row && /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(q)) {
      const { data: byId } = await supabase
        .from("devices")
        .select("id, device_code, status, is_active, paired_at, device_jwt")
        .eq("id", q)
        .maybeSingle();
      if (byId) row = byId;
    }

    if (error) throw error;

    // Robust activation detection - check multiple indicators
    const activated = row?.status === 'active' || !!row?.device_jwt || !!row?.is_active || !!row?.paired_at;
    
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