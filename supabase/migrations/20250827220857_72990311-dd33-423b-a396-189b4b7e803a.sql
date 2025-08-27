
BEGIN;

-- Delete rows that depend on devices
DELETE FROM public.device_jobs
WHERE device_id IN (SELECT id FROM public.devices);

DELETE FROM public.app_activity
WHERE device_id IN (SELECT id FROM public.devices);

DELETE FROM public.device_activations
WHERE device_id IN (SELECT id FROM public.devices);

-- Conditionally delete from optional tables if they exist
DO $$
BEGIN
  IF to_regclass('public.device_child_assignments') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.device_child_assignments WHERE device_id IN (SELECT id FROM public.devices)';
  END IF;

  IF to_regclass('public.device_commands') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.device_commands WHERE device_id IN (SELECT id FROM public.devices)';
  END IF;
END $$;

-- Finally, purge the devices themselves
DELETE FROM public.devices;

COMMIT;
