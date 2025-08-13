/**
 * Supabase Edge Function: admin-list-devices
 * - Auth: Bearer admin_jwt (admin required)
 * - Query params: q (search), parent_email, page, page_size, order
 * - Returns: paginated device list with parent/child data
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
    const q = url.searchParams.get("q") || "";
    const parentEmail = url.searchParams.get("parent_email") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("page_size") || "50"), 100);
    const order = url.searchParams.get("order") || "created_at";
    const status = url.searchParams.get("status") || "";

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

    // Build query with filters
    let query = serviceClient
      .from("vw_admin_devices")
      .select("*", { count: "exact" });

    // Apply search filters
    if (q) {
      query = query.or(`device_code.ilike.%${q}%,parent_email.ilike.%${q}%,child_name.ilike.%${q}%`);
    }

    if (parentEmail) {
      query = query.ilike("parent_email", `%${parentEmail}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Apply ordering
    const [orderField, orderDirection] = order.split(":");
    query = query.order(orderField, { ascending: orderDirection !== "desc" });

    // Apply pagination
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data: devices, error: queryErr, count } = await query;

    if (queryErr) {
      console.error("Query error:", queryErr);
      return json({ error: "Failed to fetch devices" }, { status: 500 });
    }

    return json({
      devices: devices || [],
      pagination: {
        page,
        page_size: pageSize,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("admin-list-devices error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
});