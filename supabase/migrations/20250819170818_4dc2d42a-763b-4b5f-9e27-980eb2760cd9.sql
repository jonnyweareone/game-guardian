
-- 20250819_gn_init.sql
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- CHILDREN (minimal)
create table if not exists public.children (
  id uuid primary key default uuid_generate_v4(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  dob date not null,
  key_stage text check (key_stage in ('EYFS','KS1','KS2','KS3','KS4')) default 'KS2',
  nation text check (nation in ('England','Wales','Scotland','Northern Ireland')) default 'England',
  school_id uuid null,
  allow_stretch boolean default true,
  allow_support boolean default true,
  created_at timestamptz default now()
);

-- SCHOOLS (geo lookup)
create table if not exists public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  nation text not null check (nation in ('England','Wales','Scotland','Northern Ireland')),
  la_name text,
  urn_or_seed text,
  postcode text,
  lat double precision,
  lng double precision,
  metadata jsonb default '{}'::jsonb
);
create index if not exists schools_idx_geo on public.schools(lat, lng);

-- CURRICULUM SCAFFOLD
create table if not exists public.jurisdictions (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);
insert into public.jurisdictions(name) values
  ('England'),('Wales'),('Scotland'),('Northern Ireland')
on conflict do nothing;

create table if not exists public.frameworks (
  id uuid primary key default uuid_generate_v4(),
  jurisdiction_id uuid not null references public.jurisdictions(id) on delete cascade,
  name text not null,
  version text,
  licence text,
  source_url text,
  created_at timestamptz default now()
);

create table if not exists public.subjects_or_areas (
  id uuid primary key default uuid_generate_v4(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  code text,
  title text not null
);

create table if not exists public.standards (
  id uuid primary key default uuid_generate_v4(),
  subject_area_id uuid not null references public.subjects_or_areas(id) on delete cascade,
  code text,
  title text not null,
  text text not null,
  stage_or_level text,
  extra jsonb default '{}'::jsonb
);
create index if not exists standards_idx on public.standards(subject_area_id, stage_or_level);

-- TOPICS / LOCAL TOPICS
create table if not exists public.topics (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tags text[] default '{}',
  global boolean default false
);

create table if not exists public.local_topics (
  id uuid primary key default uuid_generate_v4(),
  jurisdiction text not null check (jurisdiction in ('England','Wales','Scotland','Northern Ireland')),
  region text,
  la_name text,
  topic_id uuid not null references public.topics(id) on delete cascade,
  lat double precision,
  lng double precision,
  radius_m integer default 30000,
  unique (jurisdiction, la_name, topic_id)
);

create table if not exists public.standard_topic_map (
  id uuid primary key default uuid_generate_v4(),
  standard_id uuid not null references public.standards(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  relation text default 'supports'
);

-- CHALLENGES / REWARDS
create table if not exists public.challenge_templates (
  id uuid primary key default uuid_generate_v4(),
  standard_id uuid null references public.standards(id) on delete set null,
  topic_id uuid null references public.topics(id) on delete set null,
  type text not null check (type in ('core','discovery','adaptive')),
  learning_goal text not null,
  min_age int,
  est_minutes int default 10,
  xp int default 50,
  coins int default 10,
  ep int default 0,
  template jsonb not null
);

create table if not exists public.challenge_rendered (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  template_id uuid not null references public.challenge_templates(id) on delete cascade,
  jurisdiction text not null,
  locality text,
  year_band text,
  seed_json jsonb not null,
  status text not null default 'assigned' check (status in ('assigned','in_progress','completed','expired')),
  awarded_xp int default 0,
  awarded_coins int default 0,
  awarded_ep int default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists public.wallets (
  child_id uuid primary key references public.children(id) on delete cascade,
  coins int not null default 0,
  ep int not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('skin','outfit','hat','emote','backpack','pet','sticker')),
  name text not null,
  rarity text default 'common',
  cost_coins int default 0,
  meta jsonb default '{}'::jsonb
);

create table if not exists public.inventory (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  acquired_at timestamptz default now(),
  unique (child_id, item_id)
);

-- VIEW: child → local topics (simple radius-ish filter)
create or replace view public.v_child_local_topics as
select
  c.id as child_id,
  lt.*
from public.children c
join public.schools s on s.id = c.school_id
join public.local_topics lt
  on lt.jurisdiction = c.nation
 and (
      (s.lat is not null and s.lng is not null and lt.lat is not null and lt.lng is not null
       and ( ( (s.lat - lt.lat)*(s.lat - lt.lat) + (s.lng - lt.lng)*(s.lng - lt.lng) ) < 0.25 )
     )
     or lt.la_name = s.la_name
    );

-- RLS
alter table public.children enable row level security;
alter table public.challenge_rendered enable row level security;
alter table public.wallets enable row level security;
alter table public.inventory enable row level security;

create policy if not exists children_parent_select
on public.children for select
using (auth.uid() = parent_user_id);

create policy if not exists challenge_rendered_parent_select
on public.challenge_rendered for select
using (exists (select 1 from public.children c where c.id = child_id and c.parent_user_id = auth.uid()));

create policy if not exists wallets_parent_select
on public.wallets for select
using (exists (select 1 from public.children c where c.id = wallets.child_id and c.parent_user_id = auth.uid()));

create policy if not exists inventory_parent_select
on public.inventory for select
using (exists (select 1 from public.children c where c.id = inventory.child_id and c.parent_user_id = auth.uid()));

-- RPCs
create or replace function public.award_challenge_completion(p_rendered_id uuid)
returns table (child_id uuid, coins_awarded int, ep_awarded int, xp_awarded int)
language plpgsql security definer as $$
declare
  v_child uuid;
  v_c int; v_e int; v_x int;
begin
  update public.challenge_rendered cr
  set status='completed',
      completed_at=now(),
      awarded_coins = ct.coins,
      awarded_ep    = ct.ep,
      awarded_xp    = ct.xp
  from public.challenge_templates ct
  where cr.id = p_rendered_id and cr.template_id = ct.id
  returning cr.child_id, ct.coins, ct.ep, ct.xp
  into v_child, v_c, v_e, v_x;

  if v_child is null then
    raise exception 'Challenge not found';
  end if;

  insert into public.wallets as w (child_id, coins, ep, updated_at)
  values (v_child, v_c, v_e, now())
  on conflict (child_id) do update
    set coins = w.coins + excluded.coins,
        ep    = w.ep    + excluded.ep,
        updated_at = now();

  return query select v_child, v_c, v_e, v_x;
end $$;

create or replace function public.get_candidate_templates(p_child uuid, p_limit int default 10)
returns table (template_id uuid, reason text)
language sql as $$
  with child_ctx as (
    select c.id, c.nation, c.key_stage, coalesce(s.la_name,'') as la_name
    from public.children c
    left join public.schools s on s.id = c.school_id
    where c.id = p_child
  )
  ( -- prefer local topics
    select ct.id, 'core-local' as reason
    from child_ctx cc
    join public.v_child_local_topics v on v.child_id = cc.id
    join public.challenge_templates ct on ct.topic_id = v.topic_id
    where ct.type in ('core','adaptive')
    limit p_limit
  )
  union all
  ( -- then global/core
    select ct.id, 'core-global' as reason
    from child_ctx cc
    join public.challenge_templates ct on true
    where ct.type = 'core' and ct.topic_id is not null
    limit greatest(0, p_limit)
  )
$$;

create or replace function public.assign_challenge(
  p_child uuid, p_template uuid, p_jurisdiction text,
  p_locality text, p_year_band text default 'Y3-Y4', p_seed jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into public.challenge_rendered(child_id, template_id, jurisdiction, locality, year_band, seed_json)
  values (p_child, p_template, p_jurisdiction, p_locality, p_year_band, p_seed)
  returning id into v_id;
  return v_id;
end $$;
