
import { supabase } from '@/integrations/supabase/client';

// Minimal API stubs wired to Supabase
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

// Child time policy patch type (includes future fields, but we'll only send known columns to match current types)
type ChildTimePolicyPatch = Partial<{
  daily_total_minutes: number | null;
  bedtime: string | null; // legacy support
  bedtime_weekday: string | null; // '[21,7)' (future)
  bedtime_weekend: string | null; // '[22,8)' (future)
  focus_mode: boolean; // (future)
  focus_allowed_categories: string[]; // (future)
  homework_window: string | null; // (future) '[16,19)'
}>;

// Child time policy: upsert settings (send only columns known to current Database types)
export async function upsertChildTimePolicy(childId: string, patch: ChildTimePolicyPatch) {
  const payload: {
    child_id: string;
    daily_total_minutes?: number | null;
    bedtime?: unknown | null;
  } = { child_id: childId };

  if (patch.daily_total_minutes !== undefined) {
    payload.daily_total_minutes = patch.daily_total_minutes;
  }
  if (patch.bedtime !== undefined) {
    payload.bedtime = patch.bedtime as unknown as string | null;
  }

  const { data, error } = await supabase
    .from('child_time_policies')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Category-level policy upsert
export async function upsertAppCategoryPolicy(input: {
  subject_type: 'device' | 'child';
  subject_id: string;
  category: 'Game' | 'App' | 'Social' | 'Education' | 'Streaming' | 'Messaging' | 'Browser' | 'Other';
  allowed?: boolean;
  daily_limit_minutes?: number | null;
  enforced_hours?: string[] | null; // int4range[] represented as text[]
}) {
  // app_category_policies might not be present in generated types yet; cast to any to avoid TS errors
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('app_category_policies')
    .upsert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Time tokens (earn/spend)
export async function addTimeTokens(childId: string, delta: number, reason?: string) {
  // child_time_tokens might not be present in generated types yet; cast to any
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('child_time_tokens')
    .insert({ child_id: childId, delta_minutes: delta, reason })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Device-child assignment helpers
export async function assignChildToDevice(deviceId: string, childId: string, isActive = false) {
  const { data, error } = await supabase
    .from('device_child_assignments')
    .upsert(
      { device_id: deviceId, child_id: childId, is_active: isActive },
      { onConflict: 'device_id,child_id' }
    )
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function setActiveChild(deviceId: string, childId: string) {
  // rpc_set_active_child might not be present in generated types yet; cast to any
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .rpc('rpc_set_active_child', { _device: deviceId, _child: childId });
  if (error) throw error;
  return data;
}

// Device command queue
export async function issueCommand(deviceId: string, cmd: string, payload?: any) {
  // rpc_issue_command might not be present in generated types yet; cast to any
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .rpc('rpc_issue_command', { _device: deviceId, _cmd: cmd, _payload: payload ?? {} });
  if (error) throw error;
  return data;
}

// List category policies for a subject
export async function listAppCategoryPolicies(subject_type: 'device' | 'child', subject_id: string) {
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('app_category_policies')
    .select('*')
    .eq('subject_type', subject_type)
    .eq('subject_id', subject_id);
  if (error) throw error;
  return data as Array<{ category: string; allowed: boolean; daily_limit_minutes: number | null; enforced_hours: string[] | null }>;
}

// Get current activity for a child (open session)
export async function getCurrentActivity(childId: string) {
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('app_activity')
    .select('app_id, session_start, device_id')
    .eq('child_id', childId)
    .is('session_end', null)
    .order('session_start', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as { app_id: string; session_start: string; device_id: string } | null;
}
