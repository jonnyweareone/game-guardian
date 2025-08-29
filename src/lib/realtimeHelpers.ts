import { supabase } from '@/integrations/supabase/client';

export function subscribePendingLocalInstalls(onChange: () => void, deviceId?: string) {
  const filter = deviceId ? `installed_by=eq.local,device_id=eq.${deviceId}` : 'installed_by=eq.local';
  const sub = supabase.channel('app-approvals')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'device_app_inventory', filter }, onChange)
    .subscribe();
  return () => sub.unsubscribe();
}