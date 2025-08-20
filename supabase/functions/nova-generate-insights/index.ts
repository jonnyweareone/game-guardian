import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Nova Generate Insights function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, child_id, book_id, text_content } = await req.json();
    
    if (!session_id || !child_id || !book_id || !text_content) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating AI insights for text:', text_content.substring(0, 100) + '...');

    // Generate AI insights using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Nova, an AI reading coach for children. Analyze the text and provide educational insights. 
            
            Respond with a JSON object containing:
            - summary: Brief summary of what happened in this text chunk
            - difficulty_level: "easy", "medium", or "challenging" 
            - key_points: Array of 2-3 important learning points
            - comprehension_questions: Array of 1-2 age-appropriate questions
            - problem_words: Array of difficult words with their phonetics, syllables, and hints
            
            Focus on helping children understand and learn from what they're reading.`
          },
          {
            role: 'user',
            content: `Analyze this text for a child reader: "${text_content}"`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate insights' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('Received AI response');

    let analysisData;
    try {
      analysisData = JSON.parse(aiResponse.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      // Fallback to basic analysis
      analysisData = {
        summary: aiResponse.choices[0].message.content.substring(0, 200),
        difficulty_level: 'medium',
        key_points: ['Continue reading to learn more!'],
        comprehension_questions: ['What do you think will happen next?'],
        problem_words: []
      };
    }

    // Insert insights into nova_insights table
    const { error: insightsError } = await supabase
      .from('nova_insights')
      .insert({
        session_id,
        child_id,
        book_id,
        scope: 'chunk',
        ai_summary: analysisData.summary || 'Reading analysis complete',
        difficulty_level: analysisData.difficulty_level || 'medium',
        key_points: analysisData.key_points || [],
        comprehension_questions: analysisData.comprehension_questions || [],
        emotional_tone: 'positive',
        reading_level_assessment: `Suitable for current reading level`
      });

    if (insightsError) {
      console.error('Error inserting insights:', insightsError);
    } else {
      console.log('Successfully inserted Nova insights');
    }

    // Insert problem words if any
    if (analysisData.problem_words && Array.isArray(analysisData.problem_words)) {
      for (const word of analysisData.problem_words) {
        if (typeof word === 'object' && word.word) {
          const { error: wordError } = await supabase
            .from('nova_problem_words')
            .insert({
              session_id,
              child_id,
              word: word.word,
              phonetics: word.phonetics || '',
              syllables: word.syllables || [word.word],
              sounds: word.sounds || [],
              difficulty_reason: word.reason || 'Complex word',
              hints: word.hints || ['Break it down into smaller parts'],
              definition: word.definition || ''
            });

          if (wordError) {
            console.error('Error inserting problem word:', wordError);
          }
        }
      }
      console.log(`Inserted ${analysisData.problem_words.length} problem words`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: analysisData,
        message: 'AI insights generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nova-generate-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});