
-- 1) Reset flags for all books
UPDATE public.books
SET
  ingested = false,
  ingested_at = NULL,
  analysis_done = false,
  analysis_at = NULL,
  started_at = NULL
;

-- 2) Optional: clean up any already-queued ingest jobs to avoid duplicates
DELETE FROM public.nova_jobs j
WHERE j.job_type = 'ingest'
  AND j.status IN ('queued','running');

-- 3) Queue a fresh ingest job for every book with a valid source
INSERT INTO public.nova_jobs (job_type, book_id, payload, status)
SELECT
  'ingest' AS job_type,
  b.id AS book_id,
  jsonb_build_object(
    'source', b.source,
    'gutenberg_id', b.gutenberg_id,
    'source_url', b.source_url
  ) AS payload,
  'queued' AS status
FROM public.books b
WHERE COALESCE(b.source_url, '') <> '' OR b.gutenberg_id IS NOT NULL;
