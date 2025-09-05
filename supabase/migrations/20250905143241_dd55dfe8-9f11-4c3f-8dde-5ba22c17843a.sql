-- Seed demo data for live demonstration
INSERT INTO demo.devices (device_id, child, status, last_heartbeat, inserted_at) VALUES
('GG-DEMO-001', 'Emma Thompson', 'online', now() - interval '2 minutes', now() - interval '3 days'),
('GG-DEMO-002', 'Jake Miller', 'online', now() - interval '5 minutes', now() - interval '2 days'),
('GG-DEMO-003', 'Sofia Rodriguez', 'sleeping', now() - interval '8 hours', now() - interval '1 day'),
('GG-DEMO-004', 'Liam Chen', 'registered', null, now() - interval '6 hours'),
('GG-DEMO-005', 'Maya Patel', 'online', now() - interval '1 minute', now() - interval '30 minutes')
ON CONFLICT (device_id) DO UPDATE SET
  child = EXCLUDED.child,
  status = EXCLUDED.status,
  last_heartbeat = EXCLUDED.last_heartbeat;

-- Seed demo events for the last 24 hours
INSERT INTO demo.events (device_id, type, payload, created_at) VALUES
-- Recent heartbeats
('GG-DEMO-001', 'heartbeat', '{"os_version": "GuardianOS v2.1", "uptime": 86400, "battery": 85}', now() - interval '2 minutes'),
('GG-DEMO-002', 'heartbeat', '{"os_version": "GuardianOS v2.1", "uptime": 172800, "battery": 92}', now() - interval '5 minutes'),
('GG-DEMO-005', 'heartbeat', '{"os_version": "GuardianOS v2.1", "uptime": 3600, "battery": 68}', now() - interval '1 minute'),

-- Security alerts (reflex events)
('GG-DEMO-001', 'reflex', '{"kind": "inappropriate_content", "severity": "medium", "platform": "youtube", "details": "Blocked mature content"}', now() - interval '45 minutes'),
('GG-DEMO-002', 'reflex', '{"kind": "cyberbullying", "severity": "high", "platform": "discord", "details": "Detected harmful language patterns"}', now() - interval '2 hours'),
('GG-DEMO-001', 'reflex', '{"kind": "stranger_contact", "severity": "high", "platform": "snapchat", "details": "Unknown contact attempt blocked"}', now() - interval '4 hours'),

-- App restrictions
('GG-DEMO-001', 'app', '{"action": "blocked", "app_name": "TikTok", "reason": "time_limit_exceeded", "daily_usage": 120}', now() - interval '1 hour'),
('GG-DEMO-002', 'app', '{"action": "blocked", "app_name": "Roblox", "reason": "bedtime_policy", "attempted_at": "22:30"}', now() - interval '3 hours'),
('GG-DEMO-005', 'app', '{"action": "allowed", "app_name": "Khan Academy", "category": "educational", "duration": 45}', now() - interval '30 minutes'),

-- DNS blocks
('GG-DEMO-001', 'dns', '{"action": "blocked", "domain": "adult-content-site.com", "category": "adult_content", "attempts": 3}', now() - interval '2.5 hours'),
('GG-DEMO-002', 'dns', '{"action": "blocked", "domain": "gambling-site.net", "category": "gambling", "attempts": 1}', now() - interval '6 hours'),
('GG-DEMO-003', 'dns', '{"action": "blocked", "domain": "malware-host.ru", "category": "malware", "attempts": 5}', now() - interval '12 hours'),

-- Device lifecycle events
('GG-DEMO-005', 'activation', '{"setup_completed": true, "child_assigned": "Maya Patel", "location": "Home WiFi"}', now() - interval '30 minutes'),
('GG-DEMO-003', 'sleep', '{"reason": "scheduled_bedtime", "time": "21:00", "next_wake": "07:00"}', now() - interval '8 hours'),

-- More historical data for timeline depth
('GG-DEMO-001', 'app', '{"action": "time_warning", "app_name": "Minecraft", "remaining_minutes": 15}', now() - interval '8 hours'),
('GG-DEMO-002', 'reflex', '{"kind": "excessive_gaming", "severity": "low", "platform": "steam", "daily_hours": 4.5}', now() - interval '10 hours'),
('GG-DEMO-001', 'dns', '{"action": "blocked", "domain": "proxy-bypass.org", "category": "circumvention", "attempts": 2}', now() - interval '14 hours'),
('GG-DEMO-004', 'activation', '{"setup_started": true, "child_pending": true, "ip_address": "192.168.1.105"}', now() - interval '6 hours');