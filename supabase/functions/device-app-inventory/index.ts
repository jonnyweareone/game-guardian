import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InventoryRow {
  device_id: string;
  app_id: string;
  name: string;
  version?: string;
  source: 'apt' | 'snap' | 'flatpak' | 'web' | 'desktop' | 'appimage';
  installed_by: string;
  first_seen?: string;
  seen_at?: string;
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

    // Parse request body
    const body = await req.json().catch(() => null);
    if (!Array.isArray(body) || body.length === 0) {
      return json({ error: 'Body must be non-empty array' }, 400);
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

    // Validate and normalize inventory rows
    const validRows: InventoryRow[] = [];
    const now = new Date().toISOString();

    for (const item of body) {
      if (!item || typeof item !== 'object') continue;
      
      const app_id = String(item.app_id || '').trim();
      const name = String(item.name || '').trim();
      const source = String(item.source || '').toLowerCase();
      
      // Accept all common sources we emit; default to 'desktop' if unknown
      const allowedSources = new Set(['apt','snap','flatpak','web','desktop','appimage']);
      const normSource = allowedSources.has(source) ? source : 'desktop';

      const installed_by = String(item.installed_by ?? 'agent').toLowerCase();
      // Be permissive; keep whatever the agent says (truncate to 24 chars to be safe)
      const normInstalledBy = installed_by.slice(0, 24);

      if (!app_id || !name) continue;

      validRows.push({
        device_id: deviceId,
        app_id,
        name,
        version: item.version ? String(item.version) : null,
        source: normSource as InventoryRow['source'],
        installed_by: normInstalledBy,
        first_seen: item.first_seen || now,
        seen_at: item.seen_at || now,
      });
    }

    if (validRows.length === 0) {
      return json({ error: 'No valid inventory rows found' }, 400);
    }

    console.log(`Processing ${validRows.length} inventory items for device ${deviceCode} (${deviceId})`);

    // Upsert inventory rows
    const { error: upsertError } = await supabase
      .from('device_app_inventory')
      .upsert(validRows, {
        onConflict: 'device_id,app_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return json({ error: 'Failed to update inventory', details: upsertError.message }, 500);
    }

    console.log(`Successfully processed ${validRows.length} inventory items`);
    return new Response(null, { status: 204, headers: corsHeaders });

  } catch (error) {
    console.error('Inventory processing error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
});