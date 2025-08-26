
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-device-id"
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...(init.headers || {}) }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    // Verify Device JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing Device JWT" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { ok, deviceCode, error: verifyError } = await verifyDeviceJWT(token);
    if (!ok || !deviceCode) {
      console.error("device-app-manifest auth error:", verifyError);
      return json({ error: "Unauthorized", details: verifyError }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Resolve device → UUID
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id")
      .eq("device_code", deviceCode)
      .single();
    if (deviceError || !device) return json({ error: "Device not found" }, { status: 404 });

    // Active child (many-to-many assignment table)
    const { data: assign } = await supabase
      .from("device_child_assignments")
      .select("child_id")
      .eq("device_id", device.id)
      .eq("is_active", true)
      .maybeSingle();

    // Essentials from catalog
    const { data: essentials, error: essentialsError } = await supabase
      .from("app_catalog")
      .select("id, name, category, is_essential, platform, version, description, enabled, icon_url")
      .eq("is_essential", true)
      .eq("enabled", true);

    if (essentialsError) throw essentialsError;

    // Child-selected apps
    let chosen: any[] = [];
    if (assign?.child_id) {
      const { data, error } = await supabase
        .from("child_app_selections")
        .select("selected, app_id, app_catalog:app_id ( id, name, category, is_essential, platform, version, description, enabled, icon_url )")
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
      description: a.description,
      icon_url: a.icon_url
    }));

    // Fetch DNS configuration for active child
    let dnsConfig = null;
    if (assign?.child_id) {
      const { data: dnsProfile } = await supabase
        .from("child_dns_profiles")
        .select("nextdns_config, school_hours_enabled, bypass_until, bypass_reason")
        .eq("child_id", assign.child_id)
        .maybeSingle();
      
      if (dnsProfile) {
        dnsConfig = {
          profile_id: dnsProfile.nextdns_config,
          school_hours_enabled: dnsProfile.school_hours_enabled,
          bypass_until: dnsProfile.bypass_until,
          bypass_reason: dnsProfile.bypass_reason,
          dns_servers: [
            `${dnsProfile.nextdns_config}.dns1.nextdns.io`,
            `${dnsProfile.nextdns_config}.dns2.nextdns.io`
          ]
        };
      }
    }

    return json({ 
      device_code: deviceCode, 
      child_id: assign?.child_id || null, 
      apps,
      dns_config: dnsConfig
    });
  } catch (e) {
    console.error("device-app-manifest error:", e);
    return json({ error: e.message || "Internal error" }, { status: 500 });
  }
});
