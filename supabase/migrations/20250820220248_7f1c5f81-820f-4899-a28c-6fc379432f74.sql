
-- 1) Expand allowed job types in nova_jobs
alter table public.nova_jobs
  drop constraint if exists nova_jobs_job_type_check;

alter table public.nova_jobs
  add constraint nova_jobs_job_type_check
  check (job_type in ('ingest','analyze','illustrate','illustrate_slot','illustrate_finalize'));

-- Ensure supportive columns exist (idempotent)
alter table public.nova_jobs
  add column if not exists chapter_id uuid,
  add column if not exists payload jsonb default '{}'::jsonb,
  add column if not exists attempts int default 0,
  add column if not exists error text,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists status text default 'queued';

create index if not exists idx_nova_jobs_status
  on public.nova_jobs(status, job_type, created_at);

-- 2) Recreate the first‑read trigger that stamps books.started_at and enqueues 'illustrate'
create or replace function public._mark_first_read_and_enqueue_illustrations()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_started timestamptz;
begin
  select started_at into v_started from public.books where id = new.book_id;

  if v_started is null then
    update public.books
       set started_at = now()
     where id = new.book_id;

    -- enqueue bootstrap job only if none queued/running for this book
    if not exists (
      select 1 from public.nova_jobs j
      where j.book_id = new.book_id
        and j.job_type = 'illustrate'
        and j.status in ('queued','running')
    ) then
      insert into public.nova_jobs (job_type, book_id, payload)
      values ('illustrate', new.book_id, jsonb_build_object('mode','progressive','max_per_chapter',2));
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists trg_sessions_first_read on public.child_reading_sessions;
create trigger trg_sessions_first_read
after insert on public.child_reading_sessions
for each row execute function public._mark_first_read_and_enqueue_illustrations();

-- 3) Seed (or re-seed) ingest jobs for any books not yet ingested and with a source
insert into public.nova_jobs (job_type, book_id, payload)
select
  'ingest' as job_type,
  b.id as book_id,
  jsonb_build_object('source', b.source, 'source_id', b.source_id, 'source_url', b.source_url) as payload
from public.books b
where coalesce(b.ingested, false) = false
  and (coalesce(b.source_url,'') <> '' or coalesce(b.source_id,'') <> '')
  and not exists (
    select 1 from public.nova_jobs j
    where j.book_id = b.id
      and j.job_type = 'ingest'
      and j.status in ('queued','running')
  );
