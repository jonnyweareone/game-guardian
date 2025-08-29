
-- Cancel (fail) the currently running job
UPDATE public.device_jobs
SET status = 'failed', updated_at = now()
WHERE id = 'e203190b-314d-4255-8560-5040da1efb2b';

-- Prevent duplicates: remove any already queued VLC install jobs
DELETE FROM public.device_jobs
WHERE device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3'
  AND status = 'queued'
  AND type = 'INSTALL_APP'
  AND payload->>'app_id' = 'vlc';

-- Queue a fresh VLC installation job
INSERT INTO public.device_jobs (device_id, type, status, payload)
VALUES (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP',
  'queued',
  jsonb_build_object('app_id','vlc')
);
