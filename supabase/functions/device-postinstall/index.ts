
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { verifyDeviceJWT } from "../_shared/jwt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  console.log('device-postinstall: Function invoked');

  try {
    // Verify Device JWT (required)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log('device-postinstall: Missing Device JWT');
      return json({ error: "Missing Device JWT" }, { status: 401 });
    }

    const deviceJWT = authHeader.substring(7);
    const { ok, deviceCode, error: verifyError } = await verifyDeviceJWT(deviceJWT);
    
    if (!ok || !deviceCode) {
      console.log('device-postinstall: Invalid Device JWT', verifyError);
      return json({ 
        error: "Invalid Device JWT", 
        details: verifyError
      }, { status: 401 });
    }

    console.log('device-postinstall: Device JWT verified', { device_code: deviceCode });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const { device_id, child_id, app_ids, web_filter_config } = body;

    console.log('device-postinstall: Request body parsed', { 
      device_id, 
      child_id, 
      app_ids_count: app_ids?.length,
      web_filter_config 
    });

    if (!device_id || !child_id) {
      return json({ error: "device_id and child_id required" }, { status: 400 });
    }

    // Use deviceCode from JWT to look up the device (more secure than trusting body)
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, parent_id')
      .eq('device_code', deviceCode)
      .single();

    if (deviceError || !device) {
      console.error('device-postinstall: Device not found', deviceError);
      return json({ error: "Device not found" }, { status: 404 });
    }

    console.log('device-postinstall: Device verified', { device_id: device.id, parent_id: device.parent_id });

    // Update device to link to child directly
    const { error: deviceUpdateError } = await supabase
      .from('devices')
      .update({ 
        child_id: child_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', device.id);

    if (deviceUpdateError) {
      console.error('device-postinstall: Error updating device', deviceUpdateError);
      return json({ error: "Failed to link device to child" }, { status: 400 });
    }

    console.log('device-postinstall: Device-child link updated');

    // Clear existing app selections for this child and add new ones
    if (Array.isArray(app_ids) && app_ids.length > 0) {
      // First delete existing selections
      const { error: deleteError } = await supabase
        .from('child_app_selections')
        .delete()
        .eq('child_id', child_id);

      if (deleteError) {
        console.log('device-postinstall: Note - could not clear existing app selections', deleteError);
      }

      // Insert new selections
      const appSelections = app_ids.map((app_id: string) => ({ child_id, app_id }));
      const { error: appError } = await supabase
        .from('child_app_selections')
        .insert(appSelections);

      if (appError) {
        console.error('device-postinstall: Error saving app selections', appError);
        // Don't fail the whole operation for app selection errors
      } else {
        console.log('device-postinstall: App selections saved', { count: app_ids.length });
      }
    }

    // Fetch app catalog details for job payload
    let apps = [];
    if (Array.isArray(app_ids) && app_ids.length > 0) {
      const { data: appData, error: appFetchError } = await supabase
        .from('app_catalog')
        .select('id, name, type, platform, is_essential, category')
        .in('id', app_ids);

      if (appFetchError) {
        console.error('device-postinstall: Error fetching app details', appFetchError);
      } else {
        apps = appData || [];
        console.log('device-postinstall: App details fetched', { count: apps.length });
      }
    }

    // Fetch child details
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name')
      .eq('id', child_id)
      .single();

    if (childError) {
      console.error('device-postinstall: Error fetching child', childError);
    }

    // Create job payload with web filter configuration
    const payload = { 
      child: child || { id: child_id }, 
      apps: apps,
      web_filters: web_filter_config || {
        schoolHoursEnabled: false,
        socialMediaBlocked: true,
        gamingBlocked: false,
        entertainmentBlocked: false
      }
    };

    console.log('device-postinstall: Creating job with payload', { 
      child_name: child?.name, 
      apps_count: apps.length,
      web_filters: payload.web_filters
    });

    // Enqueue post-install job for device agent using new table structure
    const { error: jobError } = await supabase
      .from('device_jobs')
      .insert({
        device_id: device.id,
        type: 'POST_INSTALL',
        payload,
        status: 'queued'
      });

    if (jobError) {
      console.error('device-postinstall: Error creating job', jobError);
      return json({ error: "Failed to queue installation job" }, { status: 400 });
    }

    console.log('device-postinstall: Job queued successfully');

    return json({ ok: true });

  } catch (error: any) {
    console.error('device-postinstall: Unexpected error', error);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});
