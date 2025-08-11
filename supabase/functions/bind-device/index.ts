
/**
 * Supabase Edge Function: bind-device
 * - Requires a logged-in parent (Authorization: Bearer <access_token>)
 * - Upserts the device row (parent-owned), marks active, and mints a device_jwt
 * - Stores device_jwt in devices for polling via device-status
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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Identify the current user
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, { status: 401 });
    const user = userData.user;

    // Parse body
    const body = await req.json().catch(() => ({}));
    const deviceCode = body?.device_id as string | undefined;
    const deviceName = body?.device_name as string | undefined;
    if (!deviceCode) return json({ error: "device_id required" }, { status: 400 });

    // Prepare row to upsert into public.devices (RLS enforces auth.uid() = parent_id)
    const row: Record<string, unknown> = {
      device_code: deviceCode,
      parent_id: user.id,
      is_active: true,
      paired_at: new Date().toISOString(),
    };
    if (deviceName) row.device_name = deviceName;

    // Upsert by unique device_code; if owned by another account, this will fail due to RLS/permissions
    const { data: upserted, error: upsertErr } = await supabase
      .from("devices")
      .upsert(row, { onConflict: "device_code" })
      .select("id, device_code")
      .single();

    if (upsertErr) {
      console.error("bind-device upsert error:", upsertErr);
      // Most likely the device_code is already owned by another account
      return json({ error: "This device is already paired to another account." }, { status: 409 });
    }

    // Sign device JWT using shared secret
    const secret = Deno.env.get("DEVICE_JWT_SECRET");
    if (!secret) {
      console.error("Missing DEVICE_JWT_SECRET");
      return json({ error: "Server is not configured" }, { status: 500 });
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const token = await create(
      { alg: "HS256", typ: "JWT" },
      {
        sub: deviceCode,
        role: "device",
        parent_id: user.id,
        exp: getNumericDate(60 * 60 * 24 * 30), // 30 days
      },
      key
    );

    // Cache token on the device row for device polling
    const { error: updErr } = await supabase
      .from("devices")
      .update({ device_jwt: token, is_active: true })
      .eq("device_code", deviceCode);

    if (updErr) {
      console.error("bind-device update token error:", updErr);
      return json({ error: "Failed to store device token" }, { status: 400 });
    }

    return json({ ok: true, device_jwt: token, device_code: deviceCode });
  } catch (e) {
    console.error("bind-device error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
