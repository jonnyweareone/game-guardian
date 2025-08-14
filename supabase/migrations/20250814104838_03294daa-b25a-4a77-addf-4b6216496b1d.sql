
-- Add status column and indexes if they don't exist
ALTER TABLE public.devices 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'offline';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS devices_last_seen_idx ON public.devices(last_seen);
CREATE INDEX IF NOT EXISTS devices_status_idx ON public.devices(status);

-- Update the RLS policy to allow devices to update themselves
DROP POLICY IF EXISTS device_update_self ON public.devices;
CREATE POLICY device_update_self ON public.devices
FOR UPDATE
USING (
  -- Allow when jwt 'sub' claim matches this device_code
  device_code = COALESCE((auth.jwt() ->> 'sub')::text, '')
);

-- Function to mark devices offline if stale (helper for scheduled jobs)
CREATE OR REPLACE FUNCTION public.mark_devices_offline_if_stale(grace_seconds int)
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  UPDATE public.devices
  SET status = 'offline'
  WHERE COALESCE(last_seen, to_timestamp(0)) < now() - make_interval(secs => grace_seconds);
$$;

-- Enable realtime for devices table
ALTER TABLE public.devices REPLICA IDENTITY FULL;
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.devices;
