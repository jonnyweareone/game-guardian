import { supabase } from '@/integrations/supabase/client';

export function subscribePendingLocalInstalls(onChange: () => void, deviceId?: string) {
  const filter = deviceId ? `installed_by=eq.local,device_id=eq.${deviceId}` : 'installed_by=eq.local';
  const sub = supabase.channel('app-approvals')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'device_app_inventory', filter }, onChange)
    .subscribe();
  return () => sub.unsubscribe();
}

export function subscribeDeviceAppUpdates(onChange: () => void, deviceId?: string) {
  if (!deviceId) return () => {};
  
  const channel = supabase.channel(`device-apps-${deviceId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'device_app_inventory',
      filter: `device_id=eq.${deviceId}` 
    }, onChange)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'device_app_policy',
      filter: `device_id=eq.${deviceId}` 
    }, onChange)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'device_app_events',
      filter: `device_id=eq.${deviceId}` 
    }, onChange)
    .subscribe();
    
  return () => channel.unsubscribe();
}