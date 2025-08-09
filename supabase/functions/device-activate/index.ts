// Supabase Edge Function: device-activate
// Finalize device activation (idempotent)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, { status: 401 });
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const deviceCode = body?.device_code as string | undefined;
    const deviceId = body?.device_id as string | undefined;

    if (!deviceCode && !deviceId) return json({ error: "Missing device identifier" }, { status: 400 });

    const query = supabase
      .from("devices")
      .select("id, parent_id, is_active, device_code")
      .maybeSingle();

    const { data: device, error: selErr } = deviceCode
      ? await query.eq("device_code", deviceCode)
      : await query.eq("id", deviceId!);

    if (selErr) return json({ error: selErr.message }, { status: 400 });
    if (!device) return json({ error: "Device not found" }, { status: 404 });

    if (device.parent_id !== user.id) return json({ error: "Forbidden" }, { status: 403 });

    const { error: updErr } = await supabase
      .from("devices")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", device.id);

    if (updErr) return json({ error: updErr.message }, { status: 400 });

    return json({ ok: true, device: { id: device.id, device_code: device.device_code } });
  } catch (e) {
    console.error("device-activate error", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
