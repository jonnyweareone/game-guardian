
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

  console.log('device-jobs-report: Function invoked');

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log('device-jobs-report: No authorization header');
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json().catch(() => ({}));
    const { id, status, log } = body;

    console.log('device-jobs-report: Request parsed', { id, status, has_log: !!log });

    if (!id || !status) {
      return json({ error: "id and status required" }, { status: 400 });
    }

    if (!['done', 'failed'].includes(status)) {
      return json({ error: "status must be 'done' or 'failed'" }, { status: 400 });
    }

    // Update job status
    const { error: updateError } = await supabase
      .from('device_jobs')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('device-jobs-report: Error updating job', updateError);
      return json({ error: 'Failed to update job status' }, { status: 400 });
    }

    console.log('device-jobs-report: Job status updated', { id, status });

    // Optional: write logs
    if (log && typeof log === 'string') {
      const { error: logError } = await supabase
        .from('device_job_logs')
        .insert({ job_id: id, log });

      if (logError) {
        console.error('device-jobs-report: Error saving log', logError);
        // Don't fail the request for log errors
      } else {
        console.log('device-jobs-report: Log saved');
      }
    }

    return json({ ok: true });

  } catch (error: any) {
    console.error('device-jobs-report: Unexpected error', error);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});
