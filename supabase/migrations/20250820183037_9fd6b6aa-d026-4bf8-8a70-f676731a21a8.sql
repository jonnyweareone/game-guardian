-- Allow re-ingest jobs without a source_url
ALTER TABLE public.book_ingests ALTER COLUMN source_url DROP NOT NULL;

-- TTS Analysis cache (segments per text hash)
CREATE TABLE IF NOT EXISTS public.tts_analysis_cache (
  text_hash TEXT PRIMARY KEY,
  book_id UUID NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tts_analysis_cache ENABLE ROW LEVEL SECURITY;
-- Service writes (edge functions use service role which bypasses RLS, but keep consistent)
CREATE POLICY "tts_analysis_cache service writes" ON public.tts_analysis_cache
FOR ALL USING (true) WITH CHECK (true);

-- TTS Audio cache (audio base64 per voice+text hash)
CREATE TABLE IF NOT EXISTS public.tts_audio_cache (
  audio_hash TEXT PRIMARY KEY,
  voice TEXT NOT NULL,
  text_preview TEXT,
  audio_base64 TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tts_audio_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tts_audio_cache service writes" ON public.tts_audio_cache
FOR ALL USING (true) WITH CHECK (true);

-- TTS Manifests (per book/mode/style)
CREATE TABLE IF NOT EXISTS public.tts_manifests (
  book_id UUID NOT NULL,
  mode TEXT NOT NULL,
  voice_style TEXT,
  manifest JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (book_id, mode, voice_style)
);
ALTER TABLE public.tts_manifests ENABLE ROW LEVEL SECURITY;
-- Public read so the app can load manifests without special perms
CREATE POLICY "tts_manifests public read" ON public.tts_manifests
FOR SELECT USING (true);
-- Service writes
CREATE POLICY "tts_manifests service writes" ON public.tts_manifests
FOR ALL USING (true) WITH CHECK (true);

-- Helpful index for pages
CREATE INDEX IF NOT EXISTS idx_book_pages_book_page ON public.book_pages(book_id, page_index);
