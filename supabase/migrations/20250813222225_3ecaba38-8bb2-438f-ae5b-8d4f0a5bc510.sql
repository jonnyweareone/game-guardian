-- Add refresh secret + telemetry, idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='devices' AND column_name='refresh_secret_hash'
  ) THEN
    ALTER TABLE public.devices
      ADD COLUMN refresh_secret_hash text,
      ADD COLUMN last_token_issued_at timestamptz,
      ADD COLUMN last_refresh_ip inet;
  END IF;
END$$;