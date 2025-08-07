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

    const data: GuardianData = await req.json();
    console.log('Received data from device:', deviceId, data);

    // Process different types of data
    if (data.heartbeat) {
      // Update device status
      await supabase
        .from('devices')
        .update({ 
          updated_at: new Date().toISOString(),
        })
        .eq('id', device.id);

      console.log('Processed heartbeat for device:', deviceId);
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