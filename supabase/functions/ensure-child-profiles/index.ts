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

async function listNextDNSProfiles(configId: string, apiKey: string) {
  const response = await fetch(`${NEXTDNS_API_BASE}/configs/${configId}/profiles`, {
    headers: { "X-Api-Key": apiKey }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`listNextDNSProfiles: ${response.status} ${error}`);
  }
  
  return await response.json();
}

async function createNextDNSProfile(configId: string, name: string, apiKey: string) {
  const response = await fetch(`${NEXTDNS_API_BASE}/configs/${configId}/profiles`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`createNextDNSProfile: ${response.status} ${error}`);
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

    const { configId, children } = await req.json();
    
    if (!configId || !children || !Array.isArray(children)) {
      return json({ ok: false, error: 'configId and children array are required' }, 400);
    }

    const nextdnsApiKey = Deno.env.get('NEXTDNS_API_KEY');
    if (!nextdnsApiKey) {
      return json({ ok: false, error: 'NextDNS API key not configured' }, 500);
    }

    // Verify user owns the config
    const { data: householdConfig } = await supabase
      .from('household_dns_configs')
      .select('*')
      .eq('parent_user_id', user.id)
      .eq('nextdns_config_id', configId)
      .single();

    if (!householdConfig) {
      return json({ ok: false, error: 'NextDNS config not found or not owned by user' }, 403);
    }

    // Get existing NextDNS profiles
    const existingProfiles = await listNextDNSProfiles(configId, nextdnsApiKey);
    const created: any[] = [];

    for (const child of children) {
      if (!child.id) {
        continue;
      }

      // Use parentUUID:childUUID format for profile name
      const profileName = `${user.id}:${child.id}`;

      // Check if profile already exists
      let profile = existingProfiles.find((p: any) => p.name === profileName);
      
      if (!profile) {
        // Create new profile with anonymous name
        profile = await createNextDNSProfile(configId, profileName, nextdnsApiKey);
      }

      // Store/update in our database
      const { error: upsertError } = await supabase
        .from('child_dns_profiles')
        .upsert({
          child_id: child.id,
          nextdns_profile_id: profile.id,
          profile_name: profile.name
        });

      if (upsertError) {
        console.error(`Error storing profile for child ${child.id}:`, upsertError);
      }

      created.push({
        childId: child.id,
        profileId: profile.id,
        name: profileName
      });
    }

    return json({ 
      ok: true, 
      profiles: created,
      configId 
    });

  } catch (error) {
    console.error('Error in ensure-child-profiles:', error);
    return json({ ok: false, error: String(error) }, 500);
  }
});