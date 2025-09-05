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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Handle GET requests or POST requests with action: 'get' for retrieving demo data
  if (req.method === 'GET' || (req.method === 'POST' && (await req.clone().json().catch(() => null))?.action === 'get')) {
    try {
      // Return demo data
      const [devicesResult, eventsResult] = await Promise.all([
        supabase
          .from('demo.devices')
          .select('*')
          .order('last_heartbeat', { ascending: false, nullsLast: true }),
        
        supabase
          .from('demo.events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(200)
      ]);

      const devices = devicesResult.data || [];
      const events = eventsResult.data || [];

      return new Response(JSON.stringify({ devices, events }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (error) {
      console.error('Failed to fetch demo data:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch demo data' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { type, device_id, child, payload } = body || {};
    
    if (!type || !device_id) {
      return new Response(JSON.stringify({ ok: false, error: "Missing type or device_id" }), { 
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    console.log(`Demo ingest: ${type} from ${device_id}`, payload);

    // Upsert device
    const deviceUpdate: any = {
      device_id,
      child: child ?? null,
    };

    if (type === "sleep") {
      deviceUpdate.status = "sleeping";
    } else if (type === "heartbeat") {
      deviceUpdate.status = "online";
      deviceUpdate.last_heartbeat = new Date().toISOString();
    }

    const { error: deviceError } = await supabase
      .from("demo.devices")
      .upsert(deviceUpdate, { onConflict: "device_id" });

    if (deviceError) {
      console.error("Device upsert error:", deviceError);
      throw deviceError;
    }

    // Insert event
    const { error: eventError } = await supabase
      .from("demo.events")
      .insert({
        device_id,
        type,
        payload: payload ?? {}
      });

    if (eventError) {
      console.error("Event insert error:", eventError);
      throw eventError;
    }

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Demo ingest error:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});