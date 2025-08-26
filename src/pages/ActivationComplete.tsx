
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle2, Copy, Loader2, Sparkles } from 'lucide-react';
import { useActivationStatus } from '@/hooks/useActivationStatus';
import Confetti from 'react-confetti';

const ActivationComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceCode = searchParams.get('device_id') || '';
  
  const { status, deviceJwt, isPolling } = useActivationStatus(deviceCode);
  
  const [showModal, setShowModal] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load children when modal should show
  useEffect(() => {
    if (status === 'activated' && deviceJwt && !showModal && !showSuccess) {
      setShowModal(true);
      loadChildren();
    }
  }, [status, deviceJwt, showModal, showSuccess]);

  const loadChildren = async () => {
    setLoadingChildren(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChildren(data || []);
      
      // Auto-select if only one child
      if (data && data.length === 1) {
        setSelectedChildId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading children:', error);
      toast.error('Failed to load child profiles');
    } finally {
      setLoadingChildren(false);
    }
  };

  const createChild = async () => {
    if (!newChildName.trim()) {
      toast.error('Please enter a name for the child');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('children')
        .insert({
          name: newChildName.trim(),
          parent_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating child:', error);
      toast.error('Failed to create child profile');
      return null;
    }
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    
    try {
      let childId = selectedChildId;
      
      // Create new child if needed
      if (children.length === 0) {
        childId = await createChild();
        if (!childId) {
          setIsProcessing(false);
          return;
        }
      }

      if (!childId) {
        toast.error('Please select a child or create a new profile');
        setIsProcessing(false);
        return;
      }

      // Call device-postinstall
      const { data, error } = await supabase.functions.invoke('device-postinstall', {
        headers: {
          'Authorization': `Bearer ${deviceJwt}`,
          'Content-Type': 'application/json'
        },
        body: {
          device_id: deviceCode,
          child_id: childId
        }
      });

      if (error) throw error;

      if (data?.ok) {
        setShowSuccess(true);
        setShowConfetti(true);
        
        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          navigate('/devices');
        }, 5000);
      } else {
        throw new Error(data?.error || 'Setup failed');
      }
    } catch (error: any) {
      console.error('Device setup error:', error);
      toast.error(error.message || 'Failed to complete device setup');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToken = () => {
    if (deviceJwt) {
      navigator.clipboard.writeText(deviceJwt);
      toast.success('Device token copied to clipboard');
    }
  };

  const maskToken = (token: string) => {
    if (!token || token.length < 10) return token;
    return `${token.slice(0, 6)}${'•'.repeat(Math.max(0, token.length - 10))}${token.slice(-4)}`;
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/devices');
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Activation Failed</CardTitle>
            <CardDescription>
              Unable to activate device {deviceCode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/devices')} className="w-full">
              Return to Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'pending' || isPolling) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Activating Device</CardTitle>
            <CardDescription>
              Waiting for device {deviceCode} to come online...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                Status: {status}
              </Badge>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. Please keep this page open.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={closeModal}>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              {showSuccess ? (
                <div className="relative">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
              ) : (
                <Shield className="h-12 w-12 text-blue-600" />
              )}
            </div>
            <DialogTitle className="text-center">
              {showSuccess ? 'Setup Complete!' : 'Device Activated & Synced'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {showSuccess 
                ? 'Your Game Guardian device is ready to use'
                : 'Complete setup by assigning a child profile'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Device Info */}
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Device ID:</span>
                <Badge variant="outline" className="font-mono">
                  {deviceCode}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Device Token:</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {maskToken(deviceJwt || '')}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyToken}
                    className="h-6 w-6 p-0"
                    disabled={!deviceJwt}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {!showSuccess && (
              <>
                {/* Child Selection */}
                {loadingChildren ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : children.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Child Profile:</Label>
                    <RadioGroup value={selectedChildId} onValueChange={setSelectedChildId}>
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={child.id} id={child.id} />
                          <Label htmlFor={child.id} className="cursor-pointer">
                            {child.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="child-name" className="text-sm font-medium">
                      Create Child Profile:
                    </Label>
                    <Input
                      id="child-name"
                      placeholder="Enter child's name"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                <Button 
                  onClick={handleContinue} 
                  className="w-full"
                  disabled={isProcessing || (!selectedChildId && !newChildName.trim())}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up device...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </>
            )}

            {showSuccess && (
              <div className="space-y-3">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  Redirecting to devices in 5 seconds...
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => navigate('/settings/verification')}
                    className="flex-1"
                  >
                    Go to Verification
                  </Button>
                  <Button 
                    onClick={() => navigate('/devices')}
                    variant="outline"
                    className="flex-1"
                  >
                    Go to Devices
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivationComplete;
