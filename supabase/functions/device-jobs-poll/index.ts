
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

  console.log('device-jobs-poll: Function invoked');

  try {
    // Device authenticates with its device_jwt
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log('device-jobs-poll: No authorization header');
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log('device-jobs-poll: Looking for queued jobs');

    // Find next queued job for this device (RLS restricts to correct device_id)
    const { data: job, error: jobError } = await supabase
      .from('device_jobs')
      .select('id, type, payload, status')
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
