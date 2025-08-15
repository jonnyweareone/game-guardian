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
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .rpc('rpc_assign_child_to_device', { _device: deviceId, _child: childId, _is_active: isActive });

  if (error) throw error;
  return data as {
    device_id: string;
    child_id: string;
    is_active: boolean;
    // ... other columns from device_child_assignments if present
  };
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

// App catalog and child app selections
export async function getAppCatalog() {
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('app_catalog')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getChildAppSelections(childId: string) {
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('v_child_app_selections')
    .select('*')
    .eq('child_id', childId)
    .order('app_category', { ascending: true })
    .order('app_name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertChildAppSelection(childId: string, appId: string, selected: boolean) {
  const anyClient = supabase as any;
  const { data, error } = await anyClient
    .from('child_app_selections')
    .upsert({
      child_id: childId,
      app_id: appId,
      selected
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function bulkUpsertChildAppSelections(childId: string, selections: { app_id: string; selected: boolean }[]) {
  const anyClient = supabase as any;
  const records = selections.map(sel => ({
    child_id: childId,
    app_id: sel.app_id,
    selected: sel.selected
  }));
  
  const { data, error } = await anyClient
    .from('child_app_selections')
    .upsert(records)
    .select();
  if (error) throw error;
  return data;
}

// New: App Store specific API functions
export async function getInstalledApps(deviceId: string) {
  const { data, error } = await supabase
    .from('installed_apps')
    .select('*')
    .eq('device_id', deviceId);
  if (error) throw error;
  return data;
}

export async function installApp(deviceId: string, appId: string, platform: string, version: string) {
  const { data, error } = await supabase
    .from('installed_apps')
    .upsert({
      device_id: deviceId,
      app_id: appId,
      platform,
      version,
      installed_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function requestAppInstall(childId: string, appId: string, platform: string) {
  const { data, error } = await supabase
    .from('pending_requests')
    .insert({
      child_id: childId,
      app_id: appId,
      platform,
      status: 'pending'
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingRequests(childId?: string) {
  let query = supabase
    .from('pending_requests')
    .select(`
      *,
      app_catalog!inner(name, icon_url, description),
      children!inner(name)
    `)
    .eq('status', 'pending');
    
  if (childId) {
    query = query.eq('child_id', childId);
  }
  
  const { data, error } = await query.order('requested_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function approveAppRequest(requestId: string) {
  const { data, error } = await supabase
    .from('pending_requests')
    .update({
      status: 'approved',
      processed_at: new Date().toISOString(),
      processed_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function denyAppRequest(requestId: string) {
  const { data, error } = await supabase
    .from('pending_requests')
    .update({
      status: 'denied',
      processed_at: new Date().toISOString(),
      processed_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAppVersions(appId: string, platform?: string) {
  let query = supabase
    .from('app_versions')
    .select('*')
    .eq('app_id', appId);
    
  if (platform) {
    query = query.eq('platform', platform);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
