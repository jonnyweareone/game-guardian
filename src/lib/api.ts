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
