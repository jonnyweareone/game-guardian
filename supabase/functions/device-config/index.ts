
/**
 * Supabase Edge Function: device-config
 * - Auth: Bearer device_jwt (HS256 with DEVICE_JWT_SECRET)
 * - Returns device config + update flags + trial/billing signals
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { verify, decode, Algorithm } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

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

async function verifyDeviceJwt(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return { error: "Unauthorized" };
  const token = authHeader.replace("Bearer ", "").trim();
  const secret = Deno.env.get("DEVICE_JWT_SECRET");
  if (!secret) return { error: "Server not configured" };
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  try {
    const payload = (await verify(token, key, "HS256" as Algorithm)) as any;
    return { payload, token };
  } catch {
    return { error: "Invalid token" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  const { payload, error } = await verifyDeviceJwt(authHeader);
  if (error) return json({ error }, { status: 401 });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const deviceCode = (payload as any)?.sub as string;
    if (!deviceCode) return json({ error: "Token missing device_id" }, { status: 400 });

    // Map device_code -> device UUID + parent
    const { data: device, error: devErr } = await supabase
      .from("devices")
      .select("id, parent_id, ui_version, firmware_version")
      .eq("device_code", deviceCode)
      .maybeSingle();
    if (devErr || !device) return json({ error: "Device not found" }, { status: 404 });

    // Ensure device_config exists
    const { data: cfg, error: cfgErr } = await supabase
      .from("device_config")
      .select("*")
      .eq("device_id", device.id)
      .maybeSingle();

    let config = cfg;
    if (cfgErr) {
      console.error("device-config select error:", cfgErr);
      return json({ error: "Failed to load config" }, { status: 400 });
    }

    if (!config) {
      const defaultCfg = {
        device_id: device.id,
        features: { monitoring: false, creator: false },
      } as any;
      const { data: inserted, error: insErr } = await supabase
        .from("device_config")
        .insert(defaultCfg)
        .select("*")
        .single();
      if (insErr) return json({ error: "Failed to init config" }, { status: 400 });
      config = inserted;
    }

    // Trial/billing flags
    let trial_remaining_days: number | null = null;
    let billable = false;

    if (device.parent_id) {
      const { data: sub, error: subErr } = await supabase
        .from("subscriptions")
        .select("status, trial_ends_at, current_period_end, plan")
        .eq("user_id", device.parent_id)
        .maybeSingle();

      if (!subErr && sub?.trial_ends_at) {
        const now = Date.now();
        const end = new Date(sub.trial_ends_at).getTime();
        const remainingMs = Math.max(0, end - now);
        trial_remaining_days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      }

      const features = (config.features || {}) as Record<string, unknown>;
      const monitoring = !!features["monitoring"];
      const creator = !!features["creator"];

      const trialOver = trial_remaining_days !== null && trial_remaining_days <= 0;
      billable = trialOver && (monitoring || creator);
    }

    return json({
      device_code: deviceCode,
      ui_version: device.ui_version,
      firmware_version: device.firmware_version,
      manifest_url: config.manifest_url ?? null,
      theme: config.theme ?? {},
      features: config.features ?? {},
      firmware_update: config.firmware_update ?? null,
      ui_update: config.ui_update ?? null,
      factory_reset: !!config.factory_reset,
      updated_at: config.updated_at,
      trial_remaining_days,
      billable,
    });
  } catch (e) {
    console.error("device-config error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
