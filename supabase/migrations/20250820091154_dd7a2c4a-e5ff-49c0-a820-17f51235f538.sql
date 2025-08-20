
-- 20250820_nova_edu.sql

-- BOOKS CATALOG
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  age_min int,
  age_max int,
  category text,         -- fiction / non-fiction
  subject text,          -- KS tag e.g. "History"
  ks text,               -- KS1/KS2/KS3/KS4
  source_url text,
  created_at timestamptz default now()
);

create index if not exists idx_books_age on public.books(age_min, age_max);

-- READING SESSIONS
create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  book_id uuid references public.books(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  pages_target int,
  pages_completed int default 0,
  words_estimated int,
  transcript_ms int,
  ai_difficulty text,
  ai_summary text,
  ai_flags jsonb default '{}'::jsonb,
  coins_earned int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_reading_child on public.reading_sessions(child_id, started_at desc);

-- LEARNING ACTIVITIES
create table if not exists public.learning_activities (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  subject text not null,
  topic text,
  ks text,
  source text,
  duration_minutes int default 0,
  score numeric,
  passed boolean,
  evidence_url text,
  coins_earned int default 0,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_learn_child on public.learning_activities(child_id, created_at desc);

-- PARENT TIMELINE ENUM
do $$
begin
  if not exists (select 1 from pg_type where typname='event_kind') then
    create type event_kind as enum ('reading','learning','reward','store','system');
  end if;
end$$;

-- PARENT TIMELINE
create table if not exists public.parent_timeline (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null,
  child_id uuid not null references public.children(id) on delete cascade,
  kind event_kind not null,
  title text not null,
  detail jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_timeline_parent on public.parent_timeline(parent_user_id, created_at desc);

-- ENABLE RLS
alter table public.books enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.learning_activities enable row level security;
alter table public.parent_timeline enable row level security;

-- RLS POLICIES (idempotent via DO blocks)

-- Books: public readable (or keep as true)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='books' and policyname='books_read_all'
  ) then
    create policy books_read_all on public.books
      for select using (true);
  end if;
end$$;

-- Reading: parent can view child rows
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='reading_sessions' and policyname='reading_parent_view'
  ) then
    create policy reading_parent_view on public.reading_sessions
      for select using (exists (
        select 1 from public.children c
        where c.id = reading_sessions.child_id and c.parent_id = auth.uid()
      ));
  end if;
end$$;

-- Reading: parent can insert child rows
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='reading_sessions' and policyname='reading_insert_childctx'
  ) then
    create policy reading_insert_childctx on public.reading_sessions
      for insert with check (exists (
        select 1 from public.children c
        where c.id = reading_sessions.child_id and c.parent_id = auth.uid()
      ));
  end if;
end$$;

-- Reading: parent can update child rows (to finalize sessions)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='reading_sessions' and policyname='reading_update_childctx'
  ) then
    create policy reading_update_childctx on public.reading_sessions
      for update using (exists (
        select 1 from public.children c
        where c.id = reading_sessions.child_id and c.parent_id = auth.uid()
      ));
  end if;
end$$;

-- Learning: parent can view child rows
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='learning_activities' and policyname='learn_parent_view'
  ) then
    create policy learn_parent_view on public.learning_activities
      for select using (exists (
        select 1 from public.children c
        where c.id = learning_activities.child_id and c.parent_id = auth.uid()
      ));
  end if;
end$$;

-- Learning: parent can insert child rows
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='learning_activities' and policyname='learn_insert_childctx'
  ) then
    create policy learn_insert_childctx on public.learning_activities
      for insert with check (exists (
        select 1 from public.children c
        where c.id = learning_activities.child_id and c.parent_id = auth.uid()
      ));
  end if;
end$$;

-- Learning: parent can update child rows
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='learning_activities' and policyname='learn_update_childctx'
  ) then
    create policy learn_update_childctx on public.learning_activities
      for update using (exists (
        select 1 from public.children c
        where c.id = learning_activities.child_id and c.parent_id = auth.uid()
      ));
  end if;
end$$;

-- Timeline: parent can view their feed
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='parent_timeline' and policyname='timeline_parent_view'
  ) then
    create policy timeline_parent_view on public.parent_timeline
      for select using (parent_user_id = auth.uid());
  end if;
end$$;

-- Timeline: parent can write their feed
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='parent_timeline' and policyname='timeline_parent_write'
  ) then
    create policy timeline_parent_write on public.parent_timeline
      for insert with check (parent_user_id = auth.uid());
  end if;
end$$;

-- Safe coin award helper (used by Edge Function)
create or replace function public.award_coins(p_child uuid, p_delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- ensure caller owns the child
  if not exists (
    select 1 from public.children c
    where c.id = p_child and c.parent_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  perform public.ensure_wallet(p_child);

  update public.wallets
    set coins = coins + coalesce(p_delta, 0), updated_at = now()
    where child_id = p_child;
end$$;
