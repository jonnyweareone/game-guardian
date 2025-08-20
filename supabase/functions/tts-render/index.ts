import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Voice mapping configuration
const VOICE_MAPPING = {
  narrator: 'alloy',
  child: 'nova',
  teen: 'shimmer',
  adult_male: 'onyx',
  adult_female: 'alloy',
  elder_male: 'echo',
  elder_female: 'shimmer',
  creature_robot: 'fable'
};

const SINGLE_VOICE_PRESETS = {
  storybook: 'alloy',
  playful: 'nova',
  calm: 'shimmer'
};

interface RenderSegment {
  text: string;
  label: string;
  start_para_idx: number;
}

interface AudioManifestItem {
  audioUrl: string;
  label: string;
  startParaIdx: number;
  duration?: number;
}

function createAudioHash(voice: string, text: string): string {
  const combined = `${voice}:${text}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

async function generateSpeech(text: string, voice: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text.substring(0, 4000), // OpenAI limit
        voice: voice,
        response_format: 'mp3',
        speed: 0.9, // Slightly slower for children
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'TTS generation failed');
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Fix base64 encoding to prevent stack overflow with large files
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 8192; // Process in chunks to avoid stack overflow
    let base64Audio = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      const chunkString = String.fromCharCode.apply(null, Array.from(chunk));
      base64Audio += btoa(chunkString);
    }

    return base64Audio;
  } catch (error) {
    console.error('TTS generation error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bookId, mode, voiceStyle, segments } = await req.json();
    
    if (!bookId || !mode || !segments) {
      throw new Error('Missing required parameters: bookId, mode, segments');
    }

    console.log(`Rendering TTS for book ${bookId} in ${mode} mode`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const manifest: AudioManifestItem[] = [];
    const rateLimitDelay = 1000; // 1 second between requests

    for (const segment of segments) {
      let selectedVoice: string;
      
      if (mode === 'single') {
        selectedVoice = SINGLE_VOICE_PRESETS[voiceStyle as keyof typeof SINGLE_VOICE_PRESETS] || SINGLE_VOICE_PRESETS.storybook;
      } else {
        selectedVoice = VOICE_MAPPING[segment.label as keyof typeof VOICE_MAPPING] || VOICE_MAPPING.narrator;
      }

      const audioHash = createAudioHash(selectedVoice, segment.text);
      
      // Check for cached audio
      const { data: cachedAudio } = await supabase
        .from('tts_audio_cache')
        .select('audio_base64, duration')
        .eq('audio_hash', audioHash)
        .single();

      let audioBase64: string;
      let duration: number | undefined;

      if (cachedAudio) {
        console.log('Using cached audio for segment');
        audioBase64 = cachedAudio.audio_base64;
        duration = cachedAudio.duration;
      } else {
        console.log(`Generating speech for segment with voice: ${selectedVoice}`);
        audioBase64 = await generateSpeech(segment.text, selectedVoice);
        
        // Estimate duration (rough calculation: ~150 words per minute)
        const wordCount = segment.text.split(' ').length;
        duration = Math.round((wordCount / 150) * 60);

        // Cache the generated audio
        try {
          await supabase
            .from('tts_audio_cache')
            .insert({
              audio_hash: audioHash,
              voice: selectedVoice,
              text_preview: segment.text.substring(0, 100),
              audio_base64: audioBase64,
              duration: duration,
              created_at: new Date().toISOString()
            });
        } catch (cacheError) {
          console.error('Failed to cache audio:', cacheError);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
      }

      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      
      manifest.push({
        audioUrl,
        label: segment.label,
        startParaIdx: segment.start_para_idx,
        duration
      });
    }

    // Store the complete manifest for the book
    try {
      await supabase
        .from('tts_manifests')
        .upsert({
          book_id: bookId,
          mode,
          voice_style: voiceStyle || null,
          manifest,
          created_at: new Date().toISOString()
        }, { onConflict: 'book_id,mode,voice_style' });
    } catch (manifestError) {
      console.error('Failed to store manifest:', manifestError);
    }

    console.log(`Generated ${manifest.length} audio segments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        manifest,
        totalSegments: manifest.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TTS Render error:', error);
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