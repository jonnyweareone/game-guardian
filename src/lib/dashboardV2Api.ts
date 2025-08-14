
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
  const { data, error } = await supabase
    .from('notification_channels')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addNotificationChannel(kind: 'SMS' | 'EMAIL', destination: string) {
  const { data, error } = await supabase
    .from('notification_channels')
    .insert({ kind, destination })
    .select()
    .single();
  
  if (error) throw error;
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
  let query = supabase.from('notification_preferences').select('*');
  
  if (scope) {
    query = query.eq('scope', scope);
  }
  
  if (childId) {
    query = query.eq('child_id', childId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function upsertNotificationPreference(preference: Partial<NotificationPreference>) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(preference)
    .select()
    .single();
  
  if (error) throw error;
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
  let query = supabase
    .from('policy_effective')
    .select('*')
    .eq('scope', scope);
  
  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  } else {
    query = query.is('subject_id', null);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function setPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', policyData: any, subjectId?: string) {
  const { data, error } = await supabase
    .from('policy_effective')
    .upsert({
      scope,
      subject_id: subjectId,
      policy_data: policyData
    })
    .select()
    .single();
  
  if (error) throw error;
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
