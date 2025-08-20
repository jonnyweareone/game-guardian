
-- 1) Add non-breaking columns to books (if they don't already exist)
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS gutenberg_id integer;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS ingested boolean NOT NULL DEFAULT false;

-- 2) Pages of ingested books
CREATE TABLE IF NOT EXISTS public.book_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL,
  page_index integer NOT NULL,
  content text NOT NULL,
  tokens jsonb,           -- optional: precomputed tokens/offsets for precise highlighting
  image_url text,         -- optional: image to show above this page
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique page per book
CREATE UNIQUE INDEX IF NOT EXISTS book_pages_book_page_idx ON public.book_pages(book_id, page_index);

-- RLS: pages contain only public book text, allow read by all, writes restricted to service_role
ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "book_pages public read" ON public.book_pages;
CREATE POLICY "book_pages public read"
  ON public.book_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "book_pages service writes" ON public.book_pages;
CREATE POLICY "book_pages service writes"
  ON public.book_pages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3) Track reading sessions per user/child/book
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,         -- auth.uid()
  child_id uuid NOT NULL,        -- app-level child identifier (uuid/text), no FK to auth
  book_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  current_page integer NOT NULL DEFAULT 0,
  tokens_read integer NOT NULL DEFAULT 0
);

ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: a user can manage only their own sessions
DROP POLICY IF EXISTS "reading_sessions select own" ON public.reading_sessions;
CREATE POLICY "reading_sessions select own"
  ON public.reading_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_sessions insert own" ON public.reading_sessions;
CREATE POLICY "reading_sessions insert own"
  ON public.reading_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_sessions update own" ON public.reading_sessions;
CREATE POLICY "reading_sessions update own"
  ON public.reading_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_sessions delete own" ON public.reading_sessions;
CREATE POLICY "reading_sessions delete own"
  ON public.reading_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reading_sessions_user_book_idx ON public.reading_sessions(user_id, child_id, book_id);

-- 4) Per-page progress and rewards
CREATE TABLE IF NOT EXISTS public.child_page_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,         -- auth.uid()
  child_id uuid NOT NULL,        -- app-level child identifier
  book_id uuid NOT NULL,
  page_index integer NOT NULL,
  read_percent numeric NOT NULL DEFAULT 0,  -- 0..100
  coins_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.child_page_progress ENABLE ROW LEVEL SECURITY;

-- Policies: user can only manage their own child's progress
DROP POLICY IF EXISTS "child_page_progress select own" ON public.child_page_progress;
CREATE POLICY "child_page_progress select own"
  ON public.child_page_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "child_page_progress insert own" ON public.child_page_progress;
CREATE POLICY "child_page_progress insert own"
  ON public.child_page_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "child_page_progress update own" ON public.child_page_progress;
CREATE POLICY "child_page_progress update own"
  ON public.child_page_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "child_page_progress delete own" ON public.child_page_progress;
CREATE POLICY "child_page_progress delete own"
  ON public.child_page_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Unique constraint so we can upsert one row per page per child/book
CREATE UNIQUE INDEX IF NOT EXISTS child_page_progress_unique
  ON public.child_page_progress(user_id, child_id, book_id, page_index);

-- 5) (Optional) Ingest jobs table to track ingestion runs and errors
CREATE TABLE IF NOT EXISTS public.book_ingests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,                     -- who requested it (optional)
  book_id uuid,                     -- filled after first insert or when known
  source_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending | processing | completed | failed
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

ALTER TABLE public.book_ingests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create/list their own ingest jobs (if user-initiated)
DROP POLICY IF EXISTS "book_ingests select own or public" ON public.book_ingests;
CREATE POLICY "book_ingests select own or public"
  ON public.book_ingests
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "book_ingests insert own" ON public.book_ingests;
CREATE POLICY "book_ingests insert own"
  ON public.book_ingests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Service role can manage ingestion
DROP POLICY IF EXISTS "book_ingests service writes" ON public.book_ingests;
CREATE POLICY "book_ingests service writes"
  ON public.book_ingests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
