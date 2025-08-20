import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, total_seconds } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create authenticated client
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('child_reading_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify user owns the child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, parent_id')
      .eq('id', session.child_id)
      .single();

    if (childError || !child) {
      return new Response(
        JSON.stringify({ error: 'Child not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== child.parent_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update session with end time
    const endedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('child_reading_sessions')
      .update({
        ended_at: endedAt,
        total_seconds: total_seconds || Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000)
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update child listening state
    await supabase
      .from('child_listening_state')
      .update({
        is_listening: false,
        book_id: null,
        session_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('child_id', session.child_id);

    // Update or create reading rollup
    const rollupDate = new Date().toISOString().split('T')[0];
    await supabase
      .from('reading_rollups')
      .upsert({
        child_id: session.child_id,
        book_id: session.book_id,
        rollup_date,
        sessions: 1,
        total_seconds: total_seconds || 0,
        last_session_at: endedAt,
        last_summary: 'Reading session completed'
      }, {
        onConflict: 'child_id,book_id,rollup_date',
        // Add to existing values if record exists
        ignoreDuplicates: false
      });

    // Add timeline event
    await supabase
      .from('child_reading_timeline')
      .insert({
        child_id: session.child_id,
        book_id: session.book_id,
        event_type: 'session_ended',
        session_id,
        created_at: endedAt
      });

    // Broadcast listening stopped
    const channel = supabase.channel(`nova_child_${session.child_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'nova',
      payload: {
        type: 'listening_off',
        session_id,
        total_seconds: total_seconds || 0
      }
    });

    console.log(`Nova session ended: ${session_id} for child ${session.child_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session_id,
        ended_at: endedAt,
        total_seconds: total_seconds || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in nova-end-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});