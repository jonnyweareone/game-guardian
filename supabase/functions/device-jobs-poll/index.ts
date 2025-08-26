
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { verifyDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  console.log('device-jobs-poll: Function invoked');

  try {
    // Verify Device JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log('device-jobs-poll: Missing Device JWT');
      return json({ error: "Missing Device JWT" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { ok, deviceCode, error: verifyError } = await verifyDeviceJWT(token);
    if (!ok || !deviceCode) {
      console.error('device-jobs-poll: Invalid Device JWT', verifyError);
      return json({ error: "Unauthorized", details: verifyError }, { status: 401 });
    }

    console.log('device-jobs-poll: Device JWT verified', { deviceCode });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get device ID from device code
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('device_code', deviceCode)
      .single();

    if (deviceError || !device) {
      console.error('device-jobs-poll: Device not found', deviceError);
      return json({ error: 'Device not found' }, { status: 404 });
    }

    console.log('device-jobs-poll: Looking for queued jobs for device', device.id);

    // Find next queued job for this device
    const { data: job, error: jobError } = await supabase
      .from('device_jobs')
      .select('id, type, payload, status')
      .eq('device_id', device.id)
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (jobError) {
      console.error('device-jobs-poll: Error fetching jobs', jobError);
      return json({ error: 'Failed to fetch jobs' }, { status: 400 });
    }

    if (!job) {
      console.log('device-jobs-poll: No queued jobs found');
      return json({ ok: true, job: null });
    }

    console.log('device-jobs-poll: Found job', { id: job.id, type: job.type });

    // Mark job as running
    const { error: updateError } = await supabase
      .from('device_jobs')
      .update({ 
        status: 'running', 
        attempts: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (updateError) {
      console.error('device-jobs-poll: Error updating job status', updateError);
      return json({ error: 'Failed to update job status' }, { status: 400 });
    }

    console.log('device-jobs-poll: Job marked as running');

    return json({ ok: true, job });

  } catch (error: any) {
    console.error('device-jobs-poll: Unexpected error', error);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});
