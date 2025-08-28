
/**
 * Supabase Edge Function: device-heartbeat
 * - Auth: Bearer device_jwt (HS256)
 * - Body: { ui_version?, firmware_version?, monitoring_active?, creator_active? }
 * - Updates devices.last_seen and versions; logs audit entry
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { verifyDeviceJWT } from "../_shared/jwt.ts";

/** Tolerant JSON parsing even if Content-Type is wrong */
async function parseBody(req: Request): Promise<Record<string, unknown>> {
  const raw = await req.text();
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
}

/** First valid IP from XFF / X-Real-IP (inet-safe); else undefined */
function extractClientIp(req: Request): string | undefined {
  const list = [
    ...(req.headers.get("x-forwarded-for") ?? "").split(",").map(s => s.trim()).filter(Boolean),
    (req.headers.get("x-real-ip") ?? "").trim(),
  ].filter(Boolean);

  for (const ip of list) {
    // Accept IPv4 or IPv6, reject junk like "unknown" or comma lists
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^[0-9a-f:]+$/i.test(ip)) return ip;
  }
  return undefined;
}

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

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "Missing Device JWT" }, { status: 401 });
  
  const token = auth.slice(7);
  const { ok, deviceCode, error: verifyError } = await verifyDeviceJWT(token);
  if (!ok || !deviceCode) {
    console.error("device-heartbeat auth error:", verifyError);
    return json({ error: "Unauthorized", details: verifyError }, { status: 401 });
  }

  try {
    // Parse body safely (works even with missing/wrong Content-Type)
    const body = await parseBody(req);
    const nowSec = Math.floor(Date.now() / 1000);
    const ts = typeof body.ts === "number" ? body.ts : nowSec;
    const lastSeenIso = new Date(ts * 1000).toISOString();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Find device by device code from JWT
    const { data: device, error: devErr } = await supabase
      .from("devices")
      .select("id")
      .eq("device_code", deviceCode)
      .maybeSingle();
    if (devErr || !device) return json({ error: "Device not found" }, { status: 404 });

    // Build patch — safe IP extraction and version mapping
    const patch: Record<string, unknown> = { 
      last_seen: lastSeenIso,
      status: 'online'
    };

    // Map incoming "version" → ui_version (only if provided)
    if (typeof body.version === "string" && body.version.length > 0) {
      patch.ui_version = body.version;
    }

    // inet-safe last_ip: only first valid IP; omit if none
    const ip = extractClientIp(req);
    if (ip) patch.last_ip = ip;

    // Handle other version fields
    const ui_version = body?.ui_version as string | undefined;
    const firmware_version = body?.firmware_version as string | undefined;
    const build_id = body?.build_id as string | undefined;
    const os_version = body?.os_version as string | undefined;
    const kernel_version = body?.kernel_version as string | undefined;
    const model = body?.model as string | undefined;
    const location = body?.location as Record<string, any> | undefined;

    if (ui_version) patch.ui_version = ui_version;
    if (firmware_version) patch.firmware_version = firmware_version;
    if (build_id) patch.build_id = build_id;
    if (os_version) patch.os_version = os_version;
    if (kernel_version) patch.kernel_version = kernel_version;
    if (model) patch.model = model;
    if (location) patch.location = location;

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
        detail: { ui_version, firmware_version, build_id, os_version, kernel_version, model, location },
      } as any);
    if (auditErr) console.error("device-heartbeat audit error:", auditErr);

    return json({ ok: true });
  } catch (e) {
    console.error("device-heartbeat error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
