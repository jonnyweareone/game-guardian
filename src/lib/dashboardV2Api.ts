
import { supabase } from '@/integrations/supabase/client';

// Notification Channels - Real implementation using RPC functions
export interface NotificationChannel {
  id: string;
  user_id: string;
  kind: 'SMS' | 'EMAIL';
  destination: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNotificationChannels(): Promise<NotificationChannel[]> {
  const { data, error } = await supabase.rpc('rpc_get_notification_channels');
  
  if (error) {
    console.error('Failed to fetch notification channels:', error);
    throw error;
  }
  
  return data || [];
}

export async function addNotificationChannel(kind: 'SMS' | 'EMAIL', destination: string) {
  const { data, error } = await supabase.rpc('rpc_add_notification_channel', {
    _kind: kind,
    _destination: destination
  });
  
  if (error) {
    console.error('Failed to add notification channel:', error);
    throw error;
  }
  
  return data;
}

// Notification Preferences - Real implementation using RPC functions
export interface NotificationPreference {
  id: string;
  user_id: string;
  scope: 'GLOBAL' | 'CHILD';
  child_id?: string;
  alert_type: 'BULLYING' | 'GROOMING' | 'PROFANITY' | 'LOGIN' | 'SYSTEM';
  min_severity: number;
  channel_ids: string[];
  digest: 'NONE' | 'HOURLY' | 'DAILY';
  quiet_hours?: any;
  created_at: string;
  updated_at: string;
}

export async function getNotificationPreferences(scope?: 'GLOBAL' | 'CHILD', childId?: string): Promise<NotificationPreference[]> {
  const { data, error } = await supabase.rpc('rpc_get_notification_preferences', {
    _scope: scope || null,
    _child_id: childId || null
  });
  
  if (error) {
    console.error('Failed to fetch notification preferences:', error);
    throw error;
  }
  
  return data || [];
}

export async function upsertNotificationPreference(preference: Partial<NotificationPreference>) {
  const { data, error } = await supabase.rpc('rpc_upsert_notification_preference', {
    _scope: preference.scope!,
    _child_id: preference.child_id || null,
    _alert_type: preference.alert_type!,
    _min_severity: preference.min_severity!,
    _channel_ids: preference.channel_ids || [],
    _digest: preference.digest!,
    _quiet_hours: preference.quiet_hours || null
  });
  
  if (error) {
    console.error('Failed to upsert notification preference:', error);
    throw error;
  }
  
  return data;
}

// Policy Effective States - Real implementation using RPC functions
export interface PolicyEffective {
  id: string;
  user_id: string;
  scope: 'GLOBAL' | 'CHILD' | 'DEVICE';
  subject_id?: string;
  policy_data: any;
  created_at: string;
  updated_at: string;
}

export async function getPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', subjectId?: string): Promise<PolicyEffective | null> {
  const { data, error } = await supabase.rpc('rpc_get_policy_effective', {
    _scope: scope,
    _subject_id: subjectId || null
  });
  
  if (error) {
    console.error('Failed to fetch policy effective:', error);
    throw error;
  }
  
  return data;
}

export async function setPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', policyData: any, subjectId?: string) {
  const { data, error } = await supabase.rpc('rpc_set_policy_effective', {
    _scope: scope,
    _policy_data: policyData,
    _subject_id: subjectId || null
  });
  
  if (error) {
    console.error('Failed to set policy effective:', error);
    throw error;
  }
  
  return data;
}

// Enhanced child data with avatars - using existing children table
export async function getChildrenWithAvatars() {
  const { data, error } = await supabase
    .from('children')
    .select('id, name, age, avatar_url, parent_id, created_at')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// App catalog with icons - using existing app_catalog table
export async function getAppCatalogWithIcons() {
  const { data, error } = await supabase
    .from('app_catalog')
    .select('id, name, category, icon_url, description')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}
