import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { token, sessionId, progress } = await req.json();

    if (!token || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Token and sessionId are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get child ID
    const { data: tokenData, error: tokenError } = await supabase
      .from('nova_child_tokens')
      .select('child_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const childId = tokenData.child_id;

    // End the session
    const { data: session, error: sessionError } = await supabase
      .from('child_reading_sessions')
      .update({
        ended_at: new Date().toISOString(),
        current_locator: progress?.locator || null
      })
      .eq('id', sessionId)
      .eq('child_id', childId)
      .select()
      .single();

    if (sessionError) {
      console.error('Error ending session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to end session' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stop listening
    const { error: listenError } = await supabase
      .from('child_listening_state')
      .upsert({
        child_id: childId,
        book_id: null,
        is_listening: false,
        session_id: null,
        started_at: null,
        updated_at: new Date().toISOString()
      });

    if (listenError) {
      console.error('Error updating listening state:', listenError);
    }

    // Compute duration and update session total_seconds
    try {
      const startedAt = session?.started_at ? new Date(session.started_at as string) : null;
      const endedAt = session?.ended_at ? new Date(session.ended_at as string) : new Date();
      if (startedAt) {
        const totalSeconds = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000));
        const { error: updateDurationError } = await supabase
          .from('child_reading_sessions')
          .update({ total_seconds: totalSeconds })
          .eq('id', sessionId);
        if (updateDurationError) {
          console.error('Error updating total_seconds:', updateDurationError);
        }
      }
    } catch (e) {
      console.error('Error computing duration:', e);
    }

    // Update bookshelf progress if provided
    try {
      if (typeof progress === 'number' && session?.book_id) {
        const pct = Number(progress) || 0;
        await supabase.from('child_bookshelf').upsert({
          child_id: childId,
          book_id: session.book_id,
          status: pct >= 100 ? 'finished' : 'reading',
          progress: pct,
          updated_at: new Date().toISOString()
        }, { onConflict: 'child_id,book_id' });
      }
    } catch (e) {
      console.error('Error updating bookshelf:', e);
    }

    // Log finished event
    try {
      if (session?.book_id) {
        await supabase.from('child_reading_timeline').insert({
          child_id: childId,
          book_id: session.book_id,
          session_id: sessionId,
          event_type: 'finished'
        });
      }
    } catch (e) {
      console.error('Error logging finished event:', e);
    }

    // Broadcast listening state change (new channel for UI)
    try {
      await supabase.channel(`nova_child_${childId}`).send({
        type: 'broadcast',
        event: 'nova',
        payload: { type: 'listening_off', child_id: childId, session_id: sessionId }
      });
    } catch (e) {
      console.error('Broadcast error:', e);
    }

    return new Response(
      JSON.stringify({
        session_ended: true,
        child_id: childId,
        listening: false
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in nova-end-session-token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});