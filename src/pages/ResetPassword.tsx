import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    // If the user followed a recovery link, Supabase will set a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCanReset(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Your password has been updated. You can now sign in.');
    }
    setLoading(false);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Reset Password - Game Guardian AI",
    description: "Reset your Game Guardian AI account password securely.",
    url: "https://gameguardianai.com/reset",
  };

  return (
    <>
      <SEOHead
        title="Reset Password - Game Guardian AI™"
        description="Reset your Game Guardian AI account password securely."
        keywords="reset password, account recovery, Game Guardian AI"
        canonicalUrl="https://gameguardianai.com/reset"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>Enter a new password below to complete the reset.</CardDescription>
            </CardHeader>
            <CardContent>
              {!canReset && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Invalid or expired recovery link. Please go back to the sign-in page and request a new reset email.
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={!canReset || loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
