-- Add soft delete column to devices table
ALTER TABLE public.devices ADD COLUMN deleted_at timestamp with time zone;

-- Create RPC function to safely remove devices
CREATE OR REPLACE FUNCTION public.rpc_remove_device(_device uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _parent_id uuid;
BEGIN
  -- Verify device belongs to calling parent
  SELECT parent_id INTO _parent_id FROM public.devices 
  WHERE id = _device AND deleted_at IS NULL;
  
  IF _parent_id IS NULL OR _parent_id <> auth.uid() THEN
    RAISE EXCEPTION 'Device not found or not owned by parent';
  END IF;

  -- Soft delete the device and cleanup sensitive data
  UPDATE public.devices 
  SET 
    deleted_at = now(),
    is_active = false,
    status = 'removed',
    child_id = NULL,
    device_jwt = NULL,
    nextdns_profile_id = NULL,
    updated_at = now()
  WHERE id = _device;

  -- Remove device-child assignments
  DELETE FROM public.device_child_assignments 
  WHERE device_id = _device;

  -- Log the removal
  INSERT INTO public.audit_log (action, actor, target, detail)
  VALUES (
    'device_removed',
    auth.uid()::text,
    _device::text,
    jsonb_build_object('timestamp', now())
  );

  RETURN true;
END;
$function$;