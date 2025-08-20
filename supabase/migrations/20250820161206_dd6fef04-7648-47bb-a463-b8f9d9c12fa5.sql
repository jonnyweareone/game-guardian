
-- 1) Non-breaking columns for books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS gutenberg_id integer;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS ingested boolean NOT NULL DEFAULT false;

-- 2) Pages of ingested books (public-domain text we render ourselves)
CREATE TABLE IF NOT EXISTS public.book_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_index integer NOT NULL,
  content text NOT NULL,
  tokens jsonb,          -- optional: [{ word, start, end }, ...]
  image_url text,        -- optional: page image
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS book_pages_book_page_idx
  ON public.book_pages(book_id, page_index);

ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;

-- Public read (text is public-domain). Writes allowed to service role only (edge function).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'book_pages' AND policyname = 'book_pages public read'
  ) THEN
    CREATE POLICY "book_pages public read"
      ON public.book_pages
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'book_pages' AND policyname = 'book_pages service writes'
  ) THEN
    CREATE POLICY "book_pages service writes"
      ON public.book_pages
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

-- 3) Track per-page progress and coins
CREATE TABLE IF NOT EXISTS public.child_page_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_index integer NOT NULL,
  read_percent numeric NOT NULL DEFAULT 0,   -- 0..100
  coins_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS child_page_progress_unique
  ON public.child_page_progress(child_id, book_id, page_index);

ALTER TABLE public.child_page_progress ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own child's page progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_page_progress' AND policyname = 'cpp parents select'
  ) THEN
    CREATE POLICY "cpp parents select"
      ON public.child_page_progress
      FOR SELECT
      TO authenticated
      USING (public.is_parent_of_child(child_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_page_progress' AND policyname = 'cpp parents insert'
  ) THEN
    CREATE POLICY "cpp parents insert"
      ON public.child_page_progress
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_parent_of_child(child_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_page_progress' AND policyname = 'cpp parents update'
  ) THEN
    CREATE POLICY "cpp parents update"
      ON public.child_page_progress
      FOR UPDATE
      TO authenticated
      USING (public.is_parent_of_child(child_id))
      WITH CHECK (public.is_parent_of_child(child_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_page_progress' AND policyname = 'cpp parents delete'
  ) THEN
    CREATE POLICY "cpp parents delete"
      ON public.child_page_progress
      FOR DELETE
      TO authenticated
      USING (public.is_parent_of_child(child_id));
  END IF;
END$$;

-- Keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
      WHERE tgname = 'child_page_progress_set_updated_at'
  ) THEN
    CREATE TRIGGER child_page_progress_set_updated_at
      BEFORE UPDATE ON public.child_page_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) Ingestion job tracking (so we can queue/monitor pulls from Gutenberg)
CREATE TABLE IF NOT EXISTS public.book_ingests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,          -- optional: who requested it
  book_id uuid,          -- filled after book is created or matched
  source_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending | processing | completed | failed
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

ALTER TABLE public.book_ingests ENABLE ROW LEVEL SECURITY;

-- Users can create/select their own jobs; service role can do everything
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'book_ingests' AND policyname = 'book_ingests select own/public'
  ) THEN
    CREATE POLICY "book_ingests select own/public"
      ON public.book_ingests
      FOR SELECT
      TO authenticated
      USING (user_id IS NULL OR auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'book_ingests' AND policyname = 'book_ingests insert own'
  ) THEN
    CREATE POLICY "book_ingests insert own"
      ON public.book_ingests
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'book_ingests' AND policyname = 'book_ingests service writes'
  ) THEN
    CREATE POLICY "book_ingests service writes"
      ON public.book_ingests
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;
