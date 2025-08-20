
-- 1) Ensure crypto extension (for gen_random_uuid)
create extension if not exists pgcrypto;

-- 2) Books: add illustration control flags
alter table public.books
  add column if not exists started_at timestamptz,
  add column if not exists images_generated boolean default false,
  add column if not exists images_provider text default 'api';

-- 3) Chapters (one row per chapter)
create table if not exists public.book_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_index int not null,
  chapter_title text,
  chapter_hash text,
  max_images int not null default 2,
  generated_images int not null default 0,
  first_page_index int,
  last_page_index int,
  created_at timestamptz default now(),
  unique (book_id, chapter_index)
);

-- Helpful index for lookups
create index if not exists idx_book_chapters_book_idx
  on public.book_chapters(book_id, chapter_index);

-- Enable RLS + public read (service role will bypass for writes)
alter table public.book_chapters enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'book_chapters' and policyname = 'book_chapters public read'
  ) then
    create policy "book_chapters public read"
      on public.book_chapters
      for select
      using (true);
  end if;
end$$;

-- 4) Generated illustrations per chapter/slot
create table if not exists public.book_chapter_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_id uuid not null references public.book_chapters(id) on delete cascade,
  slot int not null, -- 1 or 2
  image_url text not null,
  prompt text,
  negative_prompt text,
  seed int,
  width int default 1024,
  height int default 1024,
  provider text default 'api',
  cost_estimate_cents numeric(6,3),
  created_at timestamptz default now(),
  unique (chapter_id, slot)
);

-- Enable RLS + public read
alter table public.book_chapter_images enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'book_chapter_images' and policyname = 'book_chapter_images public read'
  ) then
    create policy "book_chapter_images public read"
      on public.book_chapter_images
      for select
      using (true);
  end if;
end$$;

-- 5) Book pages: attach illustration URL and prompt
alter table public.book_pages
  add column if not exists illustration_url text,
  add column if not exists illustration_prompt text;

-- 6) Extend nova_jobs with chapter_id (FK), but avoid breaking existing constraints
-- Add chapter_id if missing
alter table public.nova_jobs
  add column if not exists chapter_id uuid;

-- Add FK if missing
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'nova_jobs'
      and constraint_name = 'nova_jobs_chapter_id_fkey'
  ) then
    alter table public.nova_jobs
      add constraint nova_jobs_chapter_id_fkey
      foreign key (chapter_id) references public.book_chapters(id) on delete cascade;
  end if;
end$$;

-- Note: We intentionally do not alter any existing job_type CHECK constraint here
-- to avoid conflicts with unknown constraint names. The worker will insert
-- 'illustrate'/'illustrate_slot'/'illustrate_finalize' values.

-- 7) First-read trigger: stamp started_at and enqueue a bootstrap 'illustrate' job once
create or replace function public._mark_first_read_and_enqueue_illustrations()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- 8) Storage bucket for illustrations (public read)
insert into storage.buckets (id, name, public)
select 'book-art', 'book-art', true
where not exists (select 1 from storage.buckets where id = 'book-art');

-- Public read policies for the bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for book-art (anon)'
  ) then
    create policy "Public read for book-art (anon)"
      on storage.objects for select
      to anon
      using (bucket_id = 'book-art');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for book-art (auth)'
  ) then
    create policy "Public read for book-art (auth)"
      on storage.objects for select
      to authenticated
      using (bucket_id = 'book-art');
  end if;
end$$;
