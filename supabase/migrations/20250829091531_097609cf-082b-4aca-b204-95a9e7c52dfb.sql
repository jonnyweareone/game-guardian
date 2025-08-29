-- Delete existing jobs for the device
DELETE FROM public.device_jobs 
WHERE device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3';

-- Insert/update VLC in app catalog with proper flatpak configuration
INSERT INTO public.app_catalog (id, name, category, package_type, package_id, is_active, warning_level)
VALUES ('vlc', 'VLC', 'App', 'flatpak', 'org.videolan.VLC', true, 0)
ON CONFLICT (id) DO UPDATE SET 
  package_type = EXCLUDED.package_type, 
  package_id = EXCLUDED.package_id, 
  is_active = true;

-- Queue VLC installation job
INSERT INTO public.device_jobs (device_id, type, status, payload)
VALUES ('e9c03bc0-1584-4a97-ac3a-4b7d87b507a3', 'INSTALL_APP', 'queued', jsonb_build_object('app_id', 'vlc'));