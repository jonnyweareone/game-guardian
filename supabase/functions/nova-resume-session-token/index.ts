import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, sessionId } = await req.json();
    
    if (!token || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Token and sessionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Resuming session for token:', token.substring(0, 10) + '...');

    // Verify token and get child_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('nova_child_tokens')
      .select('child_id, book_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error('Token verification failed:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { child_id, book_id } = tokenData;
    console.log('Token verified for child:', child_id, 'book:', book_id);

    // Update listening state to resumed
    const { error: updateError } = await supabase
      .from('child_listening_state')
      .update({ 
        is_listening: true,
        updated_at: new Date().toISOString()
      })
      .eq('child_id', child_id);

    if (updateError) {
      console.error('Failed to update listening state:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to resume session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log resume event to timeline
    const { error: timelineError } = await supabase
      .from('child_reading_timeline')
      .insert({
        child_id,
        book_id,
        session_id: sessionId,
        event_type: 'resumed'
      });

    if (timelineError) {
      console.error('Failed to log resume event:', timelineError);
    }

    // Broadcast events on both legacy and new channels
    const channelName = `child_listening:${child_id}`;
    try {
      await supabase.channel(channelName).send({
        type: 'broadcast',
        event: 'listening_started',
        payload: { child_id, book_id, session_id: sessionId, reason: 'resumed' }
      });
      await supabase.channel(`nova_child_${child_id}`).send({
        type: 'broadcast',
        event: 'nova',
        payload: { type: 'listening_on', child_id, book_id, session_id: sessionId, reason: 'resumed' }
      });
    } catch (broadcastError) {
      console.error('Failed to broadcast resume event:', broadcastError);
    }

    console.log('Session resumed successfully for child:', child_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        session_id: sessionId,
        resumed_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error resuming session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});