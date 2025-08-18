
export type MobilePlatform = 'ios' | 'android';

export interface PairingToken {
  id: string;
  child_id: string;
  token: string;
  kind: 'mobile';                 // literal (not the DB union)
  platform: MobilePlatform;       // narrowed & validated
  expires_at: string;
  used_at?: string;
  created_at: string;
}
