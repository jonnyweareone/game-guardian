import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
};

interface GuardianData {
  device_id: string;
  child_id?: string;
  conversation_data?: {
    platform: string;
    participants: string[];
    transcript: any[];
    session_start: string;
    session_end?: string;
    conversation_type: string;
  };
  alert_data?: {
    alert_type: string;
    risk_level: string;
    ai_summary: string;
    transcript_snippet?: string;
    confidence_score: number;
    emotional_impact?: string;
    social_context?: string;
  };
  heartbeat?: {
    status: string;
    last_seen: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const deviceId = req.headers.get('x-device-id');
    if (!deviceId) {
      throw new Error('Device ID required in x-device-id header');
    }

    // Verify device exists and is active
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*, children(*)')
      .eq('device_code', deviceId)
      .eq('is_active', true)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found or inactive');
    }

    const raw = await req.json();
    console.log('Received data from device:', deviceId, raw);

    // Helper to handle app catalog ingestion
    async function handleAppCatalog(item: any) {
      const apps = Array.isArray(item.apps) ? item.apps : [];
      let count = 0;
      for (const a of apps) {
        const { error } = await supabase
          .from('device_apps')
          .upsert(
            {
              device_code: device.device_code ?? deviceId,
              app_id: a.app_id,
              name: a.name,
              description: a.description ?? null,
              platform: a.platform ?? null,
              icon_url: a.icon_url ?? null,
              category: a.category ?? 'App',
              pegi_rating: a.pegi?.rating ?? null,
              pegi_descriptors: a.pegi?.descriptors ?? null,
              publisher: a.publisher ?? null,
              website: a.website ?? null,
              source: a.source ?? null,
              version: a.version ?? null,
              last_used_at: a.last_used_at ?? null,
              last_seen: new Date().toISOString(),
            },
            { onConflict: 'device_code,app_id' }
          );
        if (error) throw error;
        count++;
      }
      return count;
    }

    // If batch payload: process known event types we support in batches
    if (Array.isArray(raw)) {
      let processed = 0;
      for (const item of raw) {
        if (item?.type === 'app_catalog') {
          processed += await handleAppCatalog(item);
        }
      }
      return new Response(
        JSON.stringify({ 
          success: true,
          device_id: deviceId,
          processed,
          processed_at: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const data: GuardianData & { type?: string; device_code?: string; apps?: any[] } = raw;

    // New event type: app_catalog
    if ((data as any).type === 'app_catalog') {
      const processed = await handleAppCatalog(data);
      return new Response(
        JSON.stringify({ 
          success: true,
          device_id: deviceId,
          processed,
          processed_at: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Additional event types handled explicitly before generic processors
    if ((data as any).type === 'profile_active') {
      const newChildId = (data as any).child_id ?? null;
      // Set active child on device and maintain assignments
      await supabase
        .from('devices')
        .update({ child_id: newChildId, updated_at: new Date().toISOString() })
        .eq('id', device.id);

      if (newChildId) {
        // Ensure assignment exists and is active
        await supabase
          .from('device_child_assignments')
          .upsert({ device_id: device.id, child_id: newChildId, is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'device_id,child_id' });
        // Deactivate other assignments for this device
        await supabase
          .from('device_child_assignments')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('device_id', device.id)
          .neq('child_id', newChildId);
      } else {
        // If unsetting child, mark all assignments inactive
        await supabase
          .from('device_child_assignments')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('device_id', device.id);
      }

      return new Response(
        JSON.stringify({ success: true, device_id: deviceId, type: 'profile_active', processed_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if ((data as any).type === 'network_status') {
      const ns = (data as any).network ?? (data as any);
      await supabase
        .from('devices')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', device.id);

      await supabase
        .from('device_heartbeats')
        .insert({
          device_id: device.id,
          child_id: device.child_id ?? null,
          battery: ns?.battery ?? (ns?.heartbeat?.battery ?? null),
          ip_address: ns?.ip ?? (ns?.heartbeat?.ip ?? null),
          ssid: ns?.ssid ?? (ns?.heartbeat?.ssid ?? null),
        });

      return new Response(
        JSON.stringify({ success: true, device_id: deviceId, type: 'network_status', processed_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if ((data as any).type === 'content_alert') {
      const alertPayload = (data as any).alert ?? (data as any).alert_data ?? {};
      const level = alertPayload.risk_level ?? 'high';
      const { data: alertRow, error: alertErr } = await supabase
        .from('alerts')
        .insert({
          device_id: device.id,
          child_id: device.child_id ?? null,
          alert_type: alertPayload.alert_type ?? 'content_alert',
          risk_level: level,
          ai_summary: alertPayload.ai_summary ?? 'Content policy violation detected',
          transcript_snippet: alertPayload.transcript_snippet ?? null,
          confidence_score: alertPayload.confidence_score ?? null,
          emotional_impact: alertPayload.emotional_impact ?? null,
          social_context: alertPayload.social_context ?? null,
        })
        .select()
        .single();
      if (alertErr) throw alertErr;

      if (['high', 'critical'].includes(level)) {
        await supabase
          .from('parent_notifications')
          .insert({
            parent_id: (device as any).parent_id,
            child_id: device.child_id ?? null,
            notification_type: 'alert',
            title: level === 'critical' ? '🚨 URGENT: Critical content alert' : '⚠️ High priority content alert',
            message: alertPayload.ai_summary ?? 'Review recent activity for potential risks.',
            priority: level,
            action_required: true,
            related_alert_id: alertRow.id,
          });
      }

      return new Response(
        JSON.stringify({ success: true, device_id: deviceId, type: 'content_alert', processed_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Process different types of data
    if (data.heartbeat) {
      // Update device status and store heartbeat
      await supabase
        .from('devices')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', device.id);

      // Insert heartbeat details (if provided)
      await supabase
        .from('device_heartbeats')
        .insert({
          device_id: device.id,
          child_id: device.child_id ?? null,
          battery: (data as any).heartbeat?.battery ?? null,
          ip_address: (data as any).heartbeat?.ip ?? null,
          ssid: (data as any).heartbeat?.ssid ?? null,
        });

      console.log('Processed heartbeat for device:', deviceId);
    }

    // App activity events
    if ((data as any).type === 'app_activity') {
      const ev = (data as any);
      const appId = ev.app_id as string;
      const timestamp = ev.timestamp ? new Date(ev.timestamp).toISOString() : new Date().toISOString();

      if (ev.action === 'start') {
        const { error } = await supabase
          .from('app_activity')
          .insert({
            device_id: device.id,
            child_id: device.child_id ?? null,
            app_id: appId,
            session_start: timestamp,
          });
        if (error) throw error;
      } else if (ev.action === 'stop') {
        const { data: sessions, error: qErr } = await supabase
          .from('app_activity')
          .select('id, session_start')
          .eq('device_id', device.id)
          .eq('app_id', appId)
          .is('session_end', null)
          .order('session_start', { ascending: false })
          .limit(1);
        if (qErr) throw qErr;
        if (sessions && sessions.length > 0) {
          const sess = sessions[0] as any;
          const endIso = timestamp;
          const durationSec = Math.max(0, Math.floor((new Date(endIso).getTime() - new Date(sess.session_start).getTime()) / 1000));
          const { error: upErr } = await supabase
            .from('app_activity')
            .update({ session_end: endIso, duration_seconds: durationSec })
            .eq('id', sess.id);
          if (upErr) throw upErr;
        }
      }

      return new Response(
        JSON.stringify({ success: true, device_id: deviceId, type: 'app_activity', processed_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (data.conversation_data) {
      // Store conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          device_id: device.id,
          child_id: device.child_id,
          platform: data.conversation_data.platform,
          participants: data.conversation_data.participants,
          transcript: data.conversation_data.transcript,
          session_start: data.conversation_data.session_start,
          session_end: data.conversation_data.session_end,
          conversation_type: data.conversation_data.conversation_type,
          total_messages: data.conversation_data.transcript?.length || 0,
        })
        .select()
        .single();

      if (convError) throw convError;
      console.log('Stored conversation:', conversation.id);
    }

    if (data.alert_data) {
      // Create alert
      const { data: alert, error: alertError } = await supabase
        .from('alerts')
        .insert({
          device_id: device.id,
          child_id: device.child_id,
          alert_type: data.alert_data.alert_type,
          risk_level: data.alert_data.risk_level,
          ai_summary: data.alert_data.ai_summary,
          transcript_snippet: data.alert_data.transcript_snippet,
          confidence_score: data.alert_data.confidence_score,
          emotional_impact: data.alert_data.emotional_impact,
          social_context: data.alert_data.social_context,
          conversation_id: data.conversation_data ? undefined : null,
        })
        .select()
        .single();

      if (alertError) throw alertError;

      // Create parent notification for high/critical alerts
      if (['high', 'critical'].includes(data.alert_data.risk_level)) {
        const notificationTitle = data.alert_data.risk_level === 'critical' 
          ? '🚨 URGENT: Critical safety alert'
          : '⚠️ High priority safety alert';

        await supabase
          .from('parent_notifications')
          .insert({
            parent_id: device.parent_id,
            child_id: device.child_id,
            notification_type: 'alert',
            title: notificationTitle,
            message: data.alert_data.ai_summary,
            priority: data.alert_data.risk_level,
            action_required: true,
            related_alert_id: alert.id,
          });

        console.log('Created alert and notification:', alert.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        device_id: deviceId,
        processed_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing guardian data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});