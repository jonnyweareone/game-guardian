
-- 1) Extensions
create extension if not exists pgcrypto;
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 2) Books lifecycle columns (safe idempotent alters)
alter table public.books
  add column if not exists source text default 'gutenberg',
  add column if not exists source_id text,
  add column if not exists source_url text,
  add column if not exists ingested boolean default false,
  add column if not exists ingested_at timestamptz,
  add column if not exists analysis_mode text default 'first_read', -- 'first_read' | 'immediate' | 'never'
  add column if not exists analysis_done boolean default false,
  add column if not exists analysis_at timestamptz;

-- Helpful index for source lookups
create index if not exists idx_books_source on public.books(source, source_id);

-- 3) Book pages adjustments
-- Ensure voice_spans exists for speaker/role tagging
alter table public.book_pages
  add column if not exists voice_spans jsonb;

-- Enforce uniqueness by (book_id, page_index) using a unique index (safer than constraint IF NOT EXISTS)
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'uniq_book_pages_book_page'
  ) then
    execute 'create unique index uniq_book_pages_book_page on public.book_pages(book_id, page_index)';
  end if;
end$$;

-- 4) Minimal job queue
create table if not exists public.nova_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('ingest','analyze')),
  book_id uuid not null references public.books(id) on delete cascade,
  payload jsonb default '{}'::jsonb,
  status text not null default 'queued',  -- 'queued' | 'running' | 'done' | 'error'
  attempts int default 0,
  error text,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists idx_nova_jobs_status on public.nova_jobs(status, job_type, created_at);
create index if not exists idx_nova_jobs_book on public.nova_jobs(book_id);

-- 4a) Atomic job claim function (used by worker)
create or replace function public.nova_claim_job(p_job_type text default null)
returns public.nova_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.nova_jobs;
begin
  with next as (
    select id
    from public.nova_jobs
    where status = 'queued'
      and (p_job_type is null or job_type = p_job_type)
    order by created_at
    limit 1
    for update skip locked
  )
  update public.nova_jobs j
     set status = 'running',
         started_at = now(),
         attempts = j.attempts + 1
    from next
   where j.id = next.id
  returning j.* into v_job;

  return v_job; -- returns null if none available
end
$$;

-- 5) Triggers

-- 5a) Enqueue 'ingest' when a book is inserted/updated with a source link and isn't ingested
create or replace function public.enqueue_ingest_job()
returns trigger
language plpgsql
as $$
begin
  if (new.ingested is distinct from true)
     and (
       coalesce(new.source_url,'') <> ''
       or coalesce(new.source_id,'') <> ''
     )
  then
    -- Avoid duplicates while one is queued/running
    if not exists (
      select 1 from public.nova_jobs j
      where j.book_id = new.id
        and j.job_type = 'ingest'
        and j.status in ('queued','running')
    ) then
      insert into public.nova_jobs (job_type, book_id, payload)
      values (
        'ingest',
        new.id,
        jsonb_build_object('source', new.source, 'source_id', new.source_id, 'source_url', new.source_url)
      );
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists trg_books_enqueue_ingest on public.books;
create trigger trg_books_enqueue_ingest
after insert or update of source, source_id, source_url on public.books
for each row execute function public.enqueue_ingest_job();

-- 5b) Enqueue 'analyze' on first reading session if analysis_mode='first_read' and not done
-- Note: public.child_reading_sessions already exists in this project; we only add a trigger.
create or replace function public.enqueue_analysis_on_first_read()
returns trigger
language plpgsql
as $$
declare
  v_mode text;
  v_done boolean;
begin
  select analysis_mode, analysis_done
    into v_mode, v_done
  from public.books
  where id = new.book_id;

  if coalesce(v_mode, 'first_read') = 'first_read'
     and coalesce(v_done, false) = false
  then
    if not exists (
      select 1 from public.nova_jobs j
      where j.book_id = new.book_id
        and j.job_type = 'analyze'
        and j.status in ('queued','running')
    ) then
      insert into public.nova_jobs (job_type, book_id)
      values ('analyze', new.book_id);
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists trg_sessions_enqueue_analysis on public.child_reading_sessions;
create trigger trg_sessions_enqueue_analysis
after insert on public.child_reading_sessions
for each row execute function public.enqueue_analysis_on_first_read();

-- 6) Cron schedule to nudge the worker every 2 minutes
do $$
begin
  perform cron.unschedule('nova-job-worker-every-2-min');
exception when others then
  -- ignore if it doesn't exist
  null;
end
$$;

select
  cron.schedule(
    'nova-job-worker-every-2-min',
    '*/2 * * * *',
    $$
    select
      net.http_post(
        url:='https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/nova-job-worker',
        headers:=jsonb_build_object(
          'Content-Type','application/json',
          'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo'
        ),
        body:='{"source":"pg_cron"}'::jsonb
      ) as request_id;
    $$
  );
