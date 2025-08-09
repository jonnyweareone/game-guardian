
-- ================================
-- GuardianOS foundation migration
-- Safe, additive changes only
-- ================================

-- 1) Device apps: add fields for source, version, last used
alter table public.device_apps
  add column if not exists source text,
  add column if not exists version text,
  add column if not exists last_used_at timestamptz;

-- 2) App category policies (child/device-scoped blanket rules)
create table if not exists public.app_category_policies (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('device','child')),
  subject_id uuid not null,
  category text not null check (category in ('Game','App','Social','Education','Streaming','Messaging','Browser','Other')),
  allowed boolean default true,
  daily_limit_minutes int,
  enforced_hours int4range[],
  updated_at timestamptz default now(),
  unique (subject_type, subject_id, category)
);

alter table public.app_category_policies enable row level security;

-- RLS: mirror app_policies pattern
-- Parents can view
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_category_policies'
      and policyname = 'Parents can view app category policies'
  ) then
    create policy "Parents can view app category policies"
      on public.app_category_policies
      for select
      using (
        (subject_type = 'device' and exists (
          select 1 from public.devices d
          where d.id = app_category_policies.subject_id
            and d.parent_id = auth.uid()
        )) or
        (subject_type = 'child' and exists (
          select 1 from public.children c
          where c.id = app_category_policies.subject_id
            and c.parent_id = auth.uid()
        ))
      );
  end if;
end
$$;

-- Parents can insert
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_category_policies'
      and policyname = 'Parents can insert app category policies'
  ) then
    create policy "Parents can insert app category policies"
      on public.app_category_policies
      for insert
      with check (
        (subject_type = 'device' and exists (
          select 1 from public.devices d
          where d.id = app_category_policies.subject_id
            and d.parent_id = auth.uid()
        )) or
        (subject_type = 'child' and exists (
          select 1 from public.children c
          where c.id = app_category_policies.subject_id
            and c.parent_id = auth.uid()
        ))
      );
  end if;
end
$$;

-- Parents can update
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_category_policies'
      and policyname = 'Parents can update app category policies'
  ) then
    create policy "Parents can update app category policies"
      on public.app_category_policies
      for update
      using (
        (subject_type = 'device' and exists (
          select 1 from public.devices d
          where d.id = app_category_policies.subject_id
            and d.parent_id = auth.uid()
        )) or
        (subject_type = 'child' and exists (
          select 1 from public.children c
          where c.id = app_category_policies.subject_id
            and c.parent_id = auth.uid()
        ))
      )
      with check (
        (subject_type = 'device' and exists (
          select 1 from public.devices d
          where d.id = app_category_policies.subject_id
            and d.parent_id = auth.uid()
        )) or
        (subject_type = 'child' and exists (
          select 1 from public.children c
          where c.id = app_category_policies.subject_id
            and c.parent_id = auth.uid()
        ))
      );
  end if;
end
$$;

-- 3) Child-wide time policy: extend (keep existing columns for compatibility)
alter table public.child_time_policies
  add column if not exists bedtime_weekday int4range,
  add column if not exists bedtime_weekend int4range,
  add column if not exists focus_mode boolean default false,
  add column if not exists focus_allowed_categories text[] default '{Education}',
  add column if not exists homework_window int4range;

-- 4) Time tokens (earn/spend minutes)
create table if not exists public.child_time_tokens (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  delta_minutes int not null,
  reason text,
  created_at timestamptz default now()
);
create index if not exists idx_tokens_child on public.child_time_tokens(child_id);

alter table public.child_time_tokens enable row level security;

-- RLS: parents manage their child's tokens
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_time_tokens'
      and policyname = 'Parents manage their child time tokens'
  ) then
    create policy "Parents manage their child time tokens"
      on public.child_time_tokens
      for all
      using (exists (
        select 1 from public.children c
        where c.id = child_time_tokens.child_id
          and c.parent_id = auth.uid()
      ))
      with check (exists (
        select 1 from public.children c
        where c.id = child_time_tokens.child_id
          and c.parent_id = auth.uid()
      ));
  end if;
end
$$;

-- 5) App activity logging
create table if not exists public.app_activity (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  child_id uuid,
  app_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds int,
  network_type text,
  created_at timestamptz default now()
);
create index if not exists idx_activity_device on public.app_activity(device_id);
create index if not exists idx_activity_child on public.app_activity(child_id);
create index if not exists idx_activity_open on public.app_activity(device_id, app_id) where ended_at is null;

alter table public.app_activity enable row level security;

-- RLS: Guardian devices insert/update; parents view their own
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_activity'
      and policyname = 'Guardian devices can insert activity'
  ) then
    create policy "Guardian devices can insert activity"
      on public.app_activity
      for insert
      with check (exists (
        select 1 from public.devices d
        where d.id = app_activity.device_id
          and d.is_active = true
      ));
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_activity'
      and policyname = 'Guardian devices can update activity'
  ) then
    create policy "Guardian devices can update activity"
      on public.app_activity
      for update
      using (exists (
        select 1 from public.devices d
        where d.id = app_activity.device_id
          and d.is_active = true
      ));
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_activity'
      and policyname = 'Parents can view activity'
  ) then
    create policy "Parents can view activity"
      on public.app_activity
      for select
      using (
        exists (select 1 from public.devices d where d.id = app_activity.device_id and d.parent_id = auth.uid())
        or
        exists (select 1 from public.children c where c.id = app_activity.child_id and c.parent_id = auth.uid())
      );
  end if;
end
$$;

-- 6) Current activity view
create or replace view public.v_current_activity as
select distinct on (aa.device_id)
  aa.device_id,
  aa.child_id,
  aa.app_id,
  da.name,
  da.icon_url,
  aa.started_at,
  aa.ended_at
from public.app_activity aa
left join public.device_apps da on da.app_id = aa.app_id
where aa.ended_at is null
order by aa.device_id, aa.started_at desc;

-- 7) Alerts: extend existing table with optional columns (non-breaking)
alter table public.alerts
  add column if not exists app_id text,
  add column if not exists severity text,
  add column if not exists message text,
  add column if not exists occurred_at timestamptz default now();

-- 8) NextDNS / content filter mapping
create table if not exists public.child_filter_settings (
  child_id uuid primary key references public.children(id) on delete cascade,
  provider text default 'nextdns',
  profile_id text,
  blocked_categories text[],
  allowed_categories text[]
);

alter table public.child_filter_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_filter_settings'
      and policyname = 'Parents manage child filter settings'
  ) then
    create policy "Parents manage child filter settings"
      on public.child_filter_settings
      for all
      using (exists (
        select 1 from public.children c
        where c.id = child_filter_settings.child_id
          and c.parent_id = auth.uid()
      ))
      with check (exists (
        select 1 from public.children c
        where c.id = child_filter_settings.child_id
          and c.parent_id = auth.uid()
      ));
  end if;
end
$$;

-- 9) Geofence rules
create table if not exists public.child_geofence_rules (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  label text not null,
  lat double precision not null,
  lng double precision not null,
  radius_m int not null default 150,
  allowed_apps text[],
  blocked_apps text[]
);
create index if not exists idx_geofence_child on public.child_geofence_rules(child_id);

alter table public.child_geofence_rules enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_geofence_rules'
      and policyname = 'Parents manage geofence rules'
  ) then
    create policy "Parents manage geofence rules"
      on public.child_geofence_rules
      for all
      using (exists (
        select 1 from public.children c
        where c.id = child_geofence_rules.child_id
          and c.parent_id = auth.uid()
      ))
      with check (exists (
        select 1 from public.children c
        where c.id = child_geofence_rules.child_id
          and c.parent_id = auth.uid()
      ));
  end if;
end
$$;

-- 10) Device heartbeats / network status
create table if not exists public.device_heartbeats (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  battery int,
  network_type text,
  ssid text,
  ip text,
  reported_at timestamptz default now()
);
create index if not exists idx_heartbeats_device on public.device_heartbeats(device_id);
create index if not exists idx_heartbeats_reported_at on public.device_heartbeats(reported_at);

alter table public.device_heartbeats enable row level security;

-- Devices insert/update; parents view
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_heartbeats'
      and policyname = 'Guardian devices can insert heartbeats'
  ) then
    create policy "Guardian devices can insert heartbeats"
      on public.device_heartbeats
      for insert
      with check (exists (
        select 1 from public.devices d
        where d.id = device_heartbeats.device_id
          and d.is_active = true
      ));
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_heartbeats'
      and policyname = 'Guardian devices can update heartbeats'
  ) then
    create policy "Guardian devices can update heartbeats"
      on public.device_heartbeats
      for update
      using (exists (
        select 1 from public.devices d
        where d.id = device_heartbeats.device_id
          and d.is_active = true
      ));
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_heartbeats'
      and policyname = 'Parents can view heartbeats'
  ) then
    create policy "Parents can view heartbeats"
      on public.device_heartbeats
      for select
      using (exists (
        select 1 from public.devices d
        where d.id = device_heartbeats.device_id
          and d.parent_id = auth.uid()
      ));
  end if;
end
$$;

-- 11) Device command queue
create table if not exists public.device_commands (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  cmd text not null,
  payload jsonb,
  status text default 'queued',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_commands_device on public.device_commands(device_id);

alter table public.device_commands enable row level security;

-- Parents insert/select for their devices; devices update status
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_commands'
      and policyname = 'Parents can insert commands'
  ) then
    create policy "Parents can insert commands"
      on public.device_commands
      for insert
      with check (exists (
        select 1 from public.devices d
        where d.id = device_commands.device_id
          and d.parent_id = auth.uid()
      ));
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_commands'
      and policyname = 'Parents can view commands'
  ) then
    create policy "Parents can view commands"
      on public.device_commands
      for select
      using (exists (
        select 1 from public.devices d
        where d.id = device_commands.device_id
          and d.parent_id = auth.uid()
      ));
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_commands'
      and policyname = 'Guardian devices can update commands'
  ) then
    create policy "Guardian devices can update commands"
      on public.device_commands
      for update
      using (exists (
        select 1 from public.devices d
        where d.id = device_commands.device_id
          and d.is_active = true
      ));
  end if;
end
$$;

-- 12) Effective policy view (extend with category policies and is_active)
create or replace view public.v_effective_app_policy as
with base as (
  select
    c.id as child_id,
    d.id as device_id,
    dca.is_active as is_active,
    da.app_id,
    da.name,
    da.category,
    da.icon_url,
    -- app policies
    cp.allowed  as child_allowed,
    cp.daily_limit_minutes as child_minutes,
    cp.enforced_hours      as child_hours,
    dp.allowed  as device_allowed,
    dp.daily_limit_minutes as device_minutes,
    dp.enforced_hours      as device_hours,
    -- category policies
    ccp.allowed as child_cat_allowed,
    ccp.daily_limit_minutes as child_cat_minutes,
    ccp.enforced_hours as child_cat_hours,
    dcp.allowed as device_cat_allowed,
    dcp.daily_limit_minutes as device_cat_minutes,
    dcp.enforced_hours as device_cat_hours
  from public.children c
  join public.device_child_assignments dca on dca.child_id = c.id
  join public.devices d on d.id = dca.device_id
  join public.device_apps da on da.device_code = d.device_code
  left join public.app_policies cp
    on cp.subject_type = 'child' and cp.subject_id = c.id and cp.app_id = da.app_id
  left join public.app_policies dp
    on dp.subject_type = 'device' and dp.subject_id = d.id and dp.app_id = da.app_id
  left join public.app_category_policies ccp
    on ccp.subject_type = 'child' and ccp.subject_id = c.id and ccp.category = da.category
  left join public.app_category_policies dcp
    on dcp.subject_type = 'device' and dcp.subject_id = d.id and dcp.category = da.category
)
select
  child_id,
  device_id,
  is_active,
  app_id,
  name,
  coalesce(category, 'App') as category,
  icon_url,
  -- Allow/Block precedence: explicit app policies > category policies > default allow
  coalesce(
    case
      when (child_allowed = false) or (device_allowed = false)
        or (child_cat_allowed = false) or (device_cat_allowed = false) then false
      when (child_allowed is null and device_allowed is null and child_cat_allowed is null and device_cat_allowed is null) then true
      else coalesce(child_allowed, device_allowed, child_cat_allowed, device_cat_allowed, true)
    end, true
  ) as allowed,
  -- Minutes: minimum of defined limits across app+category scopes
  (
    select min(val) from (
      values (child_minutes), (device_minutes), (child_cat_minutes), (device_cat_minutes)
    ) as v(val)
    where val is not null
  ) as daily_limit_minutes,
  -- Hours: keep whichever non-null exists first (intersection can be added later)
  coalesce(child_hours, device_hours, child_cat_hours, device_cat_hours) as enforced_hours
from base;

-- 13) RPC helpers

-- get effective policies for a child
create or replace function public.rpc_child_effective_policies(_child uuid)
returns setof public.v_effective_app_policy
language sql
stable
security definer
as $$
  select * from public.v_effective_app_policy where child_id = _child;
$$;

-- set active child for a device (flip previous)
create or replace function public.rpc_set_active_child(_device uuid, _child uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.device_child_assignments
    set is_active = false
    where device_id = _device;
  update public.device_child_assignments
    set is_active = true
    where device_id = _device and child_id = _child;
end;
$$;

-- queue a device command
create or replace function public.rpc_issue_command(_device uuid, _cmd text, _payload jsonb default '{}'::jsonb)
returns uuid
language sql
security definer
as $$
  insert into public.device_commands(device_id, cmd, payload)
  values (_device, _cmd, coalesce(_payload, '{}'::jsonb))
  returning id;
$$;
