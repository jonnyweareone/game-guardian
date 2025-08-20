
-- 0) Safe prereq
create extension if not exists pgcrypto;

-- 1) Extend existing public.books (non-destructive, add-only)
alter table public.books add column if not exists source text;
alter table public.books add column if not exists source_id text;
alter table public.books add column if not exists authors text[] default '{}'::text[];
alter table public.books add column if not exists description text;
alter table public.books add column if not exists language text default 'en';
alter table public.books add column if not exists subjects text[] default '{}'::text[];
alter table public.books add column if not exists level_tags text[] default '{}'::text[];
alter table public.books add column if not exists license text default 'Public Domain';
alter table public.books add column if not exists cover_url text;
alter table public.books add column if not exists download_epub_url text;
alter table public.books add column if not exists download_pdf_url text;
alter table public.books add column if not exists read_online_url text;
alter table public.books add column if not exists has_audio boolean default false;
alter table public.books add column if not exists pages int;
alter table public.books add column if not exists published_year int;

create unique index if not exists idx_books_source_source_id on public.books(source, source_id);

-- 2) Curriculum topics and mapping
create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  phase text not null default 'KS2',
  subject_area text not null,
  topic text not null,
  slug text not null unique,
  keywords text[] default '{}'::text[]
);

create table if not exists public.book_topics (
  book_id uuid not null references public.books(id) on delete cascade,
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  primary key (book_id, topic_id)
);

-- 3) Enums for reading status and timeline events
do $$ begin
  create type read_status as enum ('not_started','in_progress','finished','abandoned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reading_event_type as enum ('started','progress','finished','note','highlight');
exception when duplicate_object then null; end $$;

-- 4) Child bookshelf + reading events + view + trigger
create table if not exists public.child_bookshelf (
  child_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  status read_status not null default 'not_started',
  progress numeric(5,2) default 0.0,
  last_location jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  saved_offline boolean default false,
  primary key (child_id, book_id)
);

create table if not exists public.reading_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  event_type reading_event_type not null,
  progress numeric(5,2),
  note text,
  location jsonb,
  created_at timestamptz default now()
);

create or replace view public.child_reading_timeline as
select e.*, b.title, b.cover_url
from public.reading_events e
join public.books b on b.id = e.book_id;

create or replace function public._log_bookshelf_status_change()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' then
    if NEW.status is distinct from OLD.status then
      if NEW.status = 'in_progress' then
        insert into public.reading_events(child_id, book_id, event_type, progress, location)
        values (NEW.child_id, NEW.book_id, 'started', coalesce(NEW.progress,0), NEW.last_location);
      elsif NEW.status = 'finished' then
        insert into public.reading_events(child_id, book_id, event_type, progress, location)
        values (NEW.child_id, NEW.book_id, 'finished', 100, NEW.last_location);
      end if;
    elsif NEW.progress is not null and (OLD.progress is null or NEW.progress - OLD.progress >= 5) then
      insert into public.reading_events(child_id, book_id, event_type, progress, location)
      values (NEW.child_id, NEW.book_id, 'progress', NEW.progress, NEW.last_location);
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_log_bookshelf_status on public.child_bookshelf;
create trigger trg_log_bookshelf_status
after update on public.child_bookshelf
for each row execute function public._log_bookshelf_status_change();

-- 5) Listening state (web + desktop can subscribe)
create table if not exists public.child_listening_state (
  child_id uuid primary key,
  is_listening boolean not null default false,
  book_id uuid,
  started_at timestamptz,
  updated_at timestamptz default now()
);

create or replace function public._bump_child_listening_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_bump_child_listening on public.child_listening_state;
create trigger trg_bump_child_listening
before update on public.child_listening_state
for each row execute function public._bump_child_listening_updated_at();

-- 6) AI Reading Coach schema (sessions, chunks, insights, words, rollups)
create table if not exists public.child_reading_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_seconds int default 0,
  pages_viewed int default 0,
  words_seen int default 0,
  avg_wpm numeric(6,2),
  created_at timestamptz default now()
);

create table if not exists public.reading_chunks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.child_reading_sessions(id) on delete cascade,
  child_id uuid not null,
  book_id uuid not null,
  locator jsonb,
  raw_text text,
  char_count int,
  word_count int,
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists public.ai_reading_insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.child_reading_sessions(id) on delete cascade,
  child_id uuid not null,
  book_id uuid not null,
  scope text not null check (scope in ('chunk','session')),
  locator jsonb,
  summary text,
  key_points text[],
  questions text[],
  difficulty numeric(4,2),
  created_at timestamptz default now()
);

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
  first_seen_locator jsonb,
  last_seen_locator jsonb,
  created_at timestamptz default now()
);

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

create or replace function public._reading_rollup_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_reading_rollup_touch on public.reading_rollups;
create trigger trg_reading_rollup_touch
before update on public.reading_rollups
for each row execute function public._reading_rollup_touch();

-- 7) Helpful indexes
create index if not exists idx_child_bookshelf_child on public.child_bookshelf(child_id);
create index if not exists idx_child_bookshelf_status on public.child_bookshelf(child_id, status);
create index if not exists idx_reading_events_child on public.reading_events(child_id, created_at desc);
create index if not exists idx_reading_chunks_session on public.reading_chunks(session_id);
create index if not exists idx_ai_insights_child on public.ai_reading_insights(child_id, created_at desc);

-- 8) RLS: enable and add safe policies (parents manage/read their children)
alter table public.curriculum_topics enable row level security;
alter table public.book_topics enable row level security;
alter table public.child_bookshelf enable row level security;
alter table public.reading_events enable row level security;
alter table public.child_listening_state enable row level security;
alter table public.child_reading_sessions enable row level security;
alter table public.reading_chunks enable row level security;
alter table public.ai_reading_insights enable row level security;
alter table public.problem_words enable row level security;
alter table public.reading_rollups enable row level security;

do $$ begin
  create policy topics_select_all on public.curriculum_topics for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy book_topics_select_all on public.book_topics for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy bookshelf_select on public.child_bookshelf for select using (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy bookshelf_ins on public.child_bookshelf for insert with check (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy bookshelf_upd on public.child_bookshelf for update using (public.is_parent_of_child(child_id)) with check (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy bookshelf_del on public.child_bookshelf for delete using (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy revents_select on public.reading_events for select using (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy listening_rw on public.child_listening_state
  for all using (public.is_parent_of_child(child_id)) with check (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy sessions_rw on public.child_reading_sessions
  for all using (public.is_parent_of_child(child_id)) with check (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy chunks_rw on public.reading_chunks
  for all using (public.is_parent_of_child(child_id)) with check (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy insights_select on public.ai_reading_insights for select using (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pwords_select on public.problem_words for select using (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy rollups_rw on public.reading_rollups
  for all using (public.is_parent_of_child(child_id)) with check (public.is_parent_of_child(child_id));
exception when duplicate_object then null; end $$;

-- 9) Seed KS2 books only if table is empty (non-destructive)
insert into public.books (source,source_id,title,authors,description,language,subjects,age_min,age_max,level_tags,license,cover_url,download_epub_url,read_online_url,has_audio,pages,published_year)
select * from (values
  ('gutenberg','120','Alice''s Adventures in Wonderland','{Lewis Carroll}','Alice falls into a fantastical world.','en','{Fantasy,Adventure,KS2}',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/120/pg120.cover.medium.jpg','https://www.gutenberg.org/ebooks/120.epub.images','https://www.gutenberg.org/ebooks/120',false,200,1865),
  ('gutenberg','16','Peter Pan','{J. M. Barrie}','Adventures in Neverland.','en','{Fantasy,Adventure,KS2}',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/16/pg16.cover.medium.jpg','https://www.gutenberg.org/ebooks/16.epub.images','https://www.gutenberg.org/ebooks/16',false,200,1911),
  ('gutenberg','55','The Wonderful Wizard of Oz','{L. Frank Baum}','Dorothy journeys to Oz.','en','{Fantasy,Adventure,KS2}',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/55/pg55.cover.medium.jpg','https://www.gutenberg.org/ebooks/55.epub.images','https://www.gutenberg.org/ebooks/55',false,160,1900),
  ('gutenberg','113','The Secret Garden','{Frances Hodgson Burnett}','A hidden garden transforms lives.','en','{Friendship,Nature,KS2}',8,11,'{KS2,Year 5,Year 6}','Public Domain','https://www.gutenberg.org/cache/epub/113/pg113.cover.medium.jpg','https://www.gutenberg.org/ebooks/113.epub.images','https://www.gutenberg.org/ebooks/113',false,250,1911),
  ('gutenberg','289','The Wind in the Willows','{Kenneth Grahame}','Riverbank adventures of Mole, Rat, Toad, Badger.','en','{Animals,Friendship,KS2}',7,10,'{KS2,Year 3,Year 4}','Public Domain','https://www.gutenberg.org/cache/epub/289/pg289.cover.medium.jpg','https://www.gutenberg.org/ebooks/289.epub.images','https://www.gutenberg.org/ebooks/289',false,220,1908)
) as v
where not exists (select 1 from public.books);

-- 10) Seed core KS2 topics (skip if already exist)
insert into public.curriculum_topics (phase,subject_area,topic,slug,keywords) values
('KS2','English','Victorian/Edwardian Children''s Classics','english-victorian-edwardian','{victorian,edwardian,classics}'),
('KS2','Science','Animals including Humans','science-animals-humans','{animals,habitats,food chains}'),
('KS2','Science','Earth & Space','science-earth-space','{planets,moon,solar system}'),
('KS2','History','Ancient Greece','history-ancient-greece','{myths,olympics,gods,heroes}'),
('KS2','History','Romans in Britain','history-romans-britain','{romans,empire,roads}')
on conflict (slug) do nothing;
