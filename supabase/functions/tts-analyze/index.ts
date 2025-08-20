import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface AnalysisSegment {
  text: string;
  label: 'narrator' | 'child' | 'teen' | 'adult_male' | 'adult_female' | 'elder_male' | 'elder_female' | 'creature_robot';
  start_para_idx: number;
}

function createHash(text: string): string {
  // Simple hash function for caching
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function splitIntoSegments(text: string, maxLength = 1200): Array<{text: string, start_para_idx: number}> {
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const segments: Array<{text: string, start_para_idx: number}> = [];
  
  let currentSegment = '';
  let currentStartIdx = 0;
  
  paragraphs.forEach((paragraph, idx) => {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) return;
    
    if (currentSegment.length + trimmedPara.length + 2 <= maxLength) {
      if (currentSegment) {
        currentSegment += '\n\n' + trimmedPara;
      } else {
        currentSegment = trimmedPara;
        currentStartIdx = idx;
      }
    } else {
      if (currentSegment) {
        segments.push({
          text: currentSegment,
          start_para_idx: currentStartIdx
        });
      }
      currentSegment = trimmedPara;
      currentStartIdx = idx;
    }
  });
  
  if (currentSegment) {
    segments.push({
      text: currentSegment,
      start_para_idx: currentStartIdx
    });
  }
  
  return segments;
}

async function analyzeSegmentWithAI(text: string): Promise<'narrator' | 'child' | 'teen' | 'adult_male' | 'adult_female' | 'elder_male' | 'elder_female' | 'creature_robot'> {
  const prompt = `Analyze this text segment and determine the most appropriate voice type for reading it aloud. Consider dialogue, narrative style, and context clues about the speaker.

Text: "${text}"

Respond with ONLY one of these labels:
- narrator: General narrative text, descriptions, non-dialogue content
- child: Dialogue or content clearly from a child character (under 12)
- teen: Dialogue or content from a teenage character (13-17)
- adult_male: Dialogue or content from an adult male character
- adult_female: Dialogue or content from an adult female character  
- elder_male: Dialogue or content from an elderly male character
- elder_female: Dialogue or content from an elderly female character
- creature_robot: Dialogue from non-human characters, robots, creatures

Default to "narrator" if unclear.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a voice casting assistant. Analyze text and assign appropriate voice types for text-to-speech reading.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return 'narrator';
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content?.trim().toLowerCase();
    
    const validLabels = ['narrator', 'child', 'teen', 'adult_male', 'adult_female', 'elder_male', 'elder_female', 'creature_robot'];
    return validLabels.includes(result) ? result as any : 'narrator';
  } catch (error) {
    console.error('AI analysis error:', error);
    return 'narrator';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, book_id } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    // Create hash for caching
    const textHash = createHash(text);
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for cached analysis
    const { data: cachedAnalysis } = await supabase
      .from('tts_analysis_cache')
      .select('analysis')
      .eq('text_hash', textHash)
      .single();

    if (cachedAnalysis) {
      console.log('Using cached analysis for hash:', textHash);
      return new Response(
        JSON.stringify({ 
          success: true, 
          segments: cachedAnalysis.analysis,
          cached: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Split text into segments
    const textSegments = splitIntoSegments(text);
    console.log(`Analyzing ${textSegments.length} segments`);

    // Analyze each segment
    const analyzedSegments: AnalysisSegment[] = [];
    
    for (const segment of textSegments) {
      const label = await analyzeSegmentWithAI(segment.text);
      analyzedSegments.push({
        text: segment.text,
        label,
        start_para_idx: segment.start_para_idx
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Cache the analysis
    try {
      await supabase
        .from('tts_analysis_cache')
        .insert({
          text_hash: textHash,
          book_id,
          analysis: analyzedSegments,
          created_at: new Date().toISOString()
        });
    } catch (cacheError) {
      console.error('Failed to cache analysis:', cacheError);
      // Continue without caching
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        segments: analyzedSegments,
        cached: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TTS Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});