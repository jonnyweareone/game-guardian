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

    // If we have text, process it with AI
    if (raw_text && raw_text.trim()) {
      // Process with OpenAI for AI insights
      const openAIKey = Deno.env.get('OPENAI_API_KEY');
      if (openAIKey) {
        try {
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
                  content: 'You are a reading coach for children aged 7-11. Analyze the text and provide a brief summary (2-3 sentences), 3 key points, 2 comprehension questions, and a difficulty rating from 1-10. Respond in JSON format with fields: summary, key_points (array), questions (array), difficulty (number).'
                },
                {
                  role: 'user',
                  content: `Analyze this text for a child reader: "${raw_text}"`
                }
              ],
              max_tokens: 300,
              temperature: 0.7
            }),
          });

          if (response.ok) {
            const aiResponse = await response.json();
            const content = aiResponse.choices[0]?.message?.content;
            
            if (content) {
              try {
                const insights = JSON.parse(content);
                
                // Store AI insights
                await supabase
                  .from('ai_reading_insights')
                  .insert({
                    session_id,
                    child_id,
                    book_id,
                    scope: 'chunk',
                    locator,
                    summary: insights.summary,
                    key_points: insights.key_points || [],
                    questions: insights.questions || [],
                    difficulty: insights.difficulty || 5
                  });

                // Extract and store problem words (simplified)
                const words = raw_text.toLowerCase().match(/\b\w+\b/g) || [];
                const longWords = words.filter(word => word.length > 6);
                
                for (const word of longWords.slice(0, 3)) { // Limit to 3 per chunk
                  await supabase
                    .from('problem_words')
                    .upsert({
                      session_id,
                      child_id,
                      book_id,
                      word,
                      count: 1,
                      syllables: Math.ceil(word.length / 3), // Simple heuristic
                      hints: [`Break it down: ${word.split('').join('-')}`, `Try saying it slowly`],
                      first_seen_locator: locator,
                      last_seen_locator: locator
                    }, {
                      onConflict: 'session_id,child_id,book_id,word',
                      ignoreDuplicates: false
                    });
                }

                console.log('AI processing completed for chunk:', chunkId);
              } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
              }
            }
          }
        } catch (aiError) {
          console.error('Error processing with AI:', aiError);
        }
      }
    }

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