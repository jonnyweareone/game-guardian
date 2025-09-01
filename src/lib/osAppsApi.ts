
import { supabase } from '@/integrations/supabase/client';
import type {
  AppCatalogItem, DeviceAppInventory, DeviceAppPolicy,
  ScheduleJSON
} from '@/types/os-apps';

export async function fetchDeviceApps(deviceId: string) {
  const { data, error } = await supabase
    .from('device_app_inventory')
    .select('*')
    .eq('device_id', deviceId)
    .order('name');
  if (error) throw error;
  return (data ?? []) as DeviceAppInventory[];
}

export async function fetchDevicePolicies(deviceId: string) {
  const { data, error } = await supabase
    .from('device_app_policy')
    .select('*')
    .eq('device_id', deviceId);
  if (error) throw error;
  return (data ?? []) as DeviceAppPolicy[];
}

export async function approveApp(deviceId: string, appId: string, reason?: string) {
  const { data, error } = await supabase.rpc('toggle_app_policy', {
    p_device_id: deviceId,
    p_app_id: appId,
    p_enable: true,
    p_reason: reason ?? null
  });
  if (error) throw error;
  return data as DeviceAppPolicy;
}

export async function blockApp(deviceId: string, appId: string, reason?: string) {
  const { data, error } = await supabase.rpc('toggle_app_policy', {
    p_device_id: deviceId,
    p_app_id: appId,
    p_enable: false,
    p_reason: reason ?? null
  });
  if (error) throw error;
  return data as DeviceAppPolicy;
}

export async function setSchedule(deviceId: string, appId: string, schedule: ScheduleJSON) {
  const { data, error } = await supabase.rpc('set_app_schedule', {
    p_device_id: deviceId,
    p_app_id: appId,
    p_schedule: schedule ?? {}
  });
  if (error) throw error;
  return data as DeviceAppPolicy;
}

type QueueInstallPayload = {
  device_id: string;
  type: 'install_app';
  app_id: string;
  payload: { method: string; source?: string | null; name?: string | null; installed_by: 'web' };
};
const JOBS_TABLE = 'device_jobs'; // or 'device_jobs' if your agent expects that

export async function fetchDeviceUsage(deviceId: string, sinceDate?: Date) {
  const since = sinceDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
  
  // First get device_code from deviceId
  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('device_code')
    .eq('id', deviceId)
    .single();
    
  if (deviceError || !device) throw deviceError || new Error('Device not found');
  
  // Query usage view using device_code
  const { data, error } = await supabase
    .from('device_app_usage_view')
    .select('app_id, duration_s, started_at')
    .eq('device_code', device.device_code)
    .gte('started_at', since.toISOString())
    .order('started_at', { ascending: false });
    
  if (error) throw error;
  
  // Aggregate usage by app_id
  const usageMap = new Map<string, { totalSeconds: number; sessionsCount: number }>();
  
  (data || []).forEach(session => {
    const existing = usageMap.get(session.app_id) || { totalSeconds: 0, sessionsCount: 0 };
    existing.totalSeconds += session.duration_s || 0;
    existing.sessionsCount += 1;
    usageMap.set(session.app_id, existing);
  });
  
  return Object.fromEntries(usageMap);
}

export async function queueInstall(deviceId: string, app: AppCatalogItem) {
  const row: QueueInstallPayload = {
    device_id: deviceId,
    type: 'install_app',
    app_id: app.app_id,
    payload: { method: app.method, source: app.source ?? app.method, name: app.name, installed_by: 'web' }
  };
  const { error } = await supabase.from(JOBS_TABLE).insert(row as any);
  if (error) throw error;

  // pre-approve now so it is usable once installed
  await approveApp(deviceId, app.app_id);
}
