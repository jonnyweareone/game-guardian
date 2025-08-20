
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Authorization required" }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: "Invalid token" }, { status: 401 });
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").slice(-1)[0]; // Get last segment

    // GET /rewards - List parent's rewards
    if (path === "rewards" && req.method === "GET") {
      const { data, error } = await supabase
        .from("parent_rewards")
        .select("*")
        .eq("parent_user_id", userData.user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return json({ ok: true, rewards: data });
    }

    // POST /rewards - Create new reward
    if (path === "rewards" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("parent_rewards")
        .insert({
          parent_user_id: userData.user.id,
          name: body.name,
          description: body.description,
          coin_cost: body.coin_cost,
        })
        .select("*")
        .single();
      
      if (error) throw error;
      return json({ ok: true, reward: data });
    }

    // GET /wallet/:childId - Get child's wallet
    if (path.startsWith("wallet") && req.method === "GET") {
      const childId = url.searchParams.get("child_id");
      if (!childId) {
        return json({ error: "child_id required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("child_id", childId)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return default wallet if none exists
      const wallet = data || { child_id: childId, coins: 0 };
      return json({ ok: true, wallet });
    }

    // POST /request - Request reward
    if (path === "request" && req.method === "POST") {
      const { child_id, reward_id, note } = await req.json();
      
      const { data, error } = await supabase.rpc("request_reward", {
        p_child: child_id,
        p_reward: reward_id,
        p_note: note,
      });
      
      if (error) throw error;
      return json({ ok: true, redemption_id: data });
    }

    // POST /decide - Approve/reject redemption
    if (path === "decide" && req.method === "POST") {
      const { redemption_id, approve, note } = await req.json();
      
      const { data, error } = await supabase.rpc("decide_reward", {
        p_redemption: redemption_id,
        p_approve: approve,
        p_decided_by: userData.user.id,
        p_note: note,
      });
      
      if (error) throw error;
      return json({ ok: true, result: data });
    }

    // GET /redemptions - List redemptions
    if (path === "redemptions" && req.method === "GET") {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(`
          *,
          parent_rewards!inner(name, description, coin_cost),
          children!inner(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return json({ ok: true, redemptions: data });
    }

    return json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Nova rewards error:", error);
    return json({ error: error.message }, { status: 500 });
  }
});
