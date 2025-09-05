-- Create demo schema
CREATE SCHEMA IF NOT EXISTS demo;

-- Demo devices table
CREATE TABLE IF NOT EXISTS demo.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  child TEXT,
  status TEXT DEFAULT 'registered',
  last_heartbeat TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ DEFAULT now()
);

-- Demo events table (generic timeline)
CREATE TABLE IF NOT EXISTS demo.events (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'heartbeat' | 'reflex' | 'app' | 'dns' | 'activation' | 'sleep'
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER TABLE demo.devices REPLICA IDENTITY FULL;
ALTER TABLE demo.events REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE demo.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE demo.events;

-- RLS policies (admin only)
ALTER TABLE demo.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read demo devices" ON demo.devices FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin can read demo events" ON demo.events FOR SELECT TO authenticated USING (is_admin());