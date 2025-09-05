-- Update RPC function to return jsonb and improve performance
CREATE OR REPLACE FUNCTION public.get_demo_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, demo
AS $$
DECLARE
  devices_json JSONB;
  events_json JSONB;
BEGIN
  -- Only allow admin users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin required';
  END IF;
  
  -- Get devices
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'device_id', d.device_id,
    'child', d.child,
    'status', d.status,
    'last_heartbeat', d.last_heartbeat,
    'inserted_at', d.inserted_at
  ) ORDER BY d.last_heartbeat DESC NULLS LAST), '[]'::jsonb)
  INTO devices_json
  FROM demo.devices d;

  -- Get recent events
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'device_id', e.device_id,
    'type', e.type,
    'payload', e.payload,
    'created_at', e.created_at
  ) ORDER BY e.created_at DESC), '[]'::jsonb)
  INTO events_json
  FROM demo.events e
  WHERE e.created_at > now() - interval '7 days'
  LIMIT 200;

  RETURN jsonb_build_object('devices', devices_json, 'events', events_json);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_demo_data() TO anon, authenticated;