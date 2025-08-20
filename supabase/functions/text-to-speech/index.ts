import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Text-to-Speech function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy', bookTitle, characterName } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Generating speech for text length:', text.length);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Select voice based on character or content type
    let selectedVoice = voice;
    if (characterName || bookTitle) {
      selectedVoice = selectVoiceForCharacter(characterName, bookTitle);
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Use HD model for better quality
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
        speed: 0.9, // Slightly slower for children
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate speech');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoice,
        duration: Math.ceil(text.length / 10) // Rough estimate
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function selectVoiceForCharacter(characterName?: string, bookTitle?: string): string {
  // Child-friendly voice mapping
  const voiceMap: Record<string, string> = {
    // Character-based voices
    'narrator': 'nova', // Warm, storytelling voice
    'alice': 'shimmer', // Young, curious female
    'harry': 'onyx', // Young male adventure voice
    'hermione': 'nova', // Intelligent, clear female
    'mother': 'alloy', // Warm, nurturing
    'father': 'echo', // Gentle, authoritative male
    'child': 'shimmer', // Playful, young
    'teacher': 'nova', // Clear, educational
    'princess': 'shimmer', // Gentle, regal female
    'prince': 'fable', // Noble, young male
    'wizard': 'onyx', // Wise, mysterious
    'dragon': 'echo', // Deep, powerful
    'fairy': 'shimmer', // Light, magical
    'bear': 'echo', // Deep, friendly
    'rabbit': 'fable', // Quick, energetic
    // Default fallbacks
    'default_male': 'fable',
    'default_female': 'shimmer',
    'default_narrator': 'nova'
  };

  if (characterName) {
    const lowerName = characterName.toLowerCase();
    // Check for exact matches first
    if (voiceMap[lowerName]) {
      return voiceMap[lowerName];
    }
    
    // Check for partial matches or character types
    if (lowerName.includes('mother') || lowerName.includes('mom')) return 'alloy';
    if (lowerName.includes('father') || lowerName.includes('dad')) return 'echo';
    if (lowerName.includes('child') || lowerName.includes('kid')) return 'shimmer';
    if (lowerName.includes('teacher') || lowerName.includes('professor')) return 'nova';
    if (lowerName.includes('princess') || lowerName.includes('queen')) return 'shimmer';
    if (lowerName.includes('prince') || lowerName.includes('king')) return 'fable';
    if (lowerName.includes('wizard') || lowerName.includes('witch')) return 'onyx';
    if (lowerName.includes('dragon') || lowerName.includes('monster')) return 'echo';
    if (lowerName.includes('fairy') || lowerName.includes('angel')) return 'shimmer';
  }

  // Book-specific voice selection
  if (bookTitle) {
    const lowerTitle = bookTitle.toLowerCase();
    if (lowerTitle.includes('alice')) return 'shimmer';
    if (lowerTitle.includes('harry potter')) return 'fable';
    if (lowerTitle.includes('princess') || lowerTitle.includes('fairy')) return 'shimmer';
    if (lowerTitle.includes('adventure') || lowerTitle.includes('quest')) return 'fable';
    if (lowerTitle.includes('science') || lowerTitle.includes('learn')) return 'nova';
  }

  // Default to nova for general educational content
  return 'nova';
}