
-- 20250819_v2_education.sql
-- === Education Profile, Interests, Planner, Study Sessions, Homework, Schools metadata ===

-- Ensure UUID generation is available
create extension if not exists "uuid-ossp";

-- 1) Extend schools with phase/ages for filtering
alter table public.schools add column if not exists phase text; -- "primary" | "secondary" | "all-through" | "special" | null
alter table public.schools add column if not exists age_min int;
alter table public.schools add column if not exists age_max int;

-- 2) Education profile per child
create table if not exists public.education_profiles (
  child_id uuid primary key references public.children(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  key_stage text,           -- KS1/KS2/KS3/KS4
  year_group text,          -- "Year 3", "Year 4", etc.
  curriculum_region text,   -- England/Wales/Scotland/Northern Ireland
  interests_json jsonb default '[]'::jsonb, -- denormalised snapshot
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Interests taxonomy + join
create table if not exists public.interests (
  id uuid primary key default uuid_generate_v4(),
  category text not null,         -- "Subject" | "Sport" | "Arts" | etc.
  code text not null,             -- e.g., "history.ancient_egypt"
  name text not null,
  unique (category, code)
);

create table if not exists public.child_interests (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz default now(),
  unique (child_id, interest_id)
);

-- 4) Curriculum planner override (per child, per term/topic)
create table if not exists public.curriculum_overrides (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  term_code text not null,         -- e.g., "2024-Autumn"
  topic_id uuid references public.topics(id) on delete set null,
  subject text,                    -- optional subject tag
  action text not null,            -- "include" | "exclude" | "replace"
  note text,
  created_at timestamptz default now()
);

-- 5) Generic study sessions (for "Learning timeline")
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  source text not null,         -- "game", "reading", "homework", "manual"
  subject text,                 -- e.g., "maths", "history"
  started_at timestamptz default now(),
  ended_at timestamptz,
  minutes int default 0,
  meta jsonb default '{}'::jsonb
);

-- 6) Homework links (parent-added; OAuth handled app-side)
create table if not exists public.child_homework_links (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  provider text not null,       -- "google", "microsoft", "libre"
  title text not null,
  file_url text,                -- webViewLink/share link (no secrets here)
  file_id text,                 -- opaque id in provider (optional)
  created_at timestamptz default now()
);

-- 7) Optional: AI learning-style & progress notes
create table if not exists public.learning_style_insights (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  summary text not null,
  strengths text,
  improvements text,
  updated_at timestamptz default now()
);

-- RLS
alter table public.education_profiles enable row level security;
alter table public.child_interests enable row level security;
alter table public.curriculum_overrides enable row level security;
alter table public.study_sessions enable row level security;
alter table public.child_homework_links enable row level security;
alter table public.learning_style_insights enable row level security;

-- Use existing helper to bind access to parent of child_id
-- This avoids coupling to a specific children column naming.
create policy if not exists edu_profiles_parent_select
on public.education_profiles
for select using (public.is_parent_of_child(child_id));

create policy if not exists child_interests_parent_select
on public.child_interests
for select using (public.is_parent_of_child(child_id));

create policy if not exists curriculum_overrides_parent_select
on public.curriculum_overrides
for select using (public.is_parent_of_child(child_id));

create policy if not exists study_sessions_parent_select
on public.study_sessions
for select using (public.is_parent_of_child(child_id));

create policy if not exists homework_links_parent_select
on public.child_homework_links
for select using (public.is_parent_of_child(child_id));

create policy if not exists learning_style_parent_select
on public.learning_style_insights
for select using (public.is_parent_of_child(child_id));

-- Writes are handled via service-role (Edge Functions), so no public INSERT/UPDATE/DELETE policies for now.

-- Seed minimal interests
insert into public.interests(category, code, name) values
  ('Subject','history.ancient_egypt','Ancient Egypt'),
  ('Subject','history.romans','Romans in Britain'),
  ('Subject','science.space','Space & Planets'),
  ('Subject','maths.geometry','Geometry'),
  ('Sport','sport.football','Football'),
  ('Sport','sport.swimming','Swimming')
on conflict do nothing;
