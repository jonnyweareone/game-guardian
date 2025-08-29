-- App management tables for device app inventory and policies

-- Device app inventory - tracks what apps are installed on each device
CREATE TABLE IF NOT EXISTS device_app_inventory (
  device_id text NOT NULL,
  app_id text NOT NULL,
  name text,
  version text,
  source text CHECK (source IN ('flatpak','apt','snap','web')),
  installed_by text CHECK (installed_by IN ('web','local')) DEFAULT 'local',
  first_seen timestamptz NOT NULL DEFAULT now(),
  seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, app_id)
);

-- Device app policy - parent controls for each app on each device
CREATE TABLE IF NOT EXISTS device_app_policy (
  device_id text NOT NULL,
  app_id text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT true,
  schedule jsonb DEFAULT '{}',
  blocked_reason text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, app_id)
);

-- Device app events - logs all app launch attempts and installs
CREATE TABLE IF NOT EXISTS device_app_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  app_id text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  event text NOT NULL CHECK (event IN ('launch_allowed','launch_blocked','installed','uninstalled')),
  meta jsonb DEFAULT '{}'
);

-- Trigger function to ensure policy row exists when app is added to inventory
CREATE OR REPLACE FUNCTION ensure_policy_row() 
RETURNS trigger 
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO device_app_policy (device_id, app_id)
  VALUES (NEW.device_id, NEW.app_id)
  ON CONFLICT (device_id, app_id) DO NOTHING;
  RETURN NEW;
END; 
$$;

-- Trigger to auto-create policy rows
DROP TRIGGER IF EXISTS trg_inventory_policy ON device_app_inventory;
CREATE TRIGGER trg_inventory_policy
  AFTER INSERT ON device_app_inventory
  FOR EACH ROW EXECUTE FUNCTION ensure_policy_row();

-- Update timestamp trigger
CREATE TRIGGER trg_policy_updated_at
  BEFORE UPDATE ON device_app_policy
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE device_app_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_app_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_app_events ENABLE ROW LEVEL SECURITY;

-- Device can read/write its own inventory
CREATE POLICY device_inventory_access ON device_app_inventory
  FOR ALL USING (device_id = jwt_device_id_text())
  WITH CHECK (device_id = jwt_device_id_text());

-- Parents can view inventory for their devices
CREATE POLICY parent_inventory_view ON device_app_inventory
  FOR SELECT USING (
    device_id IN (
      SELECT d.id::text FROM devices d WHERE d.parent_id = auth.uid()
    )
  );

-- Parents can manage policies for their devices
CREATE POLICY parent_policy_manage ON device_app_policy
  FOR ALL USING (
    device_id IN (
      SELECT d.id::text FROM devices d WHERE d.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    device_id IN (
      SELECT d.id::text FROM devices d WHERE d.parent_id = auth.uid()
    )
  );

-- Device can read its own policies
CREATE POLICY device_policy_read ON device_app_policy
  FOR SELECT USING (device_id = jwt_device_id_text());

-- Device can log events
CREATE POLICY device_events_log ON device_app_events
  FOR INSERT WITH CHECK (device_id = jwt_device_id_text());

-- Parents can view events for their devices
CREATE POLICY parent_events_view ON device_app_events
  FOR SELECT USING (
    device_id IN (
      SELECT d.id::text FROM devices d WHERE d.parent_id = auth.uid()
    )
  );