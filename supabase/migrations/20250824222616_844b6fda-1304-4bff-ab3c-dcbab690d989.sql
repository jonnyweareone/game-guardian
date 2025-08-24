
-- 1) Helpers (idempotent)
create extension if not exists pgcrypto;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- 2) Tables
create table if not exists public.device_jobs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  type text not null,                          -- e.g. 'POST_INSTALL'
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
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

-- 3) Triggers
drop trigger if exists trg_device_jobs_updated_at on public.device_jobs;
create trigger trg_device_jobs_updated_at
  before update on public.device_jobs
  for each row execute function public.update_updated_at_column();

-- 4) RLS
alter table public.device_jobs enable row level security;
alter table public.device_job_logs enable row level security;

-- Parents can view jobs for devices they own
create policy if not exists "parents_view_device_jobs"
  on public.device_jobs
  for select
  using (exists (
    select 1
    from public.devices d
    where d.id = device_jobs.device_id
      and d.parent_id = auth.uid()
  ));

-- Edge Functions (service role) insert/update jobs
create policy if not exists "service_role_insert_device_jobs"
  on public.device_jobs
  for insert to service_role
  with check (true);

create policy if not exists "service_role_update_device_jobs"
  on public.device_jobs
  for update to service_role
  using (true)
  with check (true);

-- Parents can view logs for their devices' jobs
create policy if not exists "parents_view_job_logs"
  on public.device_job_logs
  for select
  using (exists (
    select 1
    from public.device_jobs dj
    join public.devices d on d.id = dj.device_id
    where dj.id = device_job_logs.job_id
      and d.parent_id = auth.uid()
  ));

-- Edge Functions (service role) can insert logs
create policy if not exists "service_role_insert_job_logs"
  on public.device_job_logs
  for insert to service_role
  with check (true);

-- Optional: device JWT policies (harmless; useful if you later validate Supabase JWTs for devices)
-- Devices can read/update their own jobs
create policy if not exists "device_read_jobs"
  on public.device_jobs
  for select
  using (
    exists (
      select 1
      from public.devices d
      where d.id = device_jobs.device_id
    )
    and device_jobs.device_id::text = coalesce(auth.jwt() ->> 'sub','')
  );

create policy if not exists "device_update_jobs"
  on public.device_jobs
  for update
  using (
    exists (
      select 1
      from public.devices d
      where d.id = device_jobs.device_id
    )
    and device_jobs.device_id::text = coalesce(auth.jwt() ->> 'sub','')
  );

-- Devices can insert/read logs for their own jobs
create policy if not exists "device_insert_job_logs"
  on public.device_job_logs
  for insert
  with check (exists (
    select 1
    from public.device_jobs dj
    where dj.id = job_id
      and dj.device_id::text = coalesce(auth.jwt() ->> 'sub','')
  ));

create policy if not exists "device_read_job_logs"
  on public.device_job_logs
  for select
  using (exists (
    select 1
    from public.device_jobs dj
    where dj.id = job_id
      and dj.device_id::text = coalesce(auth.jwt() ->> 'sub','')
  ));

-- 5) Optional: FIFO claim RPC for queued jobs (within a device)
create or replace function public.device_jobs_claim_next(p_device_id uuid)
returns public.device_jobs
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_job public.device_jobs;
begin
  update public.device_jobs j
     set status = 'running',
         attempts = j.attempts + 1,
         updated_at = now()
   where j.id = (
     select id
     from public.device_jobs
     where device_id = p_device_id
       and status = 'queued'
     order by created_at asc
     for update skip locked
     limit 1
   )
  returning * into v_job;

  return v_job; -- null if none available
end $$;

-- 6) Optional: quiet non-blocking logs from device-postinstall about app_catalog.type
alter table public.app_catalog
  add column if not exists type text null;
