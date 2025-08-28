-- Purge all jobs for the device
DELETE FROM public.device_jobs 
WHERE device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3';

-- Add fresh VLC installation job
INSERT INTO public.device_jobs (device_id, type, status, payload)
VALUES (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP', 
  'queued',
  jsonb_build_object('app_id', 'vlc')
);