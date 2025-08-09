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
