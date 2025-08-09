import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Base64URL helpers
const toBase64URL = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64URL = (b64url: string): Uint8Array => {
  const padding = '='.repeat((4 - (b64url.length % 4)) % 4);
  const base64 = (b64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

function registrationOptionsToPublicKey(options: any): PublicKeyCredentialCreationOptions {
  return {
    ...options,
    challenge: fromBase64URL(options.challenge),
    user: {
      ...options.user,
      // Encode user id string for WebAuthn API
      id: new TextEncoder().encode(options.user.id),
    },
    excludeCredentials: (options.excludeCredentials || []).map((cred: any) => ({
      ...cred,
      id: fromBase64URL(cred.id),
    })),
  } as PublicKeyCredentialCreationOptions;
}

function authenticationOptionsToPublicKey(options: any): PublicKeyCredentialRequestOptions {
  return {
    ...options,
    challenge: fromBase64URL(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((cred: any) => ({
      ...cred,
      id: fromBase64URL(cred.id),
    })),
  } as PublicKeyCredentialRequestOptions;
}

function serializeAttestation(cred: any) {
  const att = cred as PublicKeyCredential;
  const response = att.response as AuthenticatorAttestationResponse;
  return {
    id: att.id,
    rawId: toBase64URL(att.rawId),
    type: att.type,
    response: {
      attestationObject: toBase64URL(response.attestationObject),
      clientDataJSON: toBase64URL(response.clientDataJSON),
    },
    clientExtensionResults: (att as any).getClientExtensionResults?.() ?? {},
  };
}

function serializeAssertion(cred: any) {
  const assertion = cred as PublicKeyCredential;
  const response = assertion.response as AuthenticatorAssertionResponse;
  return {
    id: assertion.id,
    rawId: toBase64URL(assertion.rawId),
    type: assertion.type,
    response: {
      authenticatorData: toBase64URL(response.authenticatorData),
      clientDataJSON: toBase64URL(response.clientDataJSON),
      signature: toBase64URL(response.signature),
      userHandle: response.userHandle ? toBase64URL(response.userHandle) : null,
    },
    clientExtensionResults: (assertion as any).getClientExtensionResults?.() ?? {},
  };
}

export const usePasskeys = () => {
  const { toast } = useToast();

  const registerPasskey = async (friendlyName?: string) => {
    // Start registration
    const { data: startData, error: startErr } = await supabase.functions.invoke('webauthn', {
      body: { action: 'start_registration', friendlyName },
    });
    if (startErr) throw startErr;

    const publicKey = registrationOptionsToPublicKey(startData.options);

    // Create credential with browser API
    const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
    if (!credential) throw new Error('Credential creation was cancelled');

    const attResp = serializeAttestation(credential);

    const { data: finishData, error: finishErr } = await supabase.functions.invoke('webauthn', {
      body: { action: 'finish_registration', attResp, friendlyName },
    });
    if (finishErr) throw finishErr;

    toast({ title: 'Passkey registered', description: 'Your device can now be used as a passkey.' });
    return finishData;
  };

  const authenticatePasskey = async () => {
    const { data: startData, error: startErr } = await supabase.functions.invoke('webauthn', {
      body: { action: 'start_authentication' },
    });
    if (startErr) throw startErr;

    const publicKey = authenticationOptionsToPublicKey(startData.options);
    const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
    if (!assertion) throw new Error('Authentication was cancelled');

    const authResp = serializeAssertion(assertion);

    const { data: finishData, error: finishErr } = await supabase.functions.invoke('webauthn', {
      body: { action: 'finish_authentication', authResp },
    });
    if (finishErr) throw finishErr;

    toast({ title: 'Passkey verified', description: 'Authentication completed successfully.' });
    return finishData;
  };

  const listPasskeys = async () => {
    const { data, error } = await (supabase as any)
      .from('webauthn_credentials')
      .select('id, device_type, backed_up, counter, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Array<{ id: string; device_type: string | null; backed_up: boolean; counter: number; created_at: string }>;
  };

  return { registerPasskey, authenticatePasskey, listPasskeys };
};
