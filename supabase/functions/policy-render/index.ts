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
  
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { parent_id, client_id, mac } = await req.json();

    if (!parent_id || (!client_id && !mac)) {
      return json({ error: "Missing required fields: parent_id and (client_id or mac)" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // 1) Resolve client by ID or MAC
    let clientQuery = supabase
      .from("cpe_clients")
      .select(`
        *,
        cpe_policy_assignments!inner(profile_id),
        child_id
      `)
      .eq("parent_id", parent_id);

    if (client_id) {
      clientQuery = clientQuery.eq("id", client_id);
    } else {
      clientQuery = clientQuery.eq("mac", mac);
    }

    const { data: clients, error: clientError } = await clientQuery;
    if (clientError) {
      console.error("Error fetching client:", clientError);
      return json({ error: "Failed to fetch client" }, { status: 500 });
    }

    const client = clients?.[0];

    // 2) Load assigned network profile
    let profile = null;
    if (client?.cpe_policy_assignments?.profile_id) {
      const { data: profiles, error: profileError } = await supabase
        .from("cpe_policy_profiles")
        .select("*")
        .eq("id", client.cpe_policy_assignments.profile_id)
        .eq("parent_id", parent_id);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        profile = profiles?.[0];
      }
    }

    // 3) Load child DNS profile if linked (using existing child_dns_profiles table)
    let childDnsProfile = null;
    if (client?.child_id) {
      const { data: dnsProfiles, error: dnsError } = await supabase
        .from("child_dns_profiles")
        .select("*")
        .eq("child_id", client.child_id);

      if (dnsError) {
        console.error("Error fetching child DNS profile:", dnsError);
      } else {
        childDnsProfile = dnsProfiles?.[0];
      }
    }

    // 4) Merge network profile + child DNS profile (child overrides network)
    const mergedPolicy = {
      nextdns_profile_id: childDnsProfile?.nextdns_config || profile?.nextdns_profile_id || null,
      doh_allowlist: profile?.category_blocks?.includes("advertising") 
        ? ["45.90.28.0/24", "1.1.1.1"] // Basic allowlist when blocking ads
        : ["1.1.1.1", "8.8.8.8"],     // Full allowlist otherwise
      quic_block: profile?.study_mode || false,
      kill_switch_mode: profile?.kill_switch_mode || "pause",
      l7_enabled: profile?.l7_enabled || false,
      vpn_detection: profile?.vpn_detection !== false,
      safe_search: profile?.safe_search !== false,
      category_blocks: profile?.category_blocks || [],
      bedtime: profile?.bedtime || {}
    };

    return json(mergedPolicy);

  } catch (e) {
    console.error("Policy render error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});