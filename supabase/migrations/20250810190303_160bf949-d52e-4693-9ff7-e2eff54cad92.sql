-- Create clip_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clip_status') THEN
    CREATE TYPE public.clip_status AS ENUM (
      'pending', 'approved', 'declined', 'uploading', 'uploaded', 'failed'
    );
  END IF;
END$$;

-- Create clips table to manage creator uploads with strict RLS
CREATE TABLE IF NOT EXISTS public.clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_id UUID,
  device_id UUID,
  title TEXT,
  description TEXT,
  source_url TEXT,
  thumbnail_url TEXT,
  status public.clip_status NOT NULL DEFAULT 'pending',
  youtube_video_id TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- Policies: parents fully manage their own clips
CREATE POLICY "Parents can view their own clips"
ON public.clips
FOR SELECT
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own clips"
ON public.clips
FOR INSERT
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own clips"
ON public.clips
FOR UPDATE
USING (auth.uid() = parent_id)
WITH CHECK (auth.uid() = parent_id);

-- Optional: prevent deletes for safety (omit DELETE policy)

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_clips_updated_at'
  ) THEN
    CREATE TRIGGER update_clips_updated_at
    BEFORE UPDATE ON public.clips
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_clips_parent_created ON public.clips (parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clips_status ON public.clips (status);
