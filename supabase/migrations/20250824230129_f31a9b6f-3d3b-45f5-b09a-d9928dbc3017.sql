
-- Guardian OS device job queue — aligned to existing Edge Functions
-- Safe to run multiple times

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Touch trigger (already exists in many projects; safe to replace)
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- 1) Tables

create table if not exists public.device_jobs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  type text not null,                                   -- e.g. 'POST_INSTALL'
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued'
    check (status in ('queued','running','done','failed')),
  attempts int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_device_jobs_device_status_created
  on public.device_jobs (device_id, status, created_at);

create table if not exists public.device_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.device_jobs(id) on delete cascade,
  log text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_device_job_logs_job_created
  on public.device_job_logs (job_id, created_at);

-- 2) Trigger

drop trigger if exists trg_device_jobs_updated_at on public.device_jobs;
create trigger trg_device_jobs_updated_at
  before update on public.device_jobs
  for each row execute function public.update_updated_at_column();

-- 3) RLS

alter table public.device_jobs enable row level security;
alter table public.device_job_logs enable row level security;

-- Helper to read device id from JWT (supports both 'sub' and 'device_id')
create or replace function public.jwt_device_id_text()
returns text
language sql
stable
as $$
  select coalesce(
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'sub'), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'device_id'), '')
  )
$$;

-- Devices can read their own jobs
drop policy if exists "device_read_jobs" on public.device_jobs;
create policy "device_read_jobs"
  on public.device_jobs
  for select
  using (device_id::text = coalesce(public.jwt_device_id_text(), ''));

-- Devices can update their own jobs (e.g., set status running/done/failed)
drop policy if exists "device_update_jobs" on public.device_jobs;
create policy "device_update_jobs"
  on public.device_jobs
  for update
  using (device_id::text = coalesce(public.jwt_device_id_text(), ''));

-- Service role inserts jobs (Edge Function)
drop policy if exists "service_role_insert_device_jobs" on public.device_jobs;
create policy "service_role_insert_device_jobs"
  on public.device_jobs
  for insert
  to service_role
  with check (true);

-- Devices can insert logs for their own jobs
drop policy if exists "device_insert_job_logs" on public.device_job_logs;
create policy "device_insert_job_logs"
  on public.device_job_logs
  for insert
  with check (
    exists (
      select 1
      from public.device_jobs dj
      where dj.id = job_id
        and dj.device_id::text = coalesce(public.jwt_device_id_text(), '')
    )
  );

-- Devices can read their own logs (optional but useful)
drop policy if exists "device_read_job_logs" on public.device_job_logs;
create policy "device_read_job_logs"
  on public.device_job_logs
  for select
  using (
    exists (
      select 1
      from public.device_jobs dj
      where dj.id = job_id
        and dj.device_id::text = coalesce(public.jwt_device_id_text(), '')
    )
  );

-- 4) Optional convenience: FIFO claim RPC (service role or trusted context)
create or replace function public.device_jobs_claim_next(p_device_id uuid)
returns public.device_jobs
language plpgsql
security definer
as $$
declare
  v_job public.device_jobs;
begin
  with next as (
    select id
    from public.device_jobs
    where device_id = p_device_id
      and status = 'queued'
    order by created_at
    limit 1
    for update skip locked
  )
  update public.device_jobs j
     set status = 'running',
         attempts = j.attempts + 1,
         updated_at = now()
    from next
   where j.id = next.id
  returning j.* into v_job;

  return v_job; -- null if none available
end
$$;

-- 5) Optional: quiet the app_catalog.type missing column warning
alter table public.app_catalog
  add column if not exists type text null;
