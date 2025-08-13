import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify, Algorithm } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey"
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...CORS, ...(init.headers || {}) }
  });
}

async function verifyDeviceJwt(h?: string) {
  if (!h?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = h.slice(7);
  const secret = Deno.env.get("DEVICE_JWT_SECRET")!;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const payload = await verify(token, key, "HS256" as Algorithm) as any;
  return { device_code: payload?.sub || payload?.device_code };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const { device_code } = await verifyDeviceJwt(req.headers.get("Authorization") || undefined);

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(url, key, { auth: { persistSession: false } });

    // Resolve device → UUID
    const { data: device, error: e1 } = await svc
      .from("devices")
      .select("id")
      .eq("device_code", device_code)
      .single();
    if (e1 || !device) return json({ error: "Device not found" }, { status: 404 });

    // Active child (many-to-many assignment table)
    const { data: assign } = await svc
      .from("device_child_assignments")
      .select("child_id")
      .eq("device_id", device.id)
      .eq("is_active", true)
      .maybeSingle();

    // Essentials from catalog
    const { data: essentials, error: e2 } = await svc
      .from("app_catalog")
      .select("id, name, category, is_essential, platform, version, description, enabled")
      .eq("is_essential", true)
      .eq("enabled", true);

    if (e2) throw e2;

    // Child-selected
    let chosen: any[] = [];
    if (assign?.child_id) {
      const { data, error } = await svc
        .from("child_app_selections")
        .select("selected, app_id, app_catalog:app_id ( id, name, category, is_essential, platform, version, description, enabled )")
        .eq("child_id", assign.child_id)
        .eq("selected", true);
      if (error) throw error;
      chosen = (data || []).map((r: any) => r.app_catalog).filter((a: any) => a?.enabled);
    }

    // Merge + dedupe by id
    const map = new Map<string, any>();
    for (const a of essentials || []) if (a?.id && a.enabled) map.set(a.id, a);
    for (const a of chosen || []) if (a?.id && a.enabled) map.set(a.id, a);

    const apps = [...map.values()].map((a: any) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      platform: a.platform,
      version: a.version,
      description: a.description
    }));

    return json({ device_code, child_id: assign?.child_id || null, apps });
  } catch (e) {
    return json({ error: e.message || "Unauthorized" }, { status: 401 });
  }
});