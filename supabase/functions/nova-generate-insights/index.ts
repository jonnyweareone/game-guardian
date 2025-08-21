import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { session_id, child_id, book_id, text_content } = await req.json();

    if (!session_id || !child_id || !book_id || !text_content) {
      throw new Error('Missing required parameters: session_id, child_id, book_id, text_content');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating insights for session:', session_id);

    // Call OpenAI to generate insights
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI reading coach for children. Analyze the provided text and generate educational insights in JSON format:
{
  "summary": "Brief summary of the text (2-3 sentences)",
  "difficulty": "easy|medium|hard",
  "key_points": ["list", "of", "3-5", "key", "learning", "points"],
  "comprehension_questions": ["question1", "question2", "question3"],
  "problem_words": [
    {"word": "difficult_word", "difficulty": 1-5, "definition": "simple explanation"}
  ]
}`
          },
          {
            role: 'user',
            content: `Analyze this text from a children's book:\n\n${text_content}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the JSON response
    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback with basic insights
      insights = {
        summary: 'Reading progress recorded',
        difficulty: 'medium',
        key_points: ['Continue reading', 'Ask questions if needed'],
        comprehension_questions: [],
        problem_words: []
      };
    }

    // Insert insights into database
    const { error: insightError } = await supabase
      .from('nova_insights')
      .insert({
        session_id,
        child_id,
        book_id,
        scope: 'chunk',
        ai_summary: insights.summary,
        difficulty_level: insights.difficulty,
        key_points: insights.key_points,
        comprehension_questions: insights.comprehension_questions,
        created_at: new Date().toISOString()
      });

    if (insightError) {
      console.error('Error inserting insights:', insightError);
      throw new Error(`Database error: ${insightError.message}`);
    }

    // Insert problem words
    for (const word of (insights.problem_words || [])) {
      const { error: wordError } = await supabase
        .from('nova_problem_words')
        .insert({
          session_id,
          child_id,
          book_id,
          word: word.word,
          context: text_content.substring(0, 100),
          difficulty_level: word.difficulty || 2,
          definition: word.definition,
          created_at: new Date().toISOString()
        });

      if (wordError) {
        console.warn('Error inserting problem word:', wordError);
      }
    }

    console.log('Insights generated successfully');

    return new Response(
      JSON.stringify({ success: true, insights }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in nova-generate-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});