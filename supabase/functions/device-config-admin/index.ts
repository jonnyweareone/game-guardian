/**
 * Supabase Edge Function: device-config-admin
 * - Auth: Bearer parent_jwt OR admin_jwt
 * - Body: { device_id, patch }
 * - Updates device_config for parent's devices or admin access
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { device_id, patch } = body;
    
    if (!device_id || !patch) {
      return json({ error: "Missing device_id or patch" }, { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use anon client to verify user auth
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userRes, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userRes.user) {
      return json({ error: "Authentication failed" }, { status: 401 });
    }

    const userId = userRes.user.id;

    // Use service role client for operations
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if user is admin or owns the device
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .single();

    const isAdmin = profile?.is_admin;

    // If not admin, verify device ownership
    if (!isAdmin) {
      const { data: device, error: deviceErr } = await serviceClient
        .from("devices")
        .select("id, profiles!inner(user_id)")
        .eq("id", device_id)
        .eq("profiles.user_id", userId)
        .maybeSingle();

      if (deviceErr || !device) {
        return json({ error: "Device not found or access denied" }, { status: 403 });
      }
    }

    // Get existing config or create new
    const { data: existingConfig } = await serviceClient
      .from("device_config")
      .select("*")
      .eq("device_id", device_id)
      .maybeSingle();

    const configUpdate = {
      device_id,
      ...existingConfig,
      ...patch,
      updated_at: new Date().toISOString(),
    };

    // Upsert device config
    const { error: upsertErr } = await serviceClient
      .from("device_config")
      .upsert(configUpdate, { onConflict: "device_id" });

    if (upsertErr) {
      console.error("Config update error:", upsertErr);
      return json({ error: "Failed to update device config" }, { status: 500 });
    }

    // Log to audit
    await serviceClient
      .from("audit_log")
      .insert({
        actor: `user:${userId}`,
        action: "device_config_update",
        target: `device:${device_id}`,
        detail: { patch, is_admin: isAdmin },
      })
      .then(({ error }) => {
        if (error) console.error("Audit log error:", error);
      });

    return json({ ok: true, device_id });
  } catch (error) {
    console.error("device-config-admin error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
});