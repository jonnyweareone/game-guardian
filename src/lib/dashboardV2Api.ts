
import { supabase } from '@/integrations/supabase/client';

// Notification Channels - Temporary stubs until database migration is applied
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
  // TODO: Implement after database migration is applied
  console.warn('getNotificationChannels is stubbed - database migration needed');
  return [];
}

export async function addNotificationChannel(kind: 'SMS' | 'EMAIL', destination: string) {
  // TODO: Implement after database migration is applied
  console.warn('addNotificationChannel is stubbed - database migration needed');
  return { id: 'stub', user_id: 'stub', kind, destination, is_verified: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

// Notification Preferences - Temporary stubs until database migration is applied
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
  // TODO: Implement after database migration is applied
  console.warn('getNotificationPreferences is stubbed - database migration needed');
  return [];
}

export async function upsertNotificationPreference(preference: Partial<NotificationPreference>) {
  // TODO: Implement after database migration is applied
  console.warn('upsertNotificationPreference is stubbed - database migration needed');
  return {
    id: 'stub',
    user_id: 'stub',
    scope: preference.scope!,
    child_id: preference.child_id,
    alert_type: preference.alert_type!,
    min_severity: preference.min_severity!,
    channel_ids: preference.channel_ids || [],
    digest: preference.digest!,
    quiet_hours: preference.quiet_hours,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Policy Effective States - Temporary stubs until database migration is applied
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
  // TODO: Implement after database migration is applied
  console.warn('getPolicyEffective is stubbed - database migration needed');
  return null;
}

export async function setPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', policyData: any, subjectId?: string) {
  // TODO: Implement after database migration is applied
  console.warn('setPolicyEffective is stubbed - database migration needed');
  return {
    id: 'stub',
    user_id: 'stub',
    scope,
    subject_id: subjectId,
    policy_data: policyData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
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
