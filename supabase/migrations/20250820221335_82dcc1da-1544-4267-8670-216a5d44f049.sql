
-- Fix Alice's Adventures in Wonderland pointing to the wrong Gutenberg book
-- Book: 236ea51d-6b90-474c-9491-d20d2cc1679b

-- 1) Point to the correct Gutenberg ID (11) and reset processing flags
update public.books
set
  source = 'gutenberg',
  source_id = '11',
  gutenberg_id = 11,
  ingested = false,
  pages = null,
  analysis_done = false,
  analysis_at = null,
  images_generated = false,
  started_at = null
where id = '236ea51d-6b90-474c-9491-d20d2cc1679b';

-- 2) Clean out any stale content for this book
delete from public.book_chapter_images where book_id = '236ea51d-6b90-474c-9491-d20d2cc1679b';
delete from public.book_chapters       where book_id = '236ea51d-6b90-474c-9491-d20d2cc1679b';
delete from public.book_pages          where book_id = '236ea51d-6b90-474c-9491-d20d2cc1679b';

-- 3) Remove any queued/running jobs that would collide
delete from public.nova_jobs
where book_id = '236ea51d-6b90-474c-9491-d20d2cc1679b'
  and job_type in ('ingest','illustrate','illustrate_slot','illustrate_finalize')
  and status in ('queued','running');

-- 4) Enqueue a fresh ingestion job for Alice (Gutenberg:11)
insert into public.nova_jobs (job_type, book_id, payload)
select
  'ingest',
  '236ea51d-6b90-474c-9491-d20d2cc1679b',
  jsonb_build_object('source','gutenberg','source_id','11')
where not exists (
  select 1 from public.nova_jobs j
  where j.book_id = '236ea51d-6b90-474c-9491-d20d2cc1679b'
    and j.job_type = 'ingest'
    and j.status in ('queued','running')
);
