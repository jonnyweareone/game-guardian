-- Add TTS segments column to book_pages for voice markers
ALTER TABLE public.book_pages 
ADD COLUMN IF NOT EXISTS tts_segments JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance on book_pages queries
CREATE INDEX IF NOT EXISTS idx_book_pages_book_id_page_index 
ON public.book_pages(book_id, page_index);

-- Create TTS analysis cache table
CREATE TABLE IF NOT EXISTS public.tts_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash TEXT NOT NULL UNIQUE,
  book_id UUID,
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create TTS audio cache table
CREATE TABLE IF NOT EXISTS public.tts_audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_hash TEXT NOT NULL UNIQUE,
  voice TEXT NOT NULL,
  text_preview TEXT,
  audio_base64 TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create TTS manifests table
CREATE TABLE IF NOT EXISTS public.tts_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('single', 'multi')),
  voice_style TEXT,
  manifest JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(book_id, mode, voice_style)
);

-- Enable RLS on new tables
ALTER TABLE public.tts_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_audio_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_manifests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for TTS tables (public read access for now)
CREATE POLICY "TTS analysis cache public read" ON public.tts_analysis_cache
FOR SELECT USING (true);

CREATE POLICY "TTS audio cache public read" ON public.tts_audio_cache
FOR SELECT USING (true);

CREATE POLICY "TTS manifests public read" ON public.tts_manifests
FOR SELECT USING (true);

-- Service role can manage all TTS data
CREATE POLICY "Service role can manage TTS analysis cache" ON public.tts_analysis_cache
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage TTS audio cache" ON public.tts_audio_cache
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage TTS manifests" ON public.tts_manifests
FOR ALL USING (true) WITH CHECK (true);