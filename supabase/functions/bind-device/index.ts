
/**
 * Supabase Edge Function: bind-device
 * - Requires a logged-in parent (Authorization: Bearer <access_token>)
 * - Upserts the device row (parent-owned), marks active, and mints a device_jwt
 * - Stores device_jwt in devices for polling via device-status
 * - NEW: records activation consent and starts a 30-day trial subscription if none exists
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

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Service-role client for privileged writes (bypass RLS)
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    // Identify the current user (parent)
    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, { status: 401 });
    const user = userData.user;

    // Parse body
    const body = await req.json().catch(() => ({}));
    const deviceCode = (body?.device_id as string | undefined)?.toUpperCase();
    const deviceName = body?.device_name as string | undefined;
    const childId = body?.child_id as string | undefined;
    const consentVersion = (body?.consent_version as string | undefined) ?? "1.0";

    if (!deviceCode) return json({ error: "device_id required" }, { status: 400 });

    // Optionally validate child belongs to this parent
    let validChildId: string | null = null;
    if (childId) {
      const { data: child, error: childErr } = await anonClient
        .from("children")
        .select("id")
        .eq("id", childId)
        .eq("parent_id", user.id)
        .maybeSingle();
      if (childErr) {
        console.error("bind-device child lookup error:", childErr);
        return json({ error: "Failed to validate child" }, { status: 400 });
      }
      validChildId = child ? child.id : null;
      if (childId && !validChildId) {
        return json({ error: "Child not found or not owned by parent" }, { status: 403 });
      }
    }

    // Upsert device by device_code (unique)
    const row: Record<string, unknown> = {
      device_code: deviceCode,
      parent_id: user.id,
      is_active: true,
      paired_at: new Date().toISOString(),
    };
    if (deviceName) row.device_name = deviceName;
    if (validChildId) row.child_id = validChildId;

    const { data: upserted, error: upsertErr } = await anonClient
      .from("devices")
      .upsert(row, { onConflict: "device_code" })
      .select("id, device_code, parent_id")
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

    // Cache token on the device row for device polling (if column exists)
    const { error: updErr } = await anonClient
      .from("devices")
      .update({ device_jwt: token, is_active: true })
      .eq("device_code", deviceCode);

    if (updErr) {
      console.error("bind-device update token error:", updErr);
      // Continue; token will still be returned to caller
    }

    // Record device activation consent (service role)
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      undefined;
    const ua = req.headers.get("user-agent") || undefined;

    // We need device UUID for device_activations and device_config linkage
    const deviceId = upserted.id as string;

    const { error: actErr } = await serviceClient
      .from("device_activations")
      .insert({
        device_id: deviceId,
        user_id: user.id,
        consent_version: consentVersion,
        consent_ip: ip,
        consent_user_agent: ua,
      } as any); // cast for safety if types lag

    if (actErr) {
      console.error("bind-device activation insert error:", actErr);
      // Non-fatal
    }

    // Ensure device_config row exists for this device (service role)
    const { data: cfg, error: cfgSelErr } = await serviceClient
      .from("device_config")
      .select("device_id")
      .eq("device_id", deviceId)
      .maybeSingle();
    if (cfgSelErr) {
      console.error("bind-device device_config select error:", cfgSelErr);
    }
    if (!cfg) {
      const { error: cfgInsErr } = await serviceClient
        .from("device_config")
        .insert({
          device_id: deviceId,
          features: { monitoring: false, creator: false },
        } as any);
      if (cfgInsErr) console.error("bind-device device_config insert error:", cfgInsErr);
    }

    // Start 30-day trial subscription if none exists (service role)
    const { data: subRow, error: subErr } = await serviceClient
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subErr) {
      console.error("bind-device subscriptions select error:", subErr);
    }
    if (!subRow) {
      const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error: subInsErr } = await serviceClient
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "trial",
          status: "trialing",
          trial_ends_at: trialEnds,
        } as any);
      if (subInsErr) console.error("bind-device subscriptions insert error:", subInsErr);
    }

    return json({ ok: true, device_jwt: token, device_code: deviceCode });
  } catch (e) {
    console.error("bind-device error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
