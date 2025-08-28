
-- A) Telemetry table for device events (MVP: app usage etc.)
create table if not exists public.device_events (
  id bigint generated always as identity primary key,
  device_code text not null,
  child_id uuid,
  type text not null,                 -- e.g. 'app_foreground'
  ts timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_device_events_device_ts
  on public.device_events (device_code, ts desc);

alter table public.device_events enable row level security;

-- Admins can read all events
create policy if not exists "device_events_admin_select_all"
  on public.device_events
  for select
  using (is_admin());

-- Devices can insert their own events (JWT sub = device_code)
create policy if not exists "device_events_device_insert"
  on public.device_events
  for insert
  with check (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = device_code
  );

-- B) Device jobs: keep existing table/schema, add admin-all policy for UI usage
create policy if not exists "device_jobs_admin_all"
  on public.device_jobs
  for all
  using (is_admin())
  with check (is_admin());
