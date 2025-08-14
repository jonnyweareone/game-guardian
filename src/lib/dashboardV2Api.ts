import { supabase } from '@/integrations/supabase/client';

// Notification Channels - Mock implementation using existing data
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
  // Mock implementation - return empty array for now
  // TODO: Replace with actual RPC call once migration is deployed
  return [];
}

export async function addNotificationChannel(kind: 'SMS' | 'EMAIL', destination: string) {
  // Mock implementation - return success for now
  // TODO: Replace with actual RPC call once migration is deployed
  console.log('Mock: Adding notification channel', { kind, destination });
  return { success: true };
}

// Notification Preferences - Mock implementation
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
  // Mock implementation - return empty array for now
  // TODO: Replace with actual RPC call once migration is deployed
  return [];
}

export async function upsertNotificationPreference(preference: Partial<NotificationPreference>) {
  // Mock implementation - return success for now
  // TODO: Replace with actual RPC call once migration is deployed
  console.log('Mock: Upserting notification preference', preference);
  return { success: true };
}

// Policy Effective States - Mock implementation
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
  // Mock implementation - return null for now
  // TODO: Replace with actual RPC call once migration is deployed
  return null;
}

export async function setPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', policyData: any, subjectId?: string) {
  // Mock implementation - return success for now
  // TODO: Replace with actual RPC call once migration is deployed
  console.log('Mock: Setting policy effective', { scope, policyData, subjectId });
  return { success: true };
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
