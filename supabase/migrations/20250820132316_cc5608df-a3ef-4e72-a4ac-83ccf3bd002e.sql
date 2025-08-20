
-- 1) Tokens: short-lived parent-minted tokens for child Nova access
CREATE TABLE IF NOT EXISTS public.nova_child_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
ALTER TABLE public.nova_child_tokens ENABLE ROW LEVEL SECURITY;

-- RLS: parents can create/select/update their own child tokens
CREATE POLICY "parents select nova tokens"
  ON public.nova_child_tokens
  FOR SELECT
  USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert nova tokens"
  ON public.nova_child_tokens
  FOR INSERT
  WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents update nova tokens"
  ON public.nova_child_tokens
  FOR UPDATE
  USING (is_parent_of_child(child_id))
  WITH CHECK (is_parent_of_child(child_id));

-- 2) Reading sessions
CREATE TABLE IF NOT EXISTS public.child_reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  total_seconds integer NOT NULL DEFAULT 0,
  current_locator text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS child_reading_sessions_child_idx ON public.child_reading_sessions(child_id);
CREATE INDEX IF NOT EXISTS child_reading_sessions_book_idx ON public.child_reading_sessions(book_id);
ALTER TABLE public.child_reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents select reading sessions"
  ON public.child_reading_sessions
  FOR SELECT
  USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert reading sessions"
  ON public.child_reading_sessions
  FOR INSERT
  WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents update reading sessions"
  ON public.child_reading_sessions
  FOR UPDATE
  USING (is_parent_of_child(child_id))
  WITH CHECK (is_parent_of_child(child_id));

CREATE TRIGGER trg_child_reading_sessions_updated_at
BEFORE UPDATE ON public.child_reading_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Listening state (one row per child)
CREATE TABLE IF NOT EXISTS public.child_listening_state (
  child_id uuid PRIMARY KEY REFERENCES public.children(id) ON DELETE CASCADE,
  is_listening boolean NOT NULL DEFAULT false,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.child_reading_sessions(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.child_listening_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents select listening state"
  ON public.child_listening_state
  FOR SELECT
  USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert listening state"
  ON public.child_listening_state
  FOR INSERT
  WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents update listening state"
  ON public.child_listening_state
  FOR UPDATE
  USING (is_parent_of_child(child_id))
  WITH CHECK (is_parent_of_child(child_id));

CREATE TRIGGER trg_child_listening_state_updated_at
BEFORE UPDATE ON public.child_listening_state
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Reading chunks (progress pings / text samples)
CREATE TABLE IF NOT EXISTS public.reading_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.child_reading_sessions(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  locator text,
  raw_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reading_chunks_session_idx ON public.reading_chunks(session_id);
CREATE INDEX IF NOT EXISTS reading_chunks_child_idx ON public.reading_chunks(child_id);
ALTER TABLE public.reading_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents select reading chunks"
  ON public.reading_chunks
  FOR SELECT
  USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert reading chunks"
  ON public.reading_chunks
  FOR INSERT
  WITH CHECK (is_parent_of_child(child_id));

-- 5) Daily rollups (aggregations)
CREATE TABLE IF NOT EXISTS public.reading_rollups (
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rollup_date date NOT NULL,
  sessions integer NOT NULL DEFAULT 0,
  total_seconds integer NOT NULL DEFAULT 0,
  last_session_at timestamptz,
  last_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, book_id, rollup_date)
);
CREATE INDEX IF NOT EXISTS reading_rollups_child_idx ON public.reading_rollups(child_id);
ALTER TABLE public.reading_rollups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents select reading rollups"
  ON public.reading_rollups
  FOR SELECT
  USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert reading rollups"
  ON public.reading_rollups
  FOR INSERT
  WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents update reading rollups"
  ON public.reading_rollups
  FOR UPDATE
  USING (is_parent_of_child(child_id))
  WITH CHECK (is_parent_of_child(child_id));

CREATE TRIGGER trg_reading_rollups_updated_at
BEFORE UPDATE ON public.reading_rollups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Timeline (audit-style events)
CREATE TABLE IF NOT EXISTS public.child_reading_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  session_id uuid REFERENCES public.child_reading_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS child_reading_timeline_child_idx ON public.child_reading_timeline(child_id);
CREATE INDEX IF NOT EXISTS child_reading_timeline_created_idx ON public.child_reading_timeline(created_at);
ALTER TABLE public.child_reading_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents select reading timeline"
  ON public.child_reading_timeline
  FOR SELECT
  USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert reading timeline"
  ON public.child_reading_timeline
  FOR INSERT
  WITH CHECK (is_parent_of_child(child_id));
