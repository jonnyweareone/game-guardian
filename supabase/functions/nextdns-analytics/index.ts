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

async function getNextDNSAnalytics(configId: string, profileId: string, from: string, to: string, apiKey: string) {
  const params = new URLSearchParams({
    from,
    to,
    ...(profileId && { profile: profileId })
  });

  const response = await fetch(`${NEXTDNS_API_BASE}/configs/${configId}/analytics/status?${params}`, {
    headers: { "X-Api-Key": apiKey }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`getNextDNSAnalytics: ${response.status} ${error}`);
  }
  
  return await response.json();
}

async function getNextDNSLogs(configId: string, profileId: string, from: string, to: string, apiKey: string) {
  const params = new URLSearchParams({
    from,
    to,
    limit: '1000',
    ...(profileId && { profile: profileId })
  });

  const response = await fetch(`${NEXTDNS_API_BASE}/configs/${configId}/logs?${params}`, {
    headers: { "X-Api-Key": apiKey }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`getNextDNSLogs: ${response.status} ${error}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ ok: false, error: 'Missing Authorization header' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }

    const { childId, from, to, type = 'analytics' } = await req.json();

    if (!childId || !from || !to) {
      return json({ ok: false, error: 'childId, from, and to are required' }, 400);
    }

    const nextdnsApiKey = Deno.env.get('NEXTDNS_API_KEY');
    if (!nextdnsApiKey) {
      return json({ ok: false, error: 'NextDNS API key not configured' }, 500);
    }

    // Verify user owns the child
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single();

    if (!child) {
      return json({ ok: false, error: 'Child not found or not owned by user' }, 403);
    }

    // Get household config
    const { data: householdConfig } = await supabase
      .from('household_dns_configs')
      .select('nextdns_config_id')
      .eq('parent_user_id', user.id)
      .single();

    if (!householdConfig) {
      return json({ ok: false, error: 'No NextDNS config found for household' }, 404);
    }

    // Get child DNS profile
    const { data: childProfile } = await supabase
      .from('child_dns_profiles')
      .select('nextdns_profile_id')
      .eq('child_id', childId)
      .single();

    const configId = householdConfig.nextdns_config_id;
    const profileId = childProfile?.nextdns_profile_id;

    let data;
    
    if (type === 'logs') {
      data = await getNextDNSLogs(configId, profileId, from, to, nextdnsApiKey);
    } else {
      data = await getNextDNSAnalytics(configId, profileId, from, to, nextdnsApiKey);
    }

    // Process and anonymize the data before returning
    const processedData = {
      ...data,
      meta: {
        childId,
        profileAnonymized: true,
        timeRange: { from, to }
      }
    };

    return json({
      ok: true,
      data: processedData
    });

  } catch (error) {
    console.error('Error in nextdns-analytics:', error);
    return json({ ok: false, error: String(error) }, 500);
  }
});