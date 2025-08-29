// Days + schedule JSON the launcher expects
export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type ScheduleJSON = Partial<Record<DayKey, string[]>>;

// Catalog row (subset you use)
export interface AppCatalogItem {
  app_id: string;             // canonical id e.g. com.mojang.Minecraft
  name: string;
  method: 'flatpak' | 'apt' | 'snap' | 'web';
  source?: string | null;     // often same as method
  category?: string | null;   // if you store it
  icon_url?: string | null;
  tags?: string[] | null;
  enabled?: boolean | null;
  verified?: boolean | null;
  description?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  pegi_rating?: number | null;
}

// What scanner posts
export interface DeviceAppInventory {
  device_id: string;
  app_id: string;
  name: string | null;
  version: string | null;
  source: 'flatpak' | 'apt' | 'snap' | 'web';
  installed_by: 'web' | 'local';
  seen_at: string; // ISO
}

// Policy row the parent edits
export interface DeviceAppPolicy {
  device_id: string;
  app_id: string;
  approved: boolean;
  hidden: boolean;
  schedule: ScheduleJSON | null;
  blocked_reason: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Usage/attempt events
export type DeviceAppEventType = 'launch_allowed' | 'launch_blocked' | 'installed' | 'uninstalled';
export interface DeviceAppEvent {
  device_id: string;
  app_id: string;
  ts: string;
  event: DeviceAppEventType;
  meta: Record<string, unknown> | null;
}