// Supabase Edge Function: webauthn
// Handles WebAuthn (Passkeys) registration and authentication flows
// Uses @simplewebauthn/server for option generation & verification

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from 'npm:@simplewebauthn/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getOriginAndRpID(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  try {
    const url = new URL(origin);
    const rpID = url.hostname;
    return { origin: `${url.protocol}//${url.host}`, rpID };
  } catch {
    // Fallback to project hostname if origin missing/invalid
    const envUrl = Deno.env.get('SUPABASE_URL') || '';
    try {
      const u = new URL(envUrl);
      return { origin: `${u.protocol}//${u.host}`, rpID: u.hostname };
    } catch {
      return { origin: '', rpID: '' };
    }
  }
}

function b64urlToBuffer(b64url: string): Uint8Array {
  const padding = '='.repeat((4 - (b64url.length % 4)) % 4);
  const base64 = (b64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufferToB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders } });
  }

  const { origin, rpID } = getOriginAndRpID(req);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    },
  );

  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await req.json();
    const action = body?.action as
      | 'start_registration'
      | 'finish_registration'
      | 'start_authentication'
      | 'finish_authentication';

    // Helper to fetch user profile for displayName fallback
    const displayName = user.user_metadata?.full_name || user.email || 'User';

    if (action === 'start_registration') {
      const friendlyName: string | undefined = body?.friendlyName;
      // Fetch existing credentials to exclude
      const { data: existingCreds } = await supabase
        .from('webauthn_credentials')
        .select('credential_id')
        .eq('user_id', user.id);

      const excludeCredentials = (existingCreds || []).map((c) => ({
        id: c.credential_id,
        type: 'public-key' as const,
      }));

      const options = await generateRegistrationOptions({
        rpName: 'Game Guardian AI',
        rpID,
        userID: user.id,
        userName: user.email ?? user.id,
        userDisplayName: displayName,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
        },
        excludeCredentials,
      });

      // Persist challenge for verification later (10 min expiry)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from('webauthn_challenges').insert({
        user_id: user.id,
        type: 'registration',
        challenge: options.challenge,
        expires_at: expiresAt,
      });

      return new Response(JSON.stringify({ options }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'finish_registration') {
      const { attResp, friendlyName } = body as {
        attResp: any;
        friendlyName?: string;
      };

      // Get latest valid challenge
      const { data: ch } = await supabase
        .from('webauthn_challenges')
        .select('id, challenge, expires_at')
        .eq('user_id', user.id)
        .eq('type', 'registration')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!ch || new Date(ch.expires_at).getTime() < Date.now()) {
        return new Response(JSON.stringify({ error: 'Challenge expired' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const verification = await verifyRegistrationResponse({
        response: attResp,
        expectedChallenge: ch.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return new Response(JSON.stringify({ error: 'Verification failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const {
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp,
        attestationObject,
      } = verification.registrationInfo;

      const credential_id = bufferToB64url(credentialID);
      const public_key = bufferToB64url(credentialPublicKey);

      // Store credential
      const { error: insertErr } = await supabase.from('webauthn_credentials').insert({
        user_id: user.id,
        credential_id,
        public_key,
        counter,
        device_name: friendlyName || credentialDeviceType || 'Passkey',
        backed_up: credentialBackedUp,
        attestation_fmt: attestationObject ? 'none' : 'none',
      });

      if (insertErr) {
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ verified: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'start_authentication') {
      // Load user's registered credentials
      const { data: creds } = await supabase
        .from('webauthn_credentials')
        .select('credential_id')
        .eq('user_id', user.id);

      if (!creds || creds.length === 0) {
        return new Response(JSON.stringify({ error: 'No passkeys found' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const allowCredentials = creds.map((c) => ({ id: c.credential_id, type: 'public-key' as const }));

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials,
        userVerification: 'preferred',
      });

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from('webauthn_challenges').insert({
        user_id: user.id,
        type: 'authentication',
        challenge: options.challenge,
        expires_at: expiresAt,
      });

      return new Response(JSON.stringify({ options }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'finish_authentication') {
      const { authResp } = body as { authResp: any };

      // Get latest valid challenge
      const { data: ch } = await supabase
        .from('webauthn_challenges')
        .select('id, challenge, expires_at')
        .eq('user_id', user.id)
        .eq('type', 'authentication')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!ch || new Date(ch.expires_at).getTime() < Date.now()) {
        return new Response(JSON.stringify({ error: 'Challenge expired' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Load credential by id
      const credIdB64 = authResp.id as string;
      const { data: cred } = await supabase
        .from('webauthn_credentials')
        .select('id, user_id, public_key, counter, credential_id')
        .eq('user_id', user.id)
        .eq('credential_id', credIdB64)
        .maybeSingle();

      if (!cred) {
        return new Response(JSON.stringify({ error: 'Credential not found' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const verification = await verifyAuthenticationResponse({
        response: authResp,
        expectedChallenge: ch.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: b64urlToBuffer(cred.credential_id),
          credentialPublicKey: b64urlToBuffer(cred.public_key),
          counter: cred.counter,
        },
      });

      if (!verification.verified || !verification.authenticationInfo) {
        return new Response(JSON.stringify({ error: 'Verification failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const { newCounter } = verification.authenticationInfo;

      await supabase
        .from('webauthn_credentials')
        .update({ counter: newCounter })
        .eq('id', cred.id);

      return new Response(JSON.stringify({ verified: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    console.error('webauthn error', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});