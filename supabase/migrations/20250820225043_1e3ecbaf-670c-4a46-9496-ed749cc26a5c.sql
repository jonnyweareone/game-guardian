
-- 1) Catalog of games/activities (publicly readable)
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null check (kind in ('game','activity')),
  subject text not null,
  launch_url text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.content_items enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_items' and policyname='content_items_public_read') then
    create policy content_items_public_read on public.content_items for select using (true);
  end if;
end $$;

-- 2) Challenge templates (public read; requirement JSON drives matching)
create table if not exists public.challenge_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  subject text not null,
  item_slug text not null,
  requirement jsonb not null,          -- e.g. {"event_type":"book_read_pages","game":"NovaBooks","min_pages":5,"period":"daily"}
  points int not null default 25,
  bonus jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.challenge_templates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='challenge_templates' and policyname='challenge_templates_public_read') then
    create policy challenge_templates_public_read on public.challenge_templates for select using (true);
  end if;
end $$;

-- 3) Daily schedule of templates (internal; accessed via edge function)
create table if not exists public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null,
  template_id uuid not null references public.challenge_templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (challenge_date, template_id)
);
alter table public.daily_challenges enable row level security;

-- 4) Per-child completions (parents can view their own)
create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  daily_challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  event_id uuid, -- optional pointer to game_events.id
  points_awarded int not null,
  created_at timestamptz not null default now(),
  unique (daily_challenge_id, child_id)
);
alter table public.challenge_completions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='challenge_completions' and policyname='cc_parents_select') then
    create policy cc_parents_select
      on public.challenge_completions for select
      using (exists (select 1 from public.children c where c.id = challenge_completions.child_id and c.parent_id = auth.uid()));
  end if;
end $$;

-- 5) Raw event log (parents can insert/select for their children)
create table if not exists public.game_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  game text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.game_events enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='game_events' and policyname='ge_parents_select') then
    create policy ge_parents_select
      on public.game_events for select
      using (exists (select 1 from public.children c where c.id = game_events.child_id and c.parent_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='game_events' and policyname='ge_parents_insert') then
    create policy ge_parents_insert
      on public.game_events for insert
      with check (exists (select 1 from public.children c where c.id = game_events.child_id and c.parent_id = auth.uid()));
  end if;
end $$;

-- Indexes to help matching/aggregation
create index if not exists game_events_child_created_idx on public.game_events(child_id, created_at);
create index if not exists daily_challenges_date_idx on public.daily_challenges(challenge_date);

-- 6) Seed catalog (open-source KS2-aligned)
insert into public.content_items (slug,title,kind,subject,launch_url,meta) values
  ('novabooks','Nova Books','activity','Reading','/novalearning','{}'::jsonb),
  ('tuxmath','TuxMath','game','Maths','/play/tuxmath','{"levels":[1,2,3,4,5]}'::jsonb),
  ('blockly-maze','Blockly: Maze','game','Computing','/play/blockly/maze','{"levels":[1,2,3,4,5]}'::jsonb),
  ('turtlestitch','Turtlestitch','activity','Art','/play/turtlestitch','{}'::jsonb)
on conflict (slug) do nothing;

-- 7) Seed challenge templates (idempotent)
insert into public.challenge_templates (title,description,subject,item_slug,requirement,points,bonus) values
  (
    'Reading Sprint',
    'Read 5 pages of any book today',
    'Reading','novabooks',
    '{"event_type":"book_read_pages","game":"NovaBooks","min_pages":5,"period":"daily"}'::jsonb,
    20,
    '{"streak_bonus":5}'::jsonb
  ),
  (
    'Math Quickfire',
    'Beat TuxMath Level 2 with ≥90% accuracy',
    'Maths','tuxmath',
    '{"event_type":"level_complete","game":"TuxMath","level":2,"min_accuracy":90}'::jsonb,
    25,
    '{"min_accuracy":95,"bonus_points":10}'::jsonb
  ),
  (
    'Code Puzzle',
    'Solve Blockly Maze L2 within optimal+2 blocks',
    'Computing','blockly-maze',
    '{"event_type":"level_complete","game":"BlocklyGames","level":2,"max_over_optimal":2}'::jsonb,
    25,
    '{"max_over_optimal":0,"bonus_points":10}'::jsonb
  ),
  (
    'Creative Brief',
    'Export a Turtlestitch pattern (≥100 stitches)',
    'Art','turtlestitch',
    '{"event_type":"project_submit","game":"Turtlestitch","min_stitches":100}'::jsonb,
    25,
    '{"min_stitches":500,"bonus_points":10}'::jsonb
  )
on conflict do nothing;
