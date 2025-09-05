-- Fix app inventory and policy management for real-time updates

-- 1. Ensure real-time subscription is enabled for device app tables
ALTER PUBLICATION supabase_realtime ADD TABLE device_app_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE device_app_policy;
ALTER PUBLICATION supabase_realtime ADD TABLE device_app_events;

-- 2. Fix toggle_app_policy function to handle device_id as UUID properly
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
  v_device_uuid uuid;
BEGIN
  -- Convert device_id to UUID if it's a UUID string
  BEGIN
    v_device_uuid := p_device_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If not a UUID, treat as device_id text
    v_device_uuid := NULL;
  END;
  
  -- Ensure policy row exists (handle both UUID and text device_id)
  IF v_device_uuid IS NOT NULL THEN
    -- UUID device_id
    INSERT INTO device_app_policy(device_id, app_id)
    VALUES (v_device_uuid::text, p_app_id)
    ON CONFLICT (device_id, app_id) DO NOTHING;
    
    -- Update policy atomically
    UPDATE device_app_policy
       SET approved      = p_enable,
           hidden        = NOT p_enable,
           approved_at   = CASE WHEN p_enable THEN now() ELSE NULL END,
           blocked_reason= CASE WHEN p_enable THEN NULL ELSE COALESCE(p_reason, blocked_reason) END,
           updated_at    = now()
     WHERE device_id = v_device_uuid::text
       AND app_id    = p_app_id
    RETURNING * INTO v_row;
  ELSE
    -- Text device_id
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
  END IF;

  RETURN v_row;
END;
$$;

-- 3. Fix set_app_schedule function to handle device_id as UUID properly  
CREATE OR REPLACE FUNCTION set_app_schedule(
  p_device_id text,
  p_app_id    text,
  p_schedule  jsonb
)
RETURNS device_app_policy
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row device_app_policy;
  v_device_uuid uuid;
BEGIN
  -- Convert device_id to UUID if it's a UUID string
  BEGIN
    v_device_uuid := p_device_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    v_device_uuid := NULL;
  END;
  
  IF v_device_uuid IS NOT NULL THEN
    -- UUID device_id
    INSERT INTO device_app_policy (device_id, app_id, schedule)
    VALUES (v_device_uuid::text, p_app_id, COALESCE(p_schedule, '{}'::jsonb))
    ON CONFLICT (device_id, app_id) DO UPDATE
      SET schedule   = excluded.schedule,
          updated_at = now()
    RETURNING * INTO v_row;
  ELSE
    -- Text device_id
    INSERT INTO device_app_policy (device_id, app_id, schedule)
    VALUES (p_device_id, p_app_id, COALESCE(p_schedule, '{}'::jsonb))
    ON CONFLICT (device_id, app_id) DO UPDATE
      SET schedule   = excluded.schedule,
          updated_at = now()
    RETURNING * INTO v_row;
  END IF;
  
  RETURN v_row;
END;
$$;

-- 4. Ensure inventory trigger creates policy rows for all new apps
CREATE OR REPLACE FUNCTION ensure_policy_row() 
RETURNS trigger 
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO device_app_policy (device_id, app_id, approved, hidden)
  VALUES (NEW.device_id, NEW.app_id, false, false)
  ON CONFLICT (device_id, app_id) DO NOTHING;
  RETURN NEW;
END; 
$$;