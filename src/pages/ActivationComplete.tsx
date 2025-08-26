import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Copy, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useActivationStatus } from '@/hooks/useActivationStatus';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';

// Lightweight confetti component that respects reduced motion
const ConfettiBurst = ({ show }: { show: boolean }) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!show || prefersReducedMotion) return null;

  const delay = Math.random() * 2;

  return (
    <>
      <style>{`
        @keyframes confetti {
          0% { 
            opacity: 1; 
            transform: translateY(0) rotate(0deg); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(300px) rotate(360deg); 
          }
        }
        .confetti-particle {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(20)].map((_, i) => {
          const animationDelay = Math.random() * 2;
          return (
            <div
              key={i}
              className="absolute confetti-particle opacity-0"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 20}%`,
                animationDelay: `${animationDelay}s`,
              }}
            >
              <Sparkles 
                className="w-4 h-4 text-primary animate-spin"
                style={{
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

// Mask token helper: keep first 6 and last 4 chars, replace middle with •
const maskToken = (token: string): string => {
  if (token.length <= 10) return token;
  const start = token.slice(0, 6);
  const end = token.slice(-4);
  const middle = '•'.repeat(Math.min(token.length - 10, 20));
  return `${start}${middle}${end}`;
};

const ActivationComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const deviceId = searchParams.get('device_id');
  const { loading, activated, deviceJwt, error, retry } = useActivationStatus(deviceId);
  
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle successful activation
  useEffect(() => {
    if (activated && deviceJwt && !showModal) {
      setShowModal(true);
      setShowConfetti(true);
      
      // Auto-redirect after 5 seconds
      const timer = setTimeout(() => {
        navigate('/devices');
      }, 5000);
      setAutoRedirectTimer(timer);
    }
  }, [activated, deviceJwt, showModal, navigate]);

  // Cleanup auto-redirect timer
  useEffect(() => {
    return () => {
      if (autoRedirectTimer) {
        clearTimeout(autoRedirectTimer);
      }
    };
  }, [autoRedirectTimer]);

  const handleCopyToken = async () => {
    if (!deviceJwt) return;
    
    try {
      await navigator.clipboard.writeText(deviceJwt);
      toast({
        title: "Token copied!",
        description: "Device token has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the token manually.",
        variant: "destructive"
      });
    }
  };

  const handleGoToVerification = () => {
    if (autoRedirectTimer) clearTimeout(autoRedirectTimer);
    navigate('/settings/verification');
  };

  const handleGoToDevices = () => {
    if (autoRedirectTimer) clearTimeout(autoRedirectTimer);
    navigate('/devices');
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (autoRedirectTimer) clearTimeout(autoRedirectTimer);
      navigate('/devices');
    }
  };

  if (!deviceId) {
    return (
      <>
        <SEOHead
          title="Activation Complete - Game Guardian AI™"
          description="Complete your Guardian AI device activation."
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Missing Device ID</CardTitle>
              <CardDescription className="text-center">
                No device ID provided for activation completion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/devices')} className="w-full">
                Go to Devices
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Activation Complete - Game Guardian AI™"
        description="Your Guardian AI device activation is being completed."
      />
      
      <ConfettiBurst show={showConfetti} />
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Loading State */}
        {loading && !error && (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <CardTitle>Finishing sync...</CardTitle>
              <CardDescription>
                Please wait while we complete your device activation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Device ID:</strong> {deviceId}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-center">Activation Not Finished</CardTitle>
              <CardDescription className="text-center">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  The activation process is taking longer than expected. Please try again or check your device connection.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={retry} className="flex-1">
                  Retry
                </Button>
                <Button onClick={() => navigate('/devices')} variant="outline" className="flex-1">
                  Go to Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-safe" />
              Device activated and synced
            </DialogTitle>
            <DialogDescription>
              Your Guardian AI device is now active and ready to protect your family's gaming experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Device ID:</span>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {deviceId}
                </code>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Device Token:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                    {deviceJwt ? maskToken(deviceJwt) : 'Loading...'}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyToken}
                    disabled={!deviceJwt}
                    aria-label="Copy device token to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Auto-redirecting to devices in 5 seconds...
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleGoToVerification} className="w-full sm:w-auto">
              Go to Verification
            </Button>
            <Button onClick={handleGoToDevices} variant="outline" className="w-full sm:w-auto">
              Go to Devices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivationComplete;
