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
    const { token, bookId } = await req.json();

    if (!token || !bookId) {
      return new Response(
        JSON.stringify({ error: 'Token and bookId are required' }), 
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

    // Create reading session
    const { data: session, error: sessionError } = await supabase
      .from('child_reading_sessions')
      .insert({
        child_id: childId,
        book_id: bookId,
        started_at: new Date().toISOString(),
        total_seconds: 0
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update listening state
    const { error: listenError } = await supabase
      .from('child_listening_state')
      .upsert({
        child_id: childId,
        book_id: bookId,
        is_listening: true,
        session_id: session.id,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (listenError) {
      console.error('Error updating listening state:', listenError);
    }

    // Broadcast listening state change
    await supabase.channel('nova').send({
      type: 'broadcast',
      event: 'listening_started',
      payload: { child_id: childId, book_id: bookId, session_id: session.id }
    });

    return new Response(
      JSON.stringify({
        session_id: session.id,
        child_id: childId,
        listening: true
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in nova-start-session-token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});