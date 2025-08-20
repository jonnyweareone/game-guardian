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

    // Get session details and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('child_reading_sessions')
      .select(`
        *,
        children!inner(parent_id),
        books!inner(title)
      `)
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

    // Update session with end time and total seconds
    const { error: updateError } = await supabase
      .from('child_reading_sessions')
      .update({
        ended_at: new Date().toISOString(),
        total_seconds: total_seconds || 0,
        updated_at: new Date().toISOString()
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
        updated_at: new Date().toISOString()
      })
      .eq('child_id', session.child_id);

    // Update or create reading rollup
    await supabase
      .from('reading_rollups')
      .upsert({
        child_id: session.child_id,
        book_id: session.book_id,
        total_seconds: total_seconds || 0,
        sessions: 1,
        last_session_at: new Date().toISOString(),
        last_summary: 'Reading session completed'
      }, {
        onConflict: 'child_id,book_id',
        ignoreDuplicates: false
      });

    // Add timeline event
    await supabase
      .from('child_reading_timeline')
      .insert({
        child_id: session.child_id,
        book_id: session.book_id,
        event_type: 'finished',
        session_id: session_id
      });

    // Generate session-level AI summary if we have OpenAI key
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIKey) {
      try {
        // Get all chunks from this session
        const { data: chunks } = await supabase
          .from('reading_chunks')
          .select('raw_text')
          .eq('session_id', session_id)
          .not('raw_text', 'is', null);

        if (chunks && chunks.length > 0) {
          const allText = chunks.map(c => c.raw_text).join(' ').substring(0, 2000);
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'Create a session summary for a child\'s reading session. Provide overall insights about their reading progress, key themes they encountered, and encouragement. Keep it positive and educational. Respond in JSON format with fields: summary, key_points (array), questions (array), difficulty (number).'
                },
                {
                  role: 'user',
                  content: `Summarize this reading session (${Math.floor((total_seconds || 0) / 60)} minutes): "${allText}"`
                }
              ],
              max_tokens: 400,
              temperature: 0.7
            }),
          });

          if (response.ok) {
            const aiResponse = await response.json();
            const content = aiResponse.choices[0]?.message?.content;
            
            if (content) {
              try {
                const insights = JSON.parse(content);
                
                // Store session-level AI insights
                await supabase
                  .from('ai_reading_insights')
                  .insert({
                    session_id,
                    child_id: session.child_id,
                    book_id: session.book_id,
                    scope: 'session',
                    summary: insights.summary,
                    key_points: insights.key_points || [],
                    questions: insights.questions || [],
                    difficulty: insights.difficulty || 5
                  });

                console.log('Session AI summary generated');
              } catch (parseError) {
                console.error('Error parsing session AI response:', parseError);
              }
            }
          }
        }
      } catch (aiError) {
        console.error('Error generating session summary:', aiError);
      }
    }

    // Broadcast session ended
    const channel = supabase.channel(`nova_child_${session.child_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'nova',
      payload: {
        type: 'listening_off',
        session_id,
        total_seconds: total_seconds || 0,
        title: 'Reading session completed'
      }
    });

    console.log(`Nova session ended: ${session_id} (${total_seconds}s)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session_id,
        total_seconds: total_seconds || 0,
        ended_at: new Date().toISOString()
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