import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SEOHead from '@/components/SEOHead';
import { usePasskeys } from '@/hooks/usePasskeys';

const Security = () => {
  const { user } = useAuth();
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      const { data, error } = await (supabase as any)
        .from('user_security')
        .select('totp_enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error) setTotpEnabled(Boolean(data?.totp_enabled));
    };
    fetchStatus();
  }, [user]);

  // Passkeys (WebAuthn)
  const { registerPasskey, authenticatePasskey, listPasskeys } = usePasskeys();
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [pkLoading, setPkLoading] = useState(false);
  const [pkError, setPkError] = useState<string | null>(null);
  const [pkName, setPkName] = useState('');

  const loadPasskeys = async () => {
    if (!user) return;
    try {
      const data = await listPasskeys();
      setPasskeys(data);
    } catch (e) {
      // noop
    }
  };

  useEffect(() => {
    loadPasskeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke('auth-2fa', {
        body: { action: 'totp_setup' }
      });
      if (error) throw error;
      setOtpauthUrl(data.otpauth_url);
      setQrUrl(data.qr_url);
    } catch (e: any) {
      setError(e?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke('auth-2fa', {
        body: { action: 'totp_verify', code }
      });
      if (error) throw error;
      setTotpEnabled(true);
      setRecoveryCodes(data.recovery_codes || []);
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke('auth-2fa', {
        body: { action: 'recovery_rotate' }
      });
      if (error) throw error;
      setRecoveryCodes(data.recovery_codes || []);
    } catch (e: any) {
      setError(e?.message || 'Could not rotate codes');
    } finally {
      setLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: 'Account Security - Game Guardian AI',
    description: 'Enable two-factor authentication (2FA) with TOTP and manage recovery codes.',
    url: 'https://gameguardianai.com/security'
  };

  return (
    <>
      <SEOHead
        title="Account Security (2FA) - Game Guardian AI™"
        description="Enable 2FA with TOTP and manage recovery codes to secure your Game Guardian AI account."
        canonicalUrl="https://gameguardianai.com/security"
        keywords="2FA, TOTP, account security, recovery codes, Game Guardian AI"
        structuredData={structuredData}
      />
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <section className="w-full max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Protect your account with two‑factor authentication</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!totpEnabled ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enable TOTP using an authenticator app (e.g., Google Authenticator, Authy).
                    </p>
                    {otpauthUrl ? (
                      <div className="space-y-4">
                        {qrUrl && (
                          <img src={qrUrl} alt="TOTP QR code for Game Guardian AI" className="mx-auto rounded" />
                        )}
                        <p className="text-xs break-all text-muted-foreground">{otpauthUrl}</p>
                        <form onSubmit={handleVerify} className="space-y-3">
                          <Label htmlFor="totp">Enter 6‑digit code</Label>
                          <Input id="totp" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
                          <Button type="submit" disabled={loading}>Verify & Enable</Button>
                        </form>
                      </div>
                    ) : (
                      <Button onClick={handleSetup} disabled={loading}>Generate Setup</Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">TOTP is enabled for your account.</p>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={handleRotate} disabled={loading}>Regenerate Recovery Codes</Button>
                    {recoveryCodes && (
                      <ul className="grid grid-cols-2 gap-2 text-sm font-mono p-3 rounded border">
                        {recoveryCodes.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Passkeys (WebAuthn)</CardTitle>
              <CardDescription>Register a device-based passkey and verify it on this device.</CardDescription>
            </CardHeader>
            <CardContent>
              {pkError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{pkError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pkname">Device name (optional)</Label>
                  <Input id="pkname" value={pkName} onChange={(e) => setPkName(e.target.value)} placeholder="e.g., iPhone, YubiKey" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={async () => { setPkLoading(true); setPkError(null); try { await registerPasskey(pkName || undefined); await loadPasskeys(); } catch (e:any) { setPkError(e?.message || 'Passkey setup failed'); } finally { setPkLoading(false); } }} disabled={pkLoading}>
                    Register new Passkey
                  </Button>
                  <Button variant="outline" onClick={async () => { setPkLoading(true); setPkError(null); try { await authenticatePasskey(); } catch (e:any) { setPkError(e?.message || 'Passkey authentication failed'); } finally { setPkLoading(false); } }} disabled={pkLoading || passkeys.length===0}>
                    Test Passkey
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your registered passkeys:</p>
                  {passkeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No passkeys yet.</p>
                  ) : (
                    <ul className="divide-y rounded border">
                      {passkeys.map((p:any) => (
                        <li key={p.id} className="flex items-center justify-between p-3 text-sm">
                          <span className="text-foreground">{p.device_type || 'passkey'} • {new Date(p.created_at).toLocaleString()}</span>
                          <span className="text-muted-foreground">{p.backed_up ? 'Backed up' : 'Not backed up'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Security;
