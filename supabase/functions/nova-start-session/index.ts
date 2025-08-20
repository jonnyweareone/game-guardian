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
    const { child_id, book_id, locator } = await req.json();

    if (!child_id || !book_id) {
      return new Response(
        JSON.stringify({ error: 'child_id and book_id are required' }),
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

    // Verify user owns the child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, parent_id')
      .eq('id', child_id)
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

    // Create reading session
    const sessionId = crypto.randomUUID();
    const { data: session, error: sessionError } = await supabase
      .from('child_reading_sessions')
      .insert({
        id: sessionId,
        child_id,
        book_id,
        started_at: new Date().toISOString(),
        current_locator: locator
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update child listening state
    await supabase
      .from('child_listening_state')
      .upsert({
        child_id,
        is_listening: true,
        book_id,
        session_id: sessionId,
        updated_at: new Date().toISOString()
      });

    // Broadcast listening started
    const channel = supabase.channel(`nova_child_${child_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'nova',
      payload: {
        type: 'listening_on',
        book_id,
        session_id: sessionId,
        title: 'Reading session started'
      }
    });

    console.log(`Nova session started: ${sessionId} for child ${child_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session_id: sessionId,
        child_id,
        book_id,
        started_at: session.started_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in nova-start-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});