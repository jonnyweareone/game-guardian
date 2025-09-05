-- Create RPC function to fetch demo data
CREATE OR REPLACE FUNCTION public.get_demo_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admin users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin required';
  END IF;
  
  SELECT json_build_object(
    'devices', (
      SELECT json_agg(
        json_build_object(
          'device_id', d.device_id,
          'child', d.child,
          'status', d.status,
          'last_heartbeat', d.last_heartbeat,
          'inserted_at', d.inserted_at
        )
      )
      FROM demo.devices d
      ORDER BY d.last_heartbeat DESC NULLS LAST
    ),
    'events', (
      SELECT json_agg(
        json_build_object(
          'id', e.id,
          'device_id', e.device_id,
          'type', e.type,
          'payload', e.payload,
          'created_at', e.created_at
        )
      )
      FROM demo.events e
      ORDER BY e.created_at DESC
      LIMIT 200
    )
  ) INTO result;
  
  RETURN result;
END;
$$;