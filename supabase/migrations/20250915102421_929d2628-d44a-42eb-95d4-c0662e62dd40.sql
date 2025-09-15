-- Phase 1: CPE Schema - Additive tables with parent_id scoping
-- No changes to existing tables

-- Gateways (CPE)
CREATE TABLE IF NOT EXISTS cpe_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  external_id text NOT NULL,                 -- router serial or WAN MAC
  model text,
  firmware text,
  site_name text,
  last_heartbeat timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, external_id)
);

-- Clients discovered behind a gateway
CREATE TABLE IF NOT EXISTS cpe_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  gateway_id uuid REFERENCES cpe_gateways(id) ON DELETE CASCADE,
  mac text NOT NULL,
  hostname text,
  child_id uuid,                              -- link to existing child table (nullable)
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz,
  UNIQUE(parent_id, mac)
);

-- Network policy profiles (map to NextDNS + L7 flags)
CREATE TABLE IF NOT EXISTS cpe_policy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  name text NOT NULL,
  category_blocks text[] DEFAULT '{}',
  safe_search boolean DEFAULT true,
  study_mode boolean DEFAULT false,
  bedtime jsonb DEFAULT '{}'::jsonb,         -- {"weekday":{"start":"21:00","end":"07:00"}}
  nextdns_profile_id text,
  l7_enabled boolean DEFAULT false,
  vpn_detection boolean DEFAULT true,
  kill_switch_mode text DEFAULT 'pause',      -- pause|quarantine|hardblock
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cpe_policy_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  client_id uuid REFERENCES cpe_clients(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES cpe_policy_profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, client_id)
);

-- Raw USP events + audit (for "Why blocked?" and diagnostics)
CREATE TABLE IF NOT EXISTS usp_events_raw (
  id bigserial PRIMARY KEY,
  parent_id uuid NOT NULL,
  device_external_id text NOT NULL,
  topic text NOT NULL,
  ts timestamptz DEFAULT now(),
  usp_b64 text NOT NULL
);

-- Billing flags (new table)
CREATE TABLE IF NOT EXISTS entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  tier text NOT NULL,                         -- family | family_plus
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Optional: theme/whitelabel
CREATE TABLE IF NOT EXISTS tenant_theme (
  parent_id uuid PRIMARY KEY,
  logo_url text,
  primary_hex text,
  help_url text,
  support_email text
);

-- RLS: enable & parent-scoped
ALTER TABLE cpe_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpe_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpe_policy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpe_policy_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usp_events_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_theme ENABLE ROW LEVEL SECURITY;

-- Helper: accept parent_id from JWT claims for both user and device JWTs
CREATE POLICY cpe_gateways_rw ON cpe_gateways
  USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id')
  WITH CHECK (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');

CREATE POLICY cpe_clients_rw ON cpe_clients
  USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id')
  WITH CHECK (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');

CREATE POLICY cpe_profiles_rw ON cpe_policy_profiles
  USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id')
  WITH CHECK (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');

CREATE POLICY cpe_assignments_rw ON cpe_policy_assignments
  USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id')
  WITH CHECK (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');

CREATE POLICY usp_events_read ON usp_events_raw
  FOR SELECT USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');

CREATE POLICY entitlements_read ON entitlements
  FOR SELECT USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');

CREATE POLICY theme_read ON tenant_theme
  FOR SELECT USING (parent_id = auth.uid() OR parent_id::text = current_setting('request.jwt.claims', true)::jsonb->>'parent_id');