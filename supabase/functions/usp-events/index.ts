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
    const { parent_id, deviceId, topic, ts, uspBase64 } = await req.json();
    
    if (!parent_id || !deviceId || !topic || !uspBase64) {
      return json({ error: "Missing required fields: parent_id, deviceId, topic, uspBase64" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Insert USP event with proper parent scoping
    const { error } = await supabase
      .from("usp_events_raw")
      .insert({
        parent_id,
        device_external_id: deviceId,
        topic,
        ts: ts ? new Date(ts).toISOString() : new Date().toISOString(),
        usp_b64: uspBase64
      });

    if (error) {
      console.error("Error inserting USP event:", error);
      return json({ error: "Failed to store event" }, { status: 500 });
    }

    return json({ ok: true });

  } catch (e) {
    console.error("USP events error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});