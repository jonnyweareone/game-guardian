
/**
 * Supabase Edge Function: device-heartbeat
 * - Auth: Bearer device_jwt (HS256)
 * - Body: { ui_version?, firmware_version?, monitoring_active?, creator_active? }
 * - Updates devices.last_seen and versions; logs audit entry
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { verify, Algorithm } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

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
    const body = await req.json().catch(() => ({}));
    const ui_version = body?.ui_version as string | undefined;
    const firmware_version = body?.firmware_version as string | undefined;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const deviceCode = (payload as any)?.sub as string;
    const { data: device, error: devErr } = await supabase
      .from("devices")
      .select("id")
      .eq("device_code", deviceCode)
      .maybeSingle();
    if (devErr || !device) return json({ error: "Device not found" }, { status: 404 });

    const patch: Record<string, unknown> = { last_seen: new Date().toISOString() };
    if (ui_version) patch.ui_version = ui_version;
    if (firmware_version) patch.firmware_version = firmware_version;

    const { error: updErr } = await supabase
      .from("devices")
      .update(patch)
      .eq("id", device.id);
    if (updErr) {
      console.error("device-heartbeat update error:", updErr);
      return json({ error: "Update failed" }, { status: 400 });
    }

    // Audit
    const { error: auditErr } = await supabase
      .from("audit_log")
      .insert({
        actor: `device:${deviceCode}`,
        action: "heartbeat",
        target: `devices:${device.id}`,
        detail: { ui_version, firmware_version },
      } as any);
    if (auditErr) console.error("device-heartbeat audit error:", auditErr);

    return json({ ok: true });
  } catch (e) {
    console.error("device-heartbeat error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
