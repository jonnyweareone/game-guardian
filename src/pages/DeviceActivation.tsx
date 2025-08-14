import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Wifi, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';

const DeviceActivation = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('device_id');
  
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  
  const { signIn, signUp, user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-pair device after successful authentication
  useEffect(() => {
    if (user && session && deviceId && !isActivated) {
      handleDevicePairing();
    }
  }, [user, session, deviceId]);

  const handleDevicePairing = async () => {
    if (!deviceId || !user || !session) return;
    
    try {
      setIsLoading(true);

      console.log('DeviceActivation: Calling bind-device with:', { 
        device_id: deviceId, 
        device_name: deviceName,
        user_id: user.id,
        session_exists: !!session 
      });
      
      // Ensure we have a valid session before making the call
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      console.log('DeviceActivation: Session validated, access_token exists:', !!sessionData.session.access_token);

      const { data, error } = await supabase.functions.invoke('bind-device', {
        body: {
          device_id: deviceId,
          device_name: deviceName || undefined,
        },
      });

      console.log('DeviceActivation: bind-device response:', { data, error });

      if (error) {
        console.error('DeviceActivation: bind-device error details:', error);
        throw new Error(error.message || 'Failed to bind device');
      }

      // Store device code for redirect
      if (data?.device?.device_code) {
        setDeviceCode(data.device.device_code);
      }

      // Handoff JWT to localhost helper if running
      if (data?.device_jwt) {
        try {
          await fetch("http://127.0.0.1:8719/token", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ device_jwt: data.device_jwt })
          });
        } catch { 
          // Ignore if helper not running
        }
      }

      setIsActivated(true);
      toast({
        title: "Device activated successfully!",
        description: "Starting activation wizard..."
      });

      // Redirect to dashboard with activation parameters
      setTimeout(() => {
        navigate(
          `/dashboard?activate=1&device_id=${encodeURIComponent(data.device_id || deviceId)}&device_code=${encodeURIComponent(data?.device?.device_code || deviceCode || '')}`
        );
      }, 2000);

    } catch (error: any) {
      console.error('DeviceActivation: Device pairing error:', error);
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive"
      });
      
      // If it's an auth error, reset to sign-in state
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        setError('Please sign in again to activate your device.');
      }
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
        description: "Activating your Guardian AI device...",
      });
      // Device pairing will be handled by useEffect
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
        description: "Please check your email to verify your account, then sign in to activate your device.",
      });
    }
  };

  // Show success screen after activation
  if (isActivated) {
    return (
      <>
        <SEOHead
          title="Device Activated - Game Guardian AI™"
          description="Your Guardian AI device has been successfully activated and is now protecting your family's gaming experience."
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-safe" />
              </div>
              <CardTitle className="text-2xl text-safe">Guardian Activated!</CardTitle>
              <CardDescription>
                Starting activation wizard...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-safe/10 rounded-lg border border-safe/20">
                  <p className="text-sm text-safe-foreground">
                    <strong>Device ID:</strong> {deviceId}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Redirecting to setup wizard...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show error if no device ID
  if (!deviceId) {
    return (
      <>
        <SEOHead
          title="Device Activation - Game Guardian AI™"
          description="Activate your Guardian AI device to start protecting your family's gaming experience."
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Invalid Activation Link</CardTitle>
              <CardDescription className="text-center">
                This activation link is missing a device ID. Please check the link from your Guardian AI device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full" variant="outline">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const activationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Device Activation - Game Guardian AI",
    "description": "Activate your Guardian AI device to start protecting your family's gaming experience.",
    "url": `https://gameguardianai.com/activate?device_id=${deviceId}`
  };

  return (
    <>
      <SEOHead
        title="Activate Guardian AI Device - Game Guardian AI™"
        description="Sign in or create an account to activate your Guardian AI device and start protecting your family's gaming experience with AI-powered monitoring."
        keywords="device activation, gaming safety setup, guardian ai pairing, child protection device"
        canonicalUrl={`https://gameguardianai.com/activate?device_id=${deviceId}`}
        structuredData={activationStructuredData}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" aria-label="Game Guardian AI logo" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Activate Guardian AI™</h1>
            <p className="text-muted-foreground mt-2">Set up your family protection device</p>
          </header>

          {/* Device ID Display */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Device Ready</CardTitle>
              </div>
              <CardDescription>
                Activating device: <code className="text-primary font-mono font-semibold">{deviceId}</code>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Access</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to activate your Guardian AI device
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
                    <div className="space-y-2">
                      <Label htmlFor="device-name">Device Name (optional)</Label>
                      <Input
                        id="device-name"
                        type="text"
                        placeholder="e.g., Gaming PC, PlayStation"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Activating Device...' : 'Sign In & Activate'}
                    </Button>
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
                    <div className="space-y-2">
                      <Label htmlFor="device-name-signup">Device Name (optional)</Label>
                      <Input
                        id="device-name-signup"
                        type="text"
                        placeholder="e.g., Gaming PC, PlayStation"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
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

export default DeviceActivation;
