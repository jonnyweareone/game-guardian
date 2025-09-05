import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get devices from demo schema
    const { data: devices, error: devError } = await supabase
      .from("demo.devices")
      .select("device_id, child, status, last_heartbeat, inserted_at")
      .order("last_heartbeat", { ascending: false });

    if (devError) {
      console.error("Devices query error:", devError);
    }

    // Get events from demo schema
    const { data: events, error: evError } = await supabase
      .from("demo.events")
      .select("id, device_id, type, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (evError) {
      console.error("Events query error:", evError);
    }

    return new Response(JSON.stringify({
      devices: devices || [],
      events: events || []
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Demo get data error:", error);
    return new Response(JSON.stringify({
      devices: [],
      events: [],
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});