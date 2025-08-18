
import { supabase } from '@/integrations/supabase/client';
import type { PairingToken, MobilePlatform } from '@/types/pairing';

export interface MobileDeviceStatus {
  id: string;
  kind: 'mobile';
  platform: 'ios' | 'android';
  mdm_enrolled: boolean;
  vpn_active: boolean;
  last_seen?: string;
  battery?: number;
  status: string;
  is_active: boolean;
  activation_status: 'pending' | 'enrolled' | 'supervised';
}

const isMobilePlatform = (p: unknown): p is MobilePlatform =>
  p === 'ios' || p === 'android';

export const generatePairingToken = async (childId: string, platform: MobilePlatform): Promise<string> => {
  const token = Math.random().toString(36).substr(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  const { error } = await supabase
    .from('device_pair_tokens')
    .insert({
      child_id: childId,
      token,
      kind: 'mobile',
      platform,
      expires_at: expiresAt
    });

  if (error) throw error;
  return token;
};

export const getPairingTokens = async (): Promise<PairingToken[]> => {
  const { data, error } = await supabase
    .from('device_pair_tokens')
    .select('*')
    .eq('kind', 'mobile')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Defensive mapping with strict narrowing
  const tokens: PairingToken[] = (data || []).flatMap((t) => {
    // Hard narrow the kind field
    if (t.kind !== 'mobile') return [];
    
    // Validate platform is mobile-compatible
    if (!isMobilePlatform(t.platform)) return [];
    
    // Ensure required fields exist
    if (!t.token || !t.expires_at || !t.created_at) return [];

    return [{
      id: t.id,
      child_id: t.child_id,
      token: t.token,
      kind: 'mobile' as const,        // literal type
      platform: t.platform,           // now 'ios' | 'android'
      expires_at: t.expires_at,
      used_at: t.used_at || undefined,
      created_at: t.created_at,
    }];
  });

  return tokens;
};

export const getMobileDeviceStatus = async (deviceId: string): Promise<MobileDeviceStatus> => {
  const response = await supabase.functions.invoke('mobile-activation-status', {
    body: { device_id: deviceId }
  });

  if (response.error) throw response.error;
  return response.data;
};

export const revokePairingToken = async (tokenId: string): Promise<void> => {
  const { error } = await supabase
    .from('device_pair_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId);

  if (error) throw error;
};

export const getMobileDevices = async () => {
  const { data, error } = await supabase
    .from('devices')
    .select(`
      *,
      children (
        id,
        name
      )
    `)
    .eq('kind', 'mobile')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
