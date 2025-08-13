
/**
 * Supabase Edge Function: rotate-device-token
 * - Auth: Parent (Supabase Auth JWT)
 * - Input: { device_id } where device_id is the device_code
 * - Checks ownership then mints a new device_jwt and stores/returns it
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
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
  if (req.method !== "POST") return json({ error: "POST required" }, { status: 405 });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, { status: 401 });

  try {
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, { status: 401 });
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const deviceCode = (body?.device_id as string | undefined)?.toUpperCase();
    if (!deviceCode) return json({ error: "device_id required" }, { status: 400 });

    // Check ownership
    const { data: device, error: devErr } = await anonClient
      .from("devices")
      .select("id, device_code")
      .eq("device_code", deviceCode)
      .eq("parent_id", user.id)
      .maybeSingle();
    if (devErr) return json({ error: "Query failed" }, { status: 400 });
    if (!device) return json({ error: "Device not found or not owned" }, { status: 404 });

    // Mint new token
    const secret = Deno.env.get("DEVICE_JWT_SECRET");
    if (!secret) return json({ error: "Server not configured" }, { status: 500 });

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const token = await create(
      { alg: "HS256", typ: "JWT" },
      { sub: deviceCode, role: "device", parent_id: user.id, exp: getNumericDate(60 * 60 * 24 * 30) },
      key
    );

    const { error: updErr } = await serviceClient
      .from("devices")
      .update({ device_jwt: token })
      .eq("id", device.id);
    if (updErr) return json({ error: "Failed to store token" }, { status: 400 });

    return json({ ok: true, device_jwt: token });
  } catch (e) {
    console.error("rotate-device-token error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
