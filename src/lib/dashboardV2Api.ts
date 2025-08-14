
import { supabase } from '@/integrations/supabase/client';

// Notification Channels
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
  // Use raw SQL query since the table might not be in types yet
  const { data, error } = await supabase.rpc('get_notification_channels');
  
  if (error) {
    console.error('Error fetching notification channels:', error);
    return [];
  }
  return data || [];
}

export async function addNotificationChannel(kind: 'SMS' | 'EMAIL', destination: string) {
  // Use raw SQL query since the table might not be in types yet
  const { data, error } = await supabase.rpc('add_notification_channel', {
    channel_kind: kind,
    channel_destination: destination
  });
  
  if (error) {
    console.error('Error adding notification channel:', error);
    throw error;
  }
  return data;
}

// Notification Preferences
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
  // Use raw SQL query since the table might not be in types yet
  const { data, error } = await supabase.rpc('get_notification_preferences', {
    filter_scope: scope,
    filter_child_id: childId
  });
  
  if (error) {
    console.error('Error fetching notification preferences:', error);
    return [];
  }
  return data || [];
}

export async function upsertNotificationPreference(preference: Partial<NotificationPreference>) {
  // Use raw SQL query since the table might not be in types yet
  const { data, error } = await supabase.rpc('upsert_notification_preference', {
    pref_scope: preference.scope,
    pref_child_id: preference.child_id,
    pref_alert_type: preference.alert_type,
    pref_min_severity: preference.min_severity || 2,
    pref_channel_ids: preference.channel_ids || [],
    pref_digest: preference.digest || 'NONE'
  });
  
  if (error) {
    console.error('Error upserting notification preference:', error);
    throw error;
  }
  return data;
}

// Policy Effective States
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
  // Use raw SQL query since the table might not be in types yet
  const { data, error } = await supabase.rpc('get_policy_effective', {
    policy_scope: scope,
    policy_subject_id: subjectId
  });
  
  if (error) {
    console.error('Error fetching policy effective:', error);
    return null;
  }
  return data;
}

export async function setPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', policyData: any, subjectId?: string) {
  // Use raw SQL query since the table might not be in types yet
  const { data, error } = await supabase.rpc('set_policy_effective', {
    policy_scope: scope,
    policy_subject_id: subjectId,
    policy_data: policyData
  });
  
  if (error) {
    console.error('Error setting policy effective:', error);
    throw error;
  }
  return data;
}

// Enhanced child data with avatars
export async function getChildrenWithAvatars() {
  const { data, error } = await supabase
    .from('children')
    .select('id, name, age, avatar_url, parent_id, created_at')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// App catalog with icons
export async function getAppCatalogWithIcons() {
  const { data, error } = await supabase
    .from('app_catalog')
    .select('id, name, category, icon_url, description')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}
