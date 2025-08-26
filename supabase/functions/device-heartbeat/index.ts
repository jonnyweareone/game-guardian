
/**
 * Supabase Edge Function: device-heartbeat
 * - Auth: Bearer device_jwt (HS256)
 * - Body: { ui_version?, firmware_version?, monitoring_active?, creator_active? }
 * - Updates devices.last_seen and versions; logs audit entry
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { verifyDeviceJWT } from "../_shared/jwt.ts";

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
    const body = await req.json().catch(() => ({}));
    const ui_version = body?.ui_version as string | undefined;
    const firmware_version = body?.firmware_version as string | undefined;
    const build_id = body?.build_id as string | undefined;
    const os_version = body?.os_version as string | undefined;
    const kernel_version = body?.kernel_version as string | undefined;
    const model = body?.model as string | undefined;
    const location = body?.location as Record<string, any> | undefined;

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

    const patch: Record<string, unknown> = { 
      last_seen: new Date().toISOString(),
      last_ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    };
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
