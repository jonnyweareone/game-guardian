import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UsageRow {
  device_id: string;
  app_id: string;
  name: string;
  started_at: string;
  ended_at: string;
  duration_s: number;
  exit_code?: number;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.substring(7);
    const jwtResult = await verifyDeviceJWT(token);
    
    if (!jwtResult.ok) {
      return json({ error: 'Invalid JWT', details: jwtResult.error }, 401);
    }

    const deviceCode = jwtResult.deviceCode!;

    // Parse request body (can be single object or array)
    const body = await req.json().catch(() => null);
    if (!body) {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const entries = Array.isArray(body) ? body : [body];
    if (entries.length === 0) {
      return json({ error: 'Empty usage data' }, 400);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find the device UUID from device_code
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('device_code', deviceCode)
      .single();

    if (deviceError || !device) {
      return json({ error: 'Device not found', deviceCode }, 404);
    }

    const deviceId = device.id;

    // Validate and normalize usage rows
    const validRows: UsageRow[] = [];

    for (const item of entries) {
      if (!item || typeof item !== 'object') continue;
      
      const app_id = String(item.app_id || '').trim();
      const name = String(item.name || '').trim();
      const started_at = item.started_at;
      const ended_at = item.ended_at;
      const duration_s = Number(item.duration_s);

      if (!app_id || !name || !started_at || !ended_at) continue;
      if (!Number.isFinite(duration_s) || duration_s < 0) continue;

      // Validate ISO timestamps
      if (isNaN(Date.parse(started_at)) || isNaN(Date.parse(ended_at))) continue;

      validRows.push({
        device_id: deviceId,
        app_id,
        name,
        started_at,
        ended_at,
        duration_s,
        exit_code: item.exit_code !== undefined ? Number(item.exit_code) : null,
      });
    }

    if (validRows.length === 0) {
      return json({ error: 'No valid usage rows found' }, 400);
    }

    console.log(`Processing ${validRows.length} usage entries for device ${deviceCode} (${deviceId})`);

    // Insert usage rows
    const { error: insertError } = await supabase
      .from('device_app_usage')
      .insert(validRows);

    if (insertError) {
      console.error('Usage insert error:', insertError);
      return json({ error: 'Failed to insert usage data', details: insertError.message }, 500);
    }

    console.log(`Successfully inserted ${validRows.length} usage entries`);
    return new Response(null, { status: 204, headers: corsHeaders });

  } catch (error) {
    console.error('Usage processing error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
});