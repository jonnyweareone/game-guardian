import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (data: any, status = 200) => 
  new Response(JSON.stringify(data), { 
    status, 
    headers: { ...corsHeaders, "content-type": "application/json" } 
  });

const NEXTDNS_API_BASE = "https://api.nextdns.io";

async function createNextDNSConfig(name: string, apiKey: string) {
  const response = await fetch(`${NEXTDNS_API_BASE}/configs`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`createNextDNSConfig: ${response.status} ${error}`);
  }
  
  return await response.json();
}

async function listNextDNSConfigs(apiKey: string) {
  const response = await fetch(`${NEXTDNS_API_BASE}/configs`, {
    headers: { "X-Api-Key": apiKey },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`listNextDNSConfigs: ${response.status} ${error}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { device_id, household_id, config_name } = await req.json();
    
    if (!device_id) {
      return json({ ok: false, error: 'device_id is required' }, 400);
    }

    const nextdnsApiKey = Deno.env.get('NEXTDNS_API_KEY');
    if (!nextdnsApiKey) {
      return json({ ok: false, error: 'NextDNS API key not configured' }, 500);
    }

    // Find device and parent to determine household
    const { data: device } = await supabase
      .from('devices')
      .select('parent_id')
      .eq('device_code', device_id)
      .single();

    const parentId = device?.parent_id || household_id;
    if (!parentId) {
      return json({ ok: false, error: 'Cannot determine household for device' }, 400);
    }

    // Check if household already has a NextDNS config
    const { data: existingConfig } = await supabase
      .from('household_dns_configs')
      .select('*')
      .eq('parent_user_id', parentId)
      .single();

    if (existingConfig) {
      return json({ 
        ok: true, 
        configId: existingConfig.nextdns_config_id,
        existing: true 
      });
    }

    // Create or find NextDNS config
    const targetName = config_name ?? `Guardian ${parentId.slice(0, 8)}`;
    const configs = await listNextDNSConfigs(nextdnsApiKey);
    let nextdnsConfig = configs.find((c: any) => c.name === targetName);

    if (!nextdnsConfig) {
      nextdnsConfig = await createNextDNSConfig(targetName, nextdnsApiKey);
    }

    // Store the config in our database
    const { error: insertError } = await supabase
      .from('household_dns_configs')
      .insert({
        parent_user_id: parentId,
        nextdns_config_id: nextdnsConfig.id,
        config_name: nextdnsConfig.name
      });

    if (insertError) {
      console.error('Error storing NextDNS config:', insertError);
      return json({ ok: false, error: 'Failed to store NextDNS config' }, 500);
    }

    return json({ 
      ok: true, 
      configId: nextdnsConfig.id,
      configName: nextdnsConfig.name,
      created: !configs.find((c: any) => c.name === targetName)
    });

  } catch (error) {
    console.error('Error in provision-nextdns:', error);
    return json({ ok: false, error: String(error) }, 500);
  }
});