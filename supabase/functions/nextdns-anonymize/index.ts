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

async function updateNextDNSConfig(configId: string, name: string, apiKey: string) {
  const response = await fetch(`${NEXTDNS_API_BASE}/configs/${configId}`, {
    method: "PATCH",
    headers: {
      "X-Api-Key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`updateNextDNSConfig: ${response.status} ${error}`);
  }
  
  return await response.json();
}

async function updateNextDNSProfile(configId: string, profileId: string, name: string, apiKey: string) {
  const response = await fetch(`${NEXTDNS_API_BASE}/configs/${configId}/profiles/${profileId}`, {
    method: "PATCH",
    headers: {
      "X-Api-Key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`updateNextDNSProfile: ${response.status} ${error}`);
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

    const { configId, dryRun = true } = await req.json();

    const nextdnsApiKey = Deno.env.get('NEXTDNS_API_KEY');
    if (!nextdnsApiKey) {
      return json({ ok: false, error: 'NextDNS API key not configured' }, 500);
    }

    const changes: any[] = [];

    // Process household configs
    const configQuery = configId 
      ? supabase.from('household_dns_configs').select('*').eq('parent_user_id', user.id).eq('nextdns_config_id', configId)
      : supabase.from('household_dns_configs').select('*').eq('parent_user_id', user.id);

    const { data: householdConfigs } = await configQuery;

    if (householdConfigs) {
      for (const config of householdConfigs) {
        const expectedName = user.id;
        if (config.config_name !== expectedName) {
          changes.push({
            type: 'config',
            id: config.nextdns_config_id,
            currentName: config.config_name,
            newName: expectedName,
            action: dryRun ? 'would_rename' : 'renamed'
          });

          if (!dryRun) {
            try {
              await updateNextDNSConfig(config.nextdns_config_id, expectedName, nextdnsApiKey);
              await supabase
                .from('household_dns_configs')
                .update({ config_name: expectedName })
                .eq('id', config.id);
            } catch (error) {
              changes[changes.length - 1].error = String(error);
            }
          }
        }

        // Process child profiles for this config
        const { data: childProfiles } = await supabase
          .from('child_dns_profiles')
          .select('*, children!inner(parent_id)')
          .eq('children.parent_id', user.id);

        if (childProfiles) {
          for (const profile of childProfiles) {
            const expectedProfileName = `${user.id}:${profile.child_id}`;
            if (profile.profile_name !== expectedProfileName) {
              changes.push({
                type: 'profile',
                configId: config.nextdns_config_id,
                profileId: profile.nextdns_profile_id,
                childId: profile.child_id,
                currentName: profile.profile_name,
                newName: expectedProfileName,
                action: dryRun ? 'would_rename' : 'renamed'
              });

              if (!dryRun) {
                try {
                  await updateNextDNSProfile(
                    config.nextdns_config_id, 
                    profile.nextdns_profile_id, 
                    expectedProfileName, 
                    nextdnsApiKey
                  );
                  await supabase
                    .from('child_dns_profiles')
                    .update({ profile_name: expectedProfileName })
                    .eq('id', profile.id);
                } catch (error) {
                  changes[changes.length - 1].error = String(error);
                }
              }
            }
          }
        }
      }
    }

    return json({
      ok: true,
      dryRun,
      changesCount: changes.length,
      changes
    });

  } catch (error) {
    console.error('Error in nextdns-anonymize:', error);
    return json({ ok: false, error: String(error) }, 500);
  }
});