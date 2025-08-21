-- Add missing triggers for book processing workflow
DO $$
BEGIN
  -- books -> enqueue ingestion jobs
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_books_enqueue_ingest'
  ) THEN
    CREATE TRIGGER tr_books_enqueue_ingest
    AFTER INSERT OR UPDATE OF source_url, source_id, ingested
    ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.enqueue_ingest_job();
  END IF;

  -- child_reading_sessions -> enqueue analysis on first read
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_crs_enqueue_analysis'
  ) THEN
    CREATE TRIGGER tr_crs_enqueue_analysis
    AFTER INSERT ON public.child_reading_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.enqueue_analysis_on_first_read();
  END IF;

  -- child_reading_sessions -> mark first read and enqueue progressive illustrations
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_crs_first_read'
  ) THEN
    CREATE TRIGGER tr_crs_first_read
    AFTER INSERT ON public.child_reading_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public._mark_first_read_and_enqueue_illustrations();
  END IF;
END
$$;

-- Backfill: mark books as ingested where pages already exist
UPDATE public.books b
SET ingested = true,
    ingested_at = COALESCE(ingested_at, now())
WHERE COALESCE(b.ingested, false) = false
  AND EXISTS (
    SELECT 1
    FROM public.book_pages p
    WHERE p.book_id = b.id
  );

-- Close out book_ingests stuck in 'processing' where pages now exist
UPDATE public.book_ingests bi
SET status = 'completed',
    completed_at = COALESCE(completed_at, now())
WHERE status = 'processing'
  AND book_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.book_pages p
    WHERE p.book_id = bi.book_id
  );

-- Mark very old processing jobs as error (safety cleanup)
UPDATE public.book_ingests
SET status = 'error',
    error = COALESCE(error, 'Marked error due to timeout'),
    completed_at = now()
WHERE status = 'processing'
  AND started_at < now() - interval '60 minutes';