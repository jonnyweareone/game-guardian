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
    const { action, device_code, payload } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate ISP request
    const ispCode = req.headers.get('x-isp-code');
    const apiKey = req.headers.get('x-api-key');
    
    if (!ispCode || !apiKey) {
      return json({ error: "Missing ISP credentials" }, { status: 401 });
    }

    // Verify ISP tenant
    const { data: tenant, error: tenantError } = await supabaseClient
      .from('isp_tenants')
      .select('*')
      .eq('isp_code', ispCode)
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (tenantError || !tenant) {
      return json({ error: "Invalid ISP credentials" }, { status: 401 });
    }

    // Log sync attempt
    const { error: logError } = await supabaseClient
      .from('bridge_sync_logs')
      .insert({
        isp_tenant_id: tenant.id,
        device_code,
        sync_type: action,
        payload: payload || {}
      });

    if (logError) {
      console.error("Failed to log sync:", logError);
    }

    switch (action) {
      case 'policy_push':
        return handlePolicyPush(supabaseClient, tenant, device_code, payload);
      case 'device_status':
        return handleDeviceStatus(supabaseClient, tenant, device_code, payload);
      case 'client_data':
        return handleClientData(supabaseClient, tenant, device_code, payload);
      default:
        return json({ error: "Unknown action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Bridge sync error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
});

async function handlePolicyPush(supabase: any, tenant: any, deviceCode: string, payload: any) {
  // Push policy updates to Guardian device
  const { data: gateway, error } = await supabase
    .from('cpe_gateways')
    .select('*')
    .eq('device_code', deviceCode)
    .eq('parent_id', payload.parent_id)
    .single();

  if (error || !gateway) {
    return json({ error: "Gateway not found" }, { status: 404 });
  }

  // Sync policy profiles with ISP bridge
  const { data: profiles } = await supabase
    .from('cpe_policy_profiles')
    .select('*')
    .eq('parent_id', payload.parent_id);

  return json({
    success: true,
    gateway,
    profiles: profiles || [],
    sync_timestamp: new Date().toISOString()
  });
}

async function handleDeviceStatus(supabase: any, tenant: any, deviceCode: string, payload: any) {
  // Update device status from bridge
  const { error } = await supabase
    .from('cpe_gateways')
    .update({
      status: payload.status,
      last_seen: new Date().toISOString(),
      bridge_version: payload.version,
      connected_clients: payload.client_count || 0
    })
    .eq('device_code', deviceCode);

  if (error) {
    console.error("Failed to update device status:", error);
    return json({ error: "Failed to update status" }, { status: 500 });
  }

  return json({ success: true });
}

async function handleClientData(supabase: any, tenant: any, deviceCode: string, payload: any) {
  // Sync client data from bridge
  const { clients } = payload;
  
  if (!Array.isArray(clients)) {
    return json({ error: "Invalid client data" }, { status: 400 });
  }

  // Upsert client records
  for (const client of clients) {
    await supabase
      .from('cpe_clients')
      .upsert({
        parent_id: payload.parent_id,
        device_code: deviceCode,
        mac_address: client.mac,
        device_name: client.name,
        ip_address: client.ip,
        last_seen: client.last_seen || new Date().toISOString(),
        device_type: client.type || 'unknown',
        is_online: client.online || false
      }, {
        onConflict: 'parent_id,mac_address'
      });
  }

  return json({ 
    success: true,
    synced_clients: clients.length 
  });
}