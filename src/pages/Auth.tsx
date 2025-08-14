// MOBILE APP: Core authentication page - Essential for Flutter mobile app
// Features needed in mobile: Biometric auth, push notification setup, offline demo mode
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePasskeys } from '@/hooks/usePasskeys';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();
  const { authenticatePasskey } = usePasskeys();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const wlIntentParam = params.get('intent');
  const wlProduct = params.get('product') ?? '';
  const wlIntent: 'waitlist' | 'beta' | null = wlIntentParam === 'beta' ? 'beta' : (wlIntentParam === 'waitlist' ? 'waitlist' : null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const payload = {
        email,
        full_name: fullName || null,
        product: wlProduct || 'os',
        intent: wlIntent ?? 'waitlist',
        source: 'auth',
        utm: {}
      };
      const { error } = await supabase.from('waitlist_signups').insert([payload]);
      if (error) throw error;
      toast({ title: 'You’re on the list!', description: 'We’ll notify you as soon as we launch.' });
      // Clear fields
      setEmail('');
      setFullName('');
    } catch (err: any) {
      setError(err?.message || 'Failed to join waitlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to Game Guardian AI.",
      });
      try { localStorage.removeItem('demo-mode'); } catch {}
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
  };

  const authStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign In - Game Guardian AI",
    "description": "Sign in to your Game Guardian AI parent dashboard to monitor your child's gaming safety.",
    "url": "https://gameguardianai.com/auth"
  };

  return (
    <>
      <SEOHead
        title="Sign In - Game Guardian AI™ Parent Dashboard"
        description="Sign in to your Game Guardian AI parent dashboard to monitor your child's gaming safety with AI-powered voice chat analysis and real-time alerts."
        keywords="gaming safety login, parent dashboard, child protection signin, online gaming monitoring"
        canonicalUrl="https://gameguardianai.com/auth"
        structuredData={authStructuredData}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" aria-label="Game Guardian AI logo" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Game Guardian AI™</h1>
            <p className="text-muted-foreground mt-2">Keep your child safe in online gaming</p>
          </header>

        {wlIntent && (
          <Card className="mb-6 border-primary/40">
            <CardHeader>
              <CardTitle>{wlIntent === 'beta' ? 'Join the Game Guardian™ Device Beta' : 'Join the Guardian OS™ Waitlist'}</CardTitle>
              <CardDescription>
                {wlIntent === 'beta'
                  ? 'Be first to test the Game Guardian device.'
                  : 'Get notified when Guardian OS launches on September 1st.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWaitlistSubmit} className="space-y-4" aria-label="Waitlist sign-up form">
                <div className="space-y-2">
                  <Label htmlFor="wl-name">Full Name</Label>
                  <Input id="wl-name" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-email">Email</Label>
                  <Input id="wl-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : (wlIntent === 'beta' ? 'Join the beta' : 'Join the waitlist')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Parent Access</CardTitle>
            <CardDescription>
              Sign in to your dashboard or create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
<div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` });
                          toast({ title: 'Password reset email sent', description: 'Check your inbox for further instructions.' });
                        } catch (e: any) {
                          setError(e?.message || 'Failed to send reset email');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || !email}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={async () => {
                      setIsLoading(true);
                      // Set demo mode in localStorage and navigate
                      localStorage.setItem('demo-mode', 'true');
                      // Small delay to ensure localStorage is set
                      await new Promise(resolve => setTimeout(resolve, 100));
                      toast({
                        title: "Demo Mode Activated",
                        description: "Welcome to Game Guardian AI demo dashboard.",
                      });
                      navigate('/dashboard');
                      setIsLoading(false);
                    }}
                    disabled={isLoading}
                  >
                    Demo Login
                  </Button>
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    <p>New to Game Guardian AI? <button type="button" onClick={() => setActiveTab('signup')} className="text-primary hover:underline">Create an account</button></p>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;
