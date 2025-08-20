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
    const { session_id, child_id, book_id, locator, raw_text } = await req.json();

    if (!session_id || !child_id || !book_id) {
      return new Response(
        JSON.stringify({ error: 'session_id, child_id, and book_id are required' }),
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

    // Verify session exists and user owns the child
    const { data: session, error: sessionError } = await supabase
      .from('child_reading_sessions')
      .select(`
        *,
        children!inner(parent_id)
      `)
      .eq('id', session_id)
      .eq('child_id', child_id)
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== (session as any).children.parent_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create reading chunk
    const chunkId = crypto.randomUUID();
    const { data: chunk, error: chunkError } = await supabase
      .from('reading_chunks')
      .insert({
        id: chunkId,
        session_id,
        child_id,
        book_id,
        locator,
        raw_text,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (chunkError) {
      console.error('Error creating chunk:', chunkError);
      return new Response(
        JSON.stringify({ error: 'Failed to create chunk' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update session with latest activity
    await supabase
      .from('child_reading_sessions')
      .update({
        current_locator: locator,
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id);

    // Broadcast progress update
    const channel = supabase.channel(`nova_child_${child_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'nova',
      payload: {
        type: 'progress',
        session_id,
        chunk_id: chunkId,
        locator,
        progress: locator ? parseFloat(locator) : 0
      }
    });

    console.log(`Nova chunk created: ${chunkId} for session ${session_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        chunk_id: chunkId,
        session_id,
        created_at: chunk.created_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in nova-chunk:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});