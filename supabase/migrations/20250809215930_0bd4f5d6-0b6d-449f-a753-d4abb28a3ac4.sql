
-- 1) Device ↔ Child assignments
create table if not exists public.device_child_assignments (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (device_id, child_id)
);

-- Helpful indexes
create index if not exists idx_dca_device on public.device_child_assignments(device_id);
create index if not exists idx_dca_child on public.device_child_assignments(child_id);

-- Backfill from legacy devices.child_id so existing links appear in the UI
insert into public.device_child_assignments (device_id, child_id, is_active)
select d.id, d.child_id, coalesce(d.is_active, false)
from public.devices d
where d.child_id is not null
on conflict (device_id, child_id) do nothing;

-- Keep RLS sane
alter table public.device_child_assignments enable row level security;

-- Policies:
-- View assignments if you are the parent of the child OR the owner of the device
create policy "parents see their device-child assignments"
on public.device_child_assignments
for select
using (
  exists (
    select 1 from public.children c
    where c.id = device_child_assignments.child_id
      and c.parent_id = auth.uid()
  )
  or exists (
    select 1 from public.devices d
    where d.id = device_child_assignments.device_id
      and d.parent_id = auth.uid()
  )
);

-- Insert only if you are the parent of the child AND the owner of the device
create policy "parents create device-child assignments"
on public.device_child_assignments
for insert
with check (
  exists (
    select 1 from public.children c
    where c.id = device_child_assignments.child_id
      and c.parent_id = auth.uid()
  )
  and exists (
    select 1 from public.devices d
    where d.id = device_child_assignments.device_id
      and d.parent_id = auth.uid()
  )
);

-- Update only if you are the parent of the child AND the owner of the device
create policy "parents update device-child assignments"
on public.device_child_assignments
for update
using (
  exists (
    select 1 from public.children c
    where c.id = device_child_assignments.child_id
      and c.parent_id = auth.uid()
  )
  and exists (
    select 1 from public.devices d
    where d.id = device_child_assignments.device_id
      and d.parent_id = auth.uid()
  )
);

-- Delete only if you are the parent of the child AND the owner of the device
create policy "parents delete device-child assignments"
on public.device_child_assignments
for delete
using (
  exists (
    select 1 from public.children c
    where c.id = device_child_assignments.child_id
      and c.parent_id = auth.uid()
  )
  and exists (
    select 1 from public.devices d
    where d.id = device_child_assignments.device_id
      and d.parent_id = auth.uid()
  )
);

-- updated_at trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 't_dca_set_updated_at'
  ) then
    create trigger t_dca_set_updated_at
    before update on public.device_child_assignments
    for each row
    execute function public.update_updated_at_column();
  end if;
end$$;

-- 2) Child-wide time policy
create table if not exists public.child_time_policies (
  child_id uuid primary key references public.children(id) on delete cascade,
  daily_total_minutes int,
  bedtime int4range,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.child_time_policies enable row level security;

create policy "parents manage child time policy"
on public.child_time_policies
for all
using (
  exists (
    select 1 from public.children c
    where c.id = child_time_policies.child_id
      and c.parent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.children c
    where c.id = child_time_policies.child_id
      and c.parent_id = auth.uid()
  )
);

-- updated_at trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 't_ctp_set_updated_at'
  ) then
    create trigger t_ctp_set_updated_at
    before update on public.child_time_policies
    for each row
    execute function public.update_updated_at_column();
  end if;
end$$;

-- 3) Effective policy view (child + device)
-- - Cast text[] enforced_hours (e.g. '[17,20)') to int4range[] for intersection, then back to text[].
-- - Include is_active from assignments so the UI can easily filter to the active device.
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
    -- child policy
    cp.allowed  as child_allowed,
    cp.daily_limit_minutes as child_minutes,
    cp.enforced_hours      as child_hours_txt,
    -- device policy
    dp.allowed  as device_allowed,
    dp.daily_limit_minutes as device_minutes,
    dp.enforced_hours      as device_hours_txt
  from public.children c
  join public.device_child_assignments dca on dca.child_id = c.id
  join public.devices d on d.id = dca.device_id
  join public.device_apps da on da.device_code = d.device_code
  left join public.app_policies cp
    on cp.subject_type = 'child' and cp.subject_id = c.id and cp.app_id = da.app_id
  left join public.app_policies dp
    on dp.subject_type = 'device' and dp.subject_id = d.id and dp.app_id = da.app_id
),
ranges as (
  select
    child_id, device_id, is_active, app_id, name, category, icon_url,
    child_allowed, child_minutes,
    device_allowed, device_minutes,
    case
      when child_hours_txt is not null
      then array(select s::int4range from unnest(child_hours_txt) s)
      else null
    end as child_hours,
    case
      when device_hours_txt is not null
      then array(select s::int4range from unnest(device_hours_txt) s)
      else null
    end as device_hours
  from base
)
select
  child_id,
  device_id,
  is_active,
  app_id,
  name,
  coalesce(nullif(category, ''), 'App') as category,
  icon_url,
  coalesce(
    case
      when (child_allowed = false) or (device_allowed = false) then false
      when (child_allowed is null and device_allowed is null) then true
      else coalesce(child_allowed, device_allowed, true)
    end, true
  ) as allowed,
  case
    when child_minutes is null and device_minutes is null then null
    when child_minutes is null then device_minutes
    when device_minutes is null then child_minutes
    else least(child_minutes, device_minutes)
  end as daily_limit_minutes,
  case
    when child_hours is not null and device_hours is not null then
      (
        select case when count(1) = 0 then null
                    else array_agg(int4range(greatest(lower(c), lower(d)), least(upper(c), upper(d)), '[)')::text)
               end
        from unnest(child_hours) c, unnest(device_hours) d
        where greatest(lower(c), lower(d)) < least(upper(c), upper(d))
      )
    else (
      select case when coalesce(array_length(arr, 1), 0) = 0 then null else arr end
      from (
        select array_agg(x::text) as arr
        from unnest(coalesce(child_hours, device_hours)) x
      ) s
    )
  end as enforced_hours
from ranges;
