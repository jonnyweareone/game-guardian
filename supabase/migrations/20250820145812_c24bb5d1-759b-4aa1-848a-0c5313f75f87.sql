-- Nova AI Reading Coach tables
create extension if not exists pgcrypto;

-- Live session (per reading start/stop)
create table if not exists public.child_reading_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_seconds int default 0,
  current_locator text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.child_reading_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_reading_sessions
CREATE POLICY "parents insert reading sessions" ON public.child_reading_sessions 
FOR INSERT WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents select reading sessions" ON public.child_reading_sessions 
FOR SELECT USING (is_parent_of_child(child_id));

CREATE POLICY "parents update reading sessions" ON public.child_reading_sessions 
FOR UPDATE USING (is_parent_of_child(child_id)) WITH CHECK (is_parent_of_child(child_id));

-- Text snippets captured during reading (chapter/page granularity)
create table if not exists public.reading_chunks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.child_reading_sessions(id) on delete cascade,
  child_id uuid not null,
  book_id uuid not null,
  locator text,
  raw_text text,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.reading_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for reading_chunks
CREATE POLICY "parents insert reading chunks" ON public.reading_chunks 
FOR INSERT WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents select reading chunks" ON public.reading_chunks 
FOR SELECT USING (is_parent_of_child(child_id));

-- AI insights per chunk or per session
create table if not exists public.ai_reading_insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.child_reading_sessions(id) on delete cascade,
  child_id uuid not null,
  book_id uuid not null,
  scope text not null check (scope in ('chunk','session')),
  locator text,
  summary text,
  key_points text[],
  questions text[],
  difficulty numeric(4,2),
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.ai_reading_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_reading_insights
CREATE POLICY "parents select ai insights" ON public.ai_reading_insights 
FOR SELECT USING (is_parent_of_child(child_id));

-- Problem words detected by AI with phonetics
create table if not exists public.problem_words (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.child_reading_sessions(id) on delete cascade,
  child_id uuid not null,
  book_id uuid not null,
  word text not null,
  count int default 1,
  syllables int,
  ipa text,
  phonemes text[],
  hints text[],
  first_seen_locator text,
  last_seen_locator text,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.problem_words ENABLE ROW LEVEL SECURITY;

-- RLS policies for problem_words
CREATE POLICY "parents select problem words" ON public.problem_words 
FOR SELECT USING (is_parent_of_child(child_id));

-- Roll-up per child/book over time (for Parent dashboard)
create table if not exists public.reading_rollups (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  total_seconds int default 0,
  pages_completed int default 0,
  sessions int default 0,
  last_session_at timestamptz,
  last_summary text,
  updated_at timestamptz default now(),
  unique (child_id, book_id)
);

-- Enable RLS
ALTER TABLE public.reading_rollups ENABLE ROW LEVEL SECURITY;

-- RLS policies for reading_rollups
CREATE POLICY "parents select reading rollups" ON public.reading_rollups 
FOR SELECT USING (is_parent_of_child(child_id));

CREATE POLICY "parents insert reading rollups" ON public.reading_rollups 
FOR INSERT WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents update reading rollups" ON public.reading_rollups 
FOR UPDATE USING (is_parent_of_child(child_id)) WITH CHECK (is_parent_of_child(child_id));

-- Child listening state for real-time updates
create table if not exists public.child_listening_state (
  child_id uuid primary key,
  is_listening boolean not null default false,
  book_id uuid,
  session_id uuid,
  updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.child_listening_state ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_listening_state
CREATE POLICY "parents insert listening state" ON public.child_listening_state 
FOR INSERT WITH CHECK (is_parent_of_child(child_id));

CREATE POLICY "parents select listening state" ON public.child_listening_state 
FOR SELECT USING (is_parent_of_child(child_id));

CREATE POLICY "parents update listening state" ON public.child_listening_state 
FOR UPDATE USING (is_parent_of_child(child_id)) WITH CHECK (is_parent_of_child(child_id));

-- Trigger for reading rollups
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_reading_rollup_touch on public.reading_rollups;
create trigger trg_reading_rollup_touch
before update on public.reading_rollups
for each row execute function public.update_updated_at_column();