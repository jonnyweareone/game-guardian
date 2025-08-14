
import { supabase } from '@/integrations/supabase/client';

// Notification Channels - Now using real database operations
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
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return (data || []) as NotificationChannel[];
}

export async function addNotificationChannel(kind: 'SMS' | 'EMAIL', destination: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notification_channels')
    .insert({
      user_id: user.id,
      kind,
      destination,
      is_verified: false
    })
    .select()
    .single();

  if (error) throw error;
  return data as NotificationChannel;
}

// Notification Preferences - Now using real database operations
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
  let query = supabase
    .from('notification_preferences')
    .select('*');

  if (scope) {
    query = query.eq('scope', scope);
  }

  if (childId) {
    query = query.eq('child_id', childId);
  }

  const { data, error } = await query.order('created_at', { ascending: true });
  
  if (error) throw error;
  return (data || []) as NotificationPreference[];
}

export async function upsertNotificationPreference(preference: Partial<NotificationPreference>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      scope: preference.scope!,
      child_id: preference.child_id,
      alert_type: preference.alert_type!,
      min_severity: preference.min_severity!,
      channel_ids: preference.channel_ids || [],
      digest: preference.digest!,
      quiet_hours: preference.quiet_hours,
    })
    .select()
    .single();

  if (error) throw error;
  return data as NotificationPreference;
}

// Policy Effective States - Now using real database operations
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
  return data as PolicyEffective | null;
}

export async function setPolicyEffective(scope: 'GLOBAL' | 'CHILD' | 'DEVICE', policyData: any, subjectId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('policy_effective')
    .upsert({
      user_id: user.id,
      scope,
      subject_id: subjectId,
      policy_data: policyData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PolicyEffective;
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
