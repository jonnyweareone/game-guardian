
// Minimal API stubs wired to Supabase
import { supabase } from '@/integrations/supabase/client';

export async function getChildren() {
  const { data, error } = await supabase.from('children').select('*');
  if (error) throw error;
  return data;
}

export async function getDeviceStatus(deviceCode: string) {
  const { data, error } = await supabase.from('devices').select('*').eq('device_code', deviceCode).maybeSingle();
  if (error) throw error;
  return data;
}

export async function postDeviceCommand(deviceCode: string, cmd: Record<string, unknown>) {
  // Placeholder for future function call
  return { ok: true, deviceCode, cmd };
}

// New: List apps reported by a device
export async function listDeviceApps(deviceCode: string) {
  const { data, error } = await supabase
    .from('device_apps')
    .select('*')
    .eq('device_code', deviceCode)
    .order('name');
  if (error) throw error;
  return data;
}

// New: Upsert an app policy (device- or child-scoped)
export async function upsertPolicy(input: {
  subject_type: 'device' | 'child',
  subject_id: string,
  app_id: string,
  allowed: boolean,
  daily_limit_minutes?: number | null,
  enforced_hours?: string[] | null
}) {
  const { data, error } = await supabase
    .from('app_policies')
    .upsert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// New: List policies for a given subject
export async function listPolicies(subject_type: 'device' | 'child', subject_id: string) {
  const { data, error } = await supabase
    .from('app_policies')
    .select('*')
    .eq('subject_type', subject_type)
    .eq('subject_id', subject_id);
  if (error) throw error;
  return data;
}

// Child Controls helpers

// Effective apps list per child (from view)
export async function listChildApps(childId: string) {
  const { data, error } = await supabase
    .from('v_effective_app_policy')
    .select('*')
    .eq('child_id', childId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

// Child time policy: get current settings
export async function getChildTimePolicy(childId: string) {
  const { data, error } = await supabase
    .from('child_time_policies')
    .select('*')
    .eq('child_id', childId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Child time policy: upsert settings
export async function upsertChildTimePolicy(
  childId: string,
  input: { daily_total_minutes?: number | null; bedtime?: string | null }
) {
  const payload: { child_id: string; daily_total_minutes?: number | null; bedtime?: string | null } = {
    child_id: childId,
    daily_total_minutes: input.daily_total_minutes ?? null,
    bedtime: input.bedtime ?? null,
  };

  const { data, error } = await supabase
    .from('child_time_policies')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

