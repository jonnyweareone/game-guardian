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
    const { device_code } = await req.json();
    if (!device_code) return json({ error: "device_code required" }, { status: 400 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    console.log(`Cleaning up device: ${device_code}`);

    // Reset device to inactive state
    const { error: deviceError } = await supabase
      .from('devices')
      .update({ 
        is_active: false,
        status: 'offline',
        child_id: null,
        device_jwt: null,
        updated_at: new Date().toISOString()
      })
      .eq('device_code', device_code);

    if (deviceError) {
      console.error("Device cleanup error:", deviceError);
      return json({ error: "Failed to cleanup device" }, { status: 500 });
    }

    // Clear any pending device jobs
    const { error: jobsError } = await supabase
      .from('device_jobs')
      .delete()
      .eq('device_id', device_code);

    if (jobsError) {
      console.warn("Failed to cleanup device jobs:", jobsError);
    }

    console.log(`Device ${device_code} cleaned up successfully`);
    return json({ ok: true });

  } catch (e) {
    console.error("device-cleanup error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});