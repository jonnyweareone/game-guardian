-- Add Supabase RPCs for OS Apps management

-- Toggle app approval/blocking with atomic updates
CREATE OR REPLACE FUNCTION toggle_app_policy(
  p_device_id text,
  p_app_id    text,
  p_enable    boolean,
  p_reason    text default null
)
RETURNS device_app_policy
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row device_app_policy;
BEGIN
  -- Ensure policy row exists
  INSERT INTO device_app_policy(device_id, app_id)
  VALUES (p_device_id, p_app_id)
  ON CONFLICT (device_id, app_id) DO NOTHING;

  -- Update policy atomically
  UPDATE device_app_policy
     SET approved      = p_enable,
         hidden        = NOT p_enable,
         approved_at   = CASE WHEN p_enable THEN now() ELSE NULL END,
         blocked_reason= CASE WHEN p_enable THEN NULL ELSE COALESCE(p_reason, blocked_reason) END,
         updated_at    = now()
   WHERE device_id = p_device_id
     AND app_id    = p_app_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_app_policy(text,text,boolean,text) TO authenticated;

-- Set app schedule with atomic updates
CREATE OR REPLACE FUNCTION set_app_schedule(
  p_device_id text,
  p_app_id    text,
  p_schedule  jsonb
)
RETURNS device_app_policy
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO device_app_policy (device_id, app_id, schedule)
  VALUES (p_device_id, p_app_id, COALESCE(p_schedule, '{}'::jsonb))
  ON CONFLICT (device_id, app_id) DO UPDATE
    SET schedule   = excluded.schedule,
        updated_at = now()
  RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION set_app_schedule(text,text,jsonb) TO authenticated;