import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

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
  
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { device_external_id, parent_id, ttl = 3600 } = await req.json();

    if (!device_external_id || !parent_id) {
      return json({ error: "Missing required fields: device_external_id, parent_id" }, { status: 400 });
    }

    const secret = Deno.env.get("DEVICE_JWT_SECRET");
    if (!secret) {
      console.error("DEVICE_JWT_SECRET not configured");
      return json({ error: "JWT secret not configured" }, { status: 500 });
    }

    // Create signing key
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const now = Math.floor(Date.now() / 1000);
    const maxTtl = Math.min(ttl, 3600); // Max 1 hour

    const payload = {
      sub: device_external_id,
      parent_id: parent_id,           // Critical for RLS
      role: "device",
      iat: now,
      exp: getNumericDate(maxTtl)
    };

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);

    return json({ 
      token,
      expires_in: maxTtl,
      expires_at: now + maxTtl
    });

  } catch (e) {
    console.error("Device JWT error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});