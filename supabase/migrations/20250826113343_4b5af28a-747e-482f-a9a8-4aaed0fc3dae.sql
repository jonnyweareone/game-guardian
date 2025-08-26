BEGIN;

-- Check if tables exist and truncate them safely
-- Drop child/related rows first if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_heartbeats') THEN
        TRUNCATE TABLE public.device_heartbeats RESTART IDENTITY CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_jobs') THEN
        TRUNCATE TABLE public.device_jobs RESTART IDENTITY CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_events') THEN
        TRUNCATE TABLE public.device_events RESTART IDENTITY CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_child_assignments') THEN
        TRUNCATE TABLE public.device_child_assignments RESTART IDENTITY CASCADE;
    END IF;
END $$;

-- Finally wipe devices
TRUNCATE TABLE public.devices RESTART IDENTITY CASCADE;

COMMIT;