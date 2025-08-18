
import { supabase } from '@/integrations/supabase/client';

export interface PairingToken {
  id: string;
  child_id: string;
  token: string;
  kind: 'mobile';
  platform: 'ios' | 'android';
  expires_at: string;
  used_at?: string;
  created_at: string;
}

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

export const generatePairingToken = async (childId: string, platform: 'ios' | 'android'): Promise<string> => {
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
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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
