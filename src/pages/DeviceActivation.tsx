
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle } from 'lucide-react';

const DeviceActivation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceCode = searchParams.get('device_id') || '';
  
  const [inputCode, setInputCode] = useState(deviceCode);
  const [isBinding, setIsBinding] = useState(false);

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      toast.error('Please enter a device code');
      return;
    }

    setIsBinding(true);
    try {
      const { data, error } = await supabase.functions.invoke('bind-device', {
        body: { device_code: inputCode.trim().toUpperCase() }
      });

      if (error) throw error;

      if (data?.ok) {
        toast.success('Device bound successfully!');
        // Use the device_code from the response or fallback to input
        const codeToUse = data.device_code || inputCode.trim().toUpperCase();
        navigate(`/activation/complete?device_id=${encodeURIComponent(codeToUse)}`);
      } else {
        throw new Error(data?.error || 'Failed to bind device');
      }
    } catch (error: any) {
      console.error('Device binding error:', error);
      toast.error(error.message || 'Failed to bind device');
    } finally {
      setIsBinding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Activate Device</CardTitle>
          <CardDescription>
            Enter your Game Guardian device code to begin activation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device-code">Device Code</Label>
              <Input
                id="device-code"
                type="text"
                placeholder="GG-XXXX-XXXX"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="font-mono text-center tracking-wider"
                required
              />
              <p className="text-sm text-muted-foreground">
                Found on your device's activation screen
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isBinding}
            >
              {isBinding ? 'Binding Device...' : 'Activate Device'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">What happens next?</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Device will be linked to your account</li>
                  <li>• You'll configure child profiles and apps</li>
                  <li>• Device will sync and become active</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceActivation;
