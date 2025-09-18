-- Guardian Parent Portal - Complete Schema Extension (Fixed)
-- Production-ready SQL for Supabase integration

BEGIN;

-- =============================================================================
-- SECTION 1: ENHANCE EXISTING TABLES FOR GUARDIAN
-- =============================================================================

-- Extend existing children table for Guardian Parent Portal
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE children ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York';
ALTER TABLE children ADD COLUMN IF NOT EXISTS xbox_gamertag VARCHAR(100);
ALTER TABLE children ADD COLUMN IF NOT EXISTS assigned_devices JSONB DEFAULT '[]';
ALTER TABLE children ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE children ADD COLUMN IF NOT EXISTS guardian_metadata JSONB DEFAULT '{}';

-- Add status constraint for children
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'children_status_check') THEN
        ALTER TABLE children ADD CONSTRAINT children_status_check
          CHECK (status IN ('active', 'paused', 'archived'));
    END IF;
END $$;

-- Extend existing app_catalog for Guardian features (guardian_enabled already exists)
ALTER TABLE app_catalog ADD COLUMN IF NOT EXISTS parental_category VARCHAR(50);
ALTER TABLE app_catalog ADD COLUMN IF NOT EXISTS time_limit_recommended INTEGER; -- minutes per day
ALTER TABLE app_catalog ADD COLUMN IF NOT EXISTS age_rating VARCHAR(20) DEFAULT 'all_ages';
ALTER TABLE app_catalog ADD COLUMN IF NOT EXISTS detection_priority INTEGER DEFAULT 50;
ALTER TABLE app_catalog ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Add constraints for app_catalog Guardian fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_catalog_parental_category_check') THEN
        ALTER TABLE app_catalog ADD CONSTRAINT app_catalog_parental_category_check
          CHECK (parental_category IN ('gaming', 'social_media', 'streaming', 'education', 'web_browsing', 'productivity', 'other') OR parental_category IS NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_catalog_age_rating_check') THEN
        ALTER TABLE app_catalog ADD CONSTRAINT app_catalog_age_rating_check
          CHECK (age_rating IN ('all_ages', '9_plus', '12_plus', '17_plus', 'adults_only'));
    END IF;
END $$;

-- =============================================================================
-- SECTION 2: XBOX INTEGRATION TABLES
-- =============================================================================

-- Xbox account links for children
CREATE TABLE IF NOT EXISTS child_xbox_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    gamertag VARCHAR(100) NOT NULL,
    xuid VARCHAR(50) NOT NULL UNIQUE, -- Xbox User ID from Microsoft
    oauth_tokens JSONB NOT NULL, -- Encrypted access/refresh tokens
    token_expires_at TIMESTAMPTZ NOT NULL,
    link_status VARCHAR(20) DEFAULT 'active',
    permissions_granted JSONB DEFAULT '{}', -- Xbox API scopes
    last_presence_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT xbox_links_status_check
      CHECK (link_status IN ('active', 'expired', 'revoked', 'error')),
    CONSTRAINT xbox_links_child_unique UNIQUE (child_id, gamertag)
);

-- Xbox presence cache for real-time gaming status
CREATE TABLE IF NOT EXISTS xbox_presence_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    xbox_link_id UUID NOT NULL REFERENCES child_xbox_links(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    current_game VARCHAR(200),
    game_start_time TIMESTAMPTZ,
    presence_state VARCHAR(20) DEFAULT 'offline',
    device_type VARCHAR(30), -- console, pc, mobile
    raw_presence_data JSONB DEFAULT '{}', -- Full Xbox API response
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT xbox_presence_state_check
      CHECK (presence_state IN ('online', 'away', 'busy', 'offline')),
    CONSTRAINT xbox_presence_device_check
      CHECK (device_type IN ('console', 'pc', 'mobile') OR device_type IS NULL)
);

-- Create indexes for Xbox tables
CREATE INDEX IF NOT EXISTS idx_xbox_links_child ON child_xbox_links(child_id);
CREATE INDEX IF NOT EXISTS idx_xbox_links_status ON child_xbox_links(link_status);
CREATE INDEX IF NOT EXISTS idx_xbox_presence_link ON xbox_presence_cache(xbox_link_id);
CREATE INDEX IF NOT EXISTS idx_xbox_presence_cached ON xbox_presence_cache(cached_at DESC);

-- =============================================================================
-- SECTION 3: NETWORK DETECTION & APP IDENTIFICATION
-- =============================================================================

-- Network detection rules for app identification
CREATE TABLE IF NOT EXISTS app_network_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT NOT NULL REFERENCES app_catalog(id) ON DELETE CASCADE,
    detection_type VARCHAR(20) NOT NULL,
    pattern VARCHAR(500) NOT NULL,
    confidence_weight INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT app_network_detection_type_check
      CHECK (detection_type IN ('dns', 'sni', 'ip_range', 'asn', 'port', 'user_agent')),
    CONSTRAINT app_network_confidence_check
      CHECK (confidence_weight >= 1 AND confidence_weight <= 100)
);

-- Session tracking for Guardian app usage (separate from desktop telemetry)
CREATE TABLE IF NOT EXISTS guardian_app_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- Nullable for shared devices
    app_id TEXT NOT NULL REFERENCES app_catalog(id) ON DELETE CASCADE,
    device_id VARCHAR(100), -- Reference to ISP platform device
    session_source VARCHAR(30) DEFAULT 'network',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    detection_confidence VARCHAR(20) DEFAULT 'medium',
    detection_method VARCHAR(50),
    bytes_transferred BIGINT DEFAULT 0,
    session_metadata JSONB DEFAULT '{}',
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE WHEN ended_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (ended_at - started_at))/60 
        ELSE NULL END
    ) STORED,
    
    CONSTRAINT guardian_sessions_source_check
      CHECK (session_source IN ('network', 'xbox_api', 'desktop', 'manual')),
    CONSTRAINT guardian_sessions_confidence_check  
      CHECK (detection_confidence IN ('high', 'medium', 'low'))
);

-- Create indexes for app detection and sessions
CREATE INDEX IF NOT EXISTS idx_app_network_info_app ON app_network_info(app_id);
CREATE INDEX IF NOT EXISTS idx_app_network_info_type ON app_network_info(detection_type, is_active);
CREATE INDEX IF NOT EXISTS idx_guardian_sessions_child ON guardian_app_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_guardian_sessions_app ON guardian_app_sessions(app_id);
CREATE INDEX IF NOT EXISTS idx_guardian_sessions_date ON guardian_app_sessions(started_at DESC);

-- =============================================================================
-- SECTION 4: POLICY MANAGEMENT
-- =============================================================================

-- Console-specific policies (Xbox, PlayStation, Nintendo)
CREATE TABLE IF NOT EXISTS console_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    device_id VARCHAR(100), -- Optional - can be child-wide or device-specific
    content_rating_max VARCHAR(20) DEFAULT 't', -- ESRB: ec, e, e10_plus, t, m, ao
    multiplayer_allowed BOOLEAN DEFAULT TRUE,
    voice_chat_allowed BOOLEAN DEFAULT FALSE,
    text_chat_allowed BOOLEAN DEFAULT FALSE,
    purchases_allowed BOOLEAN DEFAULT FALSE,
    friend_requests_allowed BOOLEAN DEFAULT FALSE,
    game_captures_allowed BOOLEAN DEFAULT TRUE,
    livestreaming_allowed BOOLEAN DEFAULT FALSE,
    cloud_gaming_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT console_policies_rating_check
      CHECK (content_rating_max IN ('ec', 'e', 'e10_plus', 't', 'm', 'ao', 'rating_pending'))
);

-- Per-app policies for time limits and controls
CREATE TABLE IF NOT EXISTS guardian_app_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL REFERENCES app_catalog(id) ON DELETE CASCADE,
    action VARCHAR(30) DEFAULT 'allow',
    daily_limit_minutes INTEGER,
    weekly_limit_minutes INTEGER,
    allowed_time_windows JSONB, -- e.g., {"weekdays": "16:00-20:00", "weekend": "10:00-22:00"}
    bedtime_enforcement BOOLEAN DEFAULT TRUE,
    age_override_allowed BOOLEAN DEFAULT FALSE, -- Parent can override age restrictions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT guardian_app_policies_action_check
      CHECK (action IN ('allow', 'block', 'ask_permission', 'time_limit_only')),
    CONSTRAINT guardian_app_policies_child_app_unique UNIQUE (child_id, app_id)
);

-- Policy presets for age-appropriate defaults
CREATE TABLE IF NOT EXISTS policy_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    age_band VARCHAR(20) NOT NULL,
    console_defaults JSONB NOT NULL DEFAULT '{}', -- Console policy template
    app_defaults JSONB NOT NULL DEFAULT '{}', -- Default app time limits
    is_system_preset BOOLEAN DEFAULT FALSE, -- Cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT policy_presets_age_band_check
      CHECK (age_band IN ('child_0_5', 'child_6_9', 'child_10_12', 'teen_13_15', 'teen_16_17')),
    CONSTRAINT policy_presets_name_age_unique UNIQUE (name, age_band)
);

-- Create indexes for policy tables
CREATE INDEX IF NOT EXISTS idx_console_policies_child ON console_policies(child_id);
CREATE INDEX IF NOT EXISTS idx_guardian_app_policies_child ON guardian_app_policies(child_id);
CREATE INDEX IF NOT EXISTS idx_guardian_app_policies_app ON guardian_app_policies(app_id);
CREATE INDEX IF NOT EXISTS idx_policy_presets_age ON policy_presets(age_band);

-- =============================================================================
-- SECTION 5: ALERTS AND NOTIFICATIONS
-- =============================================================================

-- Enhanced alerts for Guardian Parent Portal
CREATE TABLE IF NOT EXISTS guardian_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- Nullable for system alerts
    app_id TEXT REFERENCES app_catalog(id) ON DELETE CASCADE, -- Nullable
    xbox_link_id UUID REFERENCES child_xbox_links(id) ON DELETE CASCADE, -- Nullable
    alert_type VARCHAR(50) NOT NULL,
    alert_category VARCHAR(30) DEFAULT 'general',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    alert_data JSONB DEFAULT '{}', -- Context-specific information
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    
    CONSTRAINT guardian_alerts_type_check
      CHECK (alert_type IN (
        'xbox_console_detected', 'app_detected', 'time_cap_warning', 'time_cap_exceeded',
        'bedtime_enforcement', 'xbox_token_expiring', 'policy_violation', 
        'unknown_gaming_activity', 'new_device_detected', 'device_offline'
      )),
    CONSTRAINT guardian_alerts_category_check
      CHECK (alert_category IN ('xbox', 'app_detection', 'policy', 'system', 'general')),
    CONSTRAINT guardian_alerts_severity_check
      CHECK (severity IN ('info', 'warning', 'critical')),
    CONSTRAINT guardian_alerts_status_check
      CHECK (status IN ('unread', 'read', 'archived'))
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_guardian_alerts_child ON guardian_alerts(child_id);
CREATE INDEX IF NOT EXISTS idx_guardian_alerts_type ON guardian_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_guardian_alerts_status ON guardian_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardian_alerts_category ON guardian_alerts(alert_category);

-- =============================================================================
-- SECTION 6: REWARD TIME AND SPECIAL PERMISSIONS
-- =============================================================================

-- Reward time grants (bonus screen time)
CREATE TABLE IF NOT EXISTS reward_time_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    granted_by_user_id UUID, -- Reference to profiles table (which parent granted)
    minutes_granted INTEGER NOT NULL,
    minutes_used INTEGER DEFAULT 0,
    reason TEXT,
    expires_at TIMESTAMPTZ, -- Optional expiration
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT reward_grants_status_check
      CHECK (status IN ('active', 'expired', 'used')),
    CONSTRAINT reward_grants_minutes_check
      CHECK (minutes_granted > 0 AND minutes_used >= 0 AND minutes_used <= minutes_granted)
);

-- Create index for reward time
CREATE INDEX IF NOT EXISTS idx_reward_grants_child ON reward_time_grants(child_id);
CREATE INDEX IF NOT EXISTS idx_reward_grants_status ON reward_time_grants(status, expires_at);

-- =============================================================================
-- SECTION 7: PERFORMANCE VIEWS FOR DASHBOARD
-- =============================================================================

-- Household overview for parent dashboard
CREATE OR REPLACE VIEW v_household_dashboard AS
SELECT 
    p.user_id as parent_id,
    p.full_name as parent_name,
    COUNT(DISTINCT c.id) as children_count,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_children,
    COUNT(DISTINCT xl.id) as xbox_links_count,
    COUNT(DISTINCT CASE WHEN al.status = 'unread' AND al.severity = 'critical' THEN al.id END) as critical_alerts,
    COUNT(DISTINCT CASE WHEN al.status = 'unread' THEN al.id END) as unread_alerts
FROM profiles p
LEFT JOIN children c ON c.parent_id = p.user_id
LEFT JOIN child_xbox_links xl ON xl.child_id = c.id AND xl.link_status = 'active'
LEFT JOIN guardian_alerts al ON al.child_id = c.id
GROUP BY p.user_id, p.full_name;

-- Child live status with current activity
CREATE OR REPLACE VIEW v_child_live_status AS
SELECT 
    c.id as child_id,
    c.name as child_name,
    c.age,
    c.xbox_gamertag,
    c.status as child_status,
    xl.link_status as xbox_status,
    xp.is_online as xbox_online,
    xp.current_game,
    xp.game_start_time,
    COUNT(DISTINCT gas.id) FILTER (WHERE gas.ended_at IS NULL) as active_sessions,
    COALESCE(
        SUM(
            CASE WHEN gas.ended_at IS NULL AND gas.started_at >= CURRENT_DATE THEN 
                EXTRACT(EPOCH FROM (NOW() - gas.started_at))/60 
            ELSE 0 END
        ), 0
    ) as todays_screen_time_minutes
FROM children c
LEFT JOIN child_xbox_links xl ON xl.child_id = c.id AND xl.link_status = 'active'
LEFT JOIN xbox_presence_cache xp ON xp.xbox_link_id = xl.id
LEFT JOIN guardian_app_sessions gas ON gas.child_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.age, c.xbox_gamertag, c.status, 
         xl.link_status, xp.is_online, xp.current_game, xp.game_start_time;

-- App usage summary for today
CREATE OR REPLACE VIEW v_app_usage_today AS
SELECT 
    c.id as child_id,
    c.name as child_name,
    ac.name as app_name,
    ac.parental_category,
    COUNT(gas.id) as session_count,
    COALESCE(SUM(gas.duration_minutes), 0) as total_minutes_today,
    COALESCE(ap.daily_limit_minutes, ac.time_limit_recommended, 60) as daily_limit,
    MAX(gas.started_at) as last_used_at
FROM children c
CROSS JOIN app_catalog ac
LEFT JOIN guardian_app_sessions gas ON gas.child_id = c.id 
    AND gas.app_id = ac.id 
    AND gas.started_at >= CURRENT_DATE
LEFT JOIN guardian_app_policies ap ON ap.child_id = c.id AND ap.app_id = ac.id
WHERE c.status = 'active' AND ac.guardian_enabled = TRUE
GROUP BY c.id, c.name, ac.id, ac.name, ac.parental_category, 
         ap.daily_limit_minutes, ac.time_limit_recommended
ORDER BY c.name, total_minutes_today DESC;

-- =============================================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all Guardian tables
ALTER TABLE child_xbox_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE xbox_presence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_network_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_app_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_time_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Parents can only see their own children's data
CREATE POLICY "Parents see own children xbox links" ON child_xbox_links
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE parent_id = auth.uid()
    )
);

CREATE POLICY "Parents see own children xbox presence" ON xbox_presence_cache
FOR ALL USING (
    xbox_link_id IN (
        SELECT xl.id FROM child_xbox_links xl
        JOIN children c ON c.id = xl.child_id
        WHERE c.parent_id = auth.uid()
    )
);

CREATE POLICY "Parents see own children app sessions" ON guardian_app_sessions
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE parent_id = auth.uid()
    ) OR child_id IS NULL -- Allow viewing shared device sessions
);

CREATE POLICY "Parents manage own children console policies" ON console_policies
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE parent_id = auth.uid()
    )
);

CREATE POLICY "Parents manage own children app policies" ON guardian_app_policies
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE parent_id = auth.uid()
    )
);

CREATE POLICY "Parents see own children alerts" ON guardian_alerts
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE parent_id = auth.uid()
    ) OR child_id IS NULL -- System-wide alerts
);

CREATE POLICY "Parents manage reward grants for their children" ON reward_time_grants
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE parent_id = auth.uid()
    )
);

-- App network info is public readable (for service detection)
CREATE POLICY "Authenticated users can read app network info" ON app_network_info
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy presets are public readable
CREATE POLICY "Authenticated users can read policy presets" ON policy_presets
FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- SECTION 9: SEED DATA FOR DEMO
-- =============================================================================

-- Insert popular gaming and streaming services with Guardian enablement
-- Note: Using category 'Gaming' to satisfy NOT NULL constraint
INSERT INTO app_catalog (id, name, category, parental_category, age_rating, guardian_enabled, time_limit_recommended, detection_priority, logo_url) 
VALUES 
    ('roblox-guardian', 'Roblox', 'Gaming', 'gaming', '9_plus', TRUE, 60, 90, 'https://logo.clearbit.com/roblox.com'),
    ('minecraft-guardian', 'Minecraft', 'Gaming', 'gaming', 'all_ages', TRUE, 90, 85, 'https://logo.clearbit.com/minecraft.net'),
    ('youtube-guardian', 'YouTube', 'Entertainment', 'streaming', '12_plus', TRUE, 45, 95, 'https://logo.clearbit.com/youtube.com'),
    ('tiktok-guardian', 'TikTok', 'Social', 'social_media', '12_plus', TRUE, 30, 80, 'https://logo.clearbit.com/tiktok.com'),
    ('netflix-guardian', 'Netflix', 'Entertainment', 'streaming', '12_plus', TRUE, 120, 70, 'https://logo.clearbit.com/netflix.com'),
    ('discord-guardian', 'Discord', 'Social', 'social_media', '12_plus', TRUE, 45, 75, 'https://logo.clearbit.com/discord.com'),
    ('fortnite-guardian', 'Fortnite', 'Gaming', 'gaming', '12_plus', TRUE, 90, 85, 'https://logo.clearbit.com/epicgames.com')
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    parental_category = EXCLUDED.parental_category,
    age_rating = EXCLUDED.age_rating,
    guardian_enabled = EXCLUDED.guardian_enabled,
    time_limit_recommended = EXCLUDED.time_limit_recommended,
    detection_priority = EXCLUDED.detection_priority,
    logo_url = EXCLUDED.logo_url;

-- Insert network detection rules for popular services
INSERT INTO app_network_info (app_id, detection_type, pattern, confidence_weight, notes) VALUES
    ('roblox-guardian', 'asn', 'AS22697', 95, 'Roblox Corporation ASN'),
    ('roblox-guardian', 'dns', '%.roblox.com', 90, 'Primary Roblox domains'),
    ('roblox-guardian', 'ip_range', '128.116.0.0/16', 85, 'Roblox IP block'),
    ('youtube-guardian', 'asn', 'AS15169', 90, 'Google ASN (YouTube parent)'),
    ('youtube-guardian', 'dns', '%.youtube.com', 95, 'YouTube domains'),
    ('youtube-guardian', 'dns', '%.googlevideo.com', 85, 'YouTube video CDN'),
    ('netflix-guardian', 'asn', 'AS2906', 90, 'Netflix ASN'),
    ('netflix-guardian', 'dns', '%.netflix.com', 95, 'Netflix domains'),
    ('netflix-guardian', 'dns', '%.nflxvideo.net', 85, 'Netflix video CDN'),
    ('discord-guardian', 'dns', '%.discord.com', 95, 'Discord domains'),
    ('discord-guardian', 'dns', '%.discordapp.com', 90, 'Discord app domains')
ON CONFLICT DO NOTHING;

-- Insert policy presets for different age groups
INSERT INTO policy_presets (name, age_band, console_defaults, app_defaults, is_system_preset) VALUES 
(
    'Strict', 'child_6_9',
    '{"content_rating_max": "e", "multiplayer_allowed": false, "voice_chat_allowed": false, "purchases_allowed": false}',
    '{"default_daily_limit": 60, "bedtime_enforcement": true}',
    TRUE
),
(
    'Balanced', 'child_10_12',
    '{"content_rating_max": "e10_plus", "multiplayer_allowed": true, "voice_chat_allowed": false, "purchases_allowed": false}',
    '{"default_daily_limit": 90, "bedtime_enforcement": true}',
    TRUE
),
(
    'Teen', 'teen_13_15',
    '{"content_rating_max": "t", "multiplayer_allowed": true, "voice_chat_allowed": true, "purchases_allowed": false}',
    '{"default_daily_limit": 120, "bedtime_enforcement": false}',
    TRUE
)
ON CONFLICT (name, age_band) DO NOTHING;

COMMIT;