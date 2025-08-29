-- Queue Minecraft installation job for device e9c03bc0-1584-4a97-ac3a-4b7d87b507a3
INSERT INTO public.device_jobs (device_id, type, status, payload)
VALUES (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP',
  'queued',
  jsonb_build_object('app_id', 'com.mojang.Minecraft', 'method', 'flatpak')
);