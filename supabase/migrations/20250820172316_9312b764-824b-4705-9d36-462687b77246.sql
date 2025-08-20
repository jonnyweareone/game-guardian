-- Create TTS analysis cache table
CREATE TABLE IF NOT EXISTS public.tts_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text_hash TEXT NOT NULL UNIQUE,
  book_id UUID,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create TTS audio cache table
CREATE TABLE IF NOT EXISTS public.tts_audio_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_hash TEXT NOT NULL UNIQUE,
  voice TEXT NOT NULL,
  text_preview TEXT,
  audio_base64 TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create TTS manifests table
CREATE TABLE IF NOT EXISTS public.tts_manifests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('single', 'multi')),
  voice_style TEXT,
  manifest JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, mode, voice_style)
);

-- Create child TTS preferences table
CREATE TABLE IF NOT EXISTS public.child_tts_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL UNIQUE,
  multi_voice BOOLEAN NOT NULL DEFAULT false,
  voice_style TEXT NOT NULL DEFAULT 'storybook',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tts_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_audio_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_tts_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for TTS cache tables (service accessible)
CREATE POLICY "TTS cache read access" ON public.tts_analysis_cache FOR SELECT USING (true);
CREATE POLICY "TTS cache write access" ON public.tts_analysis_cache FOR INSERT WITH CHECK (true);

CREATE POLICY "Audio cache read access" ON public.tts_audio_cache FOR SELECT USING (true);
CREATE POLICY "Audio cache write access" ON public.tts_audio_cache FOR INSERT WITH CHECK (true);

CREATE POLICY "TTS manifests read access" ON public.tts_manifests FOR SELECT USING (true);
CREATE POLICY "TTS manifests write access" ON public.tts_manifests FOR ALL WITH CHECK (true);

-- RLS Policies for child preferences (parent access only)
CREATE POLICY "Parents can manage child TTS preferences" ON public.child_tts_preferences 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children c 
      WHERE c.id = child_tts_preferences.child_id 
      AND c.parent_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tts_analysis_cache_text_hash ON public.tts_analysis_cache(text_hash);
CREATE INDEX IF NOT EXISTS idx_tts_analysis_cache_book_id ON public.tts_analysis_cache(book_id);
CREATE INDEX IF NOT EXISTS idx_tts_audio_cache_audio_hash ON public.tts_audio_cache(audio_hash);
CREATE INDEX IF NOT EXISTS idx_tts_audio_cache_voice ON public.tts_audio_cache(voice);
CREATE INDEX IF NOT EXISTS idx_tts_manifests_book_id ON public.tts_manifests(book_id);
CREATE INDEX IF NOT EXISTS idx_child_tts_preferences_child_id ON public.child_tts_preferences(child_id);