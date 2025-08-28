-- Clear all queued/running jobs for the device
UPDATE public.device_jobs 
SET status = 'failed', 
    updated_at = now()
WHERE device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3' 
  AND status IN ('queued', 'running');

-- Add fresh VLC installation job
INSERT INTO public.device_jobs (device_id, type, status, payload)
VALUES (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP', 
  'queued',
  jsonb_build_object('app_id', 'vlc')
);