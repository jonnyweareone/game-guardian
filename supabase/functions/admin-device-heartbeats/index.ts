/**
 * Supabase Edge Function: admin-device-heartbeats
 * - Auth: Bearer admin_jwt (admin required)
 * - Query params: device_id, hours, page, page_size
 * - Returns: paginated heartbeat logs from audit_log
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const url = new URL(req.url);
    
    // Parse query parameters
    const deviceId = url.searchParams.get("device_id");
    const hours = parseInt(url.searchParams.get("hours") || "24");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("page_size") || "50"), 100);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin auth
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userRes, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userRes.user) {
      return json({ error: "Authentication failed" }, { status: 401 });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin status
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userRes.user.id)
      .single();

    if (!profile?.is_admin) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    // Calculate time filter
    const sinceTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Build query for heartbeat logs
    let query = serviceClient
      .from("audit_log")
      .select(`
        created_at,
        target,
        detail,
        id
      `, { count: "exact" })
      .eq("action", "device_heartbeat")
      .gte("created_at", sinceTime);

    // Filter by device if specified
    if (deviceId) {
      query = query.eq("target", deviceId);
    }

    // Apply pagination and ordering
    const from = (page - 1) * pageSize;
    query = query
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const { data: heartbeats, error: queryErr, count } = await query;

    if (queryErr) {
      console.error("Query error:", queryErr);
      return json({ error: "Failed to fetch heartbeats" }, { status: 500 });
    }

    // Enhance heartbeat data with device info
    const deviceIds = [...new Set(heartbeats?.map(h => h.target).filter(Boolean) || [])];
    let deviceMap: Record<string, any> = {};

    if (deviceIds.length > 0) {
      const { data: devices } = await serviceClient
        .from("vw_admin_devices")
        .select("id, device_code, device_name, parent_name, child_name")
        .in("id", deviceIds);

      deviceMap = Object.fromEntries(devices?.map(d => [d.id, d]) || []);
    }

    // Format response
    const formattedHeartbeats = heartbeats?.map(heartbeat => {
      const device = deviceMap[heartbeat.target];
      const detail = typeof heartbeat.detail === 'string' 
        ? JSON.parse(heartbeat.detail) 
        : heartbeat.detail;

      return {
        id: heartbeat.id,
        timestamp: heartbeat.created_at,
        device_id: heartbeat.target,
        device_code: device?.device_code,
        device_name: device?.device_name,
        parent_name: device?.parent_name,
        child_name: device?.child_name,
        payload: detail || {},
      };
    }) || [];

    return json({
      heartbeats: formattedHeartbeats,
      pagination: {
        page,
        page_size: pageSize,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
    });

  } catch (error) {
    console.error("admin-device-heartbeats error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
});