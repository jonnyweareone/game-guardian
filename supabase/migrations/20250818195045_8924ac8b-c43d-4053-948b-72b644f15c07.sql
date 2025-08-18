
-- Create device_kind enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE device_kind AS ENUM ('os','mobile');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Extend devices table for mobile support
ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS kind device_kind NOT NULL DEFAULT 'os',
    ADD COLUMN IF NOT EXISTS platform text CHECK (platform IN ('ios','android','linux','windows','macos')) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS mdm_enrolled boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS vpn_active boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS nextdns_profile_id text DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS iccid text DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS battery smallint;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_child_kind ON devices(child_id, kind);
CREATE INDEX IF NOT EXISTS idx_devices_kind_platform ON devices(kind, platform);

-- Create device pairing tokens table
CREATE TABLE IF NOT EXISTS device_pair_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    kind device_kind NOT NULL DEFAULT 'mobile',
    platform text CHECK (platform IN ('ios','android')) DEFAULT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz DEFAULT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on device_pair_tokens
ALTER TABLE device_pair_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for device_pair_tokens
DO $$ BEGIN
    CREATE POLICY "parent-create-token" ON device_pair_tokens FOR INSERT
    WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "parent-read-own-tokens" ON device_pair_tokens FOR SELECT
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "parent-update-own-tokens" ON device_pair_tokens FOR UPDATE
    USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
