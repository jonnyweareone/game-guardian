
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Mark devices offline if no heartbeat in last 120 seconds (2 minutes)
    const { error } = await supabase.rpc('mark_devices_offline_if_stale', { 
      grace_seconds: 120 
    });

    if (error) {
      console.error("mark_devices_offline_if_stale error:", error);
      return json({ error: error.message }, { status: 400 });
    }

    return json({ ok: true });
  } catch (e) {
    console.error("devices-mark-offline error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
