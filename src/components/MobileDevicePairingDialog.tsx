
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, QrCode, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Child {
  id: string;
  name: string;
}

interface MobileDevicePairingDialogProps {
  children: Child[];
  preselectedChildId?: string;
  onDevicePaired?: () => void;
}

export default function MobileDevicePairingDialog({ 
  children, 
  preselectedChildId, 
  onDevicePaired 
}: MobileDevicePairingDialogProps) {
  const [selectedChildId, setSelectedChildId] = useState(preselectedChildId || '');
  const [platform, setPlatform] = useState<'ios' | 'android' | ''>('');
  const [pairingToken, setPairingToken] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generatePairingToken = async () => {
    if (!selectedChildId || !platform) {
      toast.error('Please select a child and platform');
      return;
    }

    setIsGenerating(true);
    try {
      const token = Math.random().toString(36).substr(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

      const { error } = await supabase
        .from('device_pair_tokens')
        .insert({
          child_id: selectedChildId,
          token,
          kind: 'mobile',
          platform,
          expires_at: expiresAt
        });

      if (error) throw error;

      setPairingToken(token);
      
      // Generate QR code URL (you might want to use a QR code library here)
      const qrData = JSON.stringify({ token, platform, action: 'pair_device' });
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
      
      toast.success('Pairing token generated successfully');
    } catch (error) {
      console.error('Error generating pairing token:', error);
      toast.error('Failed to generate pairing token');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(pairingToken);
    toast.success('Token copied to clipboard');
  };

  const resetDialog = () => {
    setPairingToken('');
    setQrCodeUrl('');
    setPlatform('');
    if (!preselectedChildId) {
      setSelectedChildId('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Smartphone className="h-4 w-4" />
          Add Mobile Device
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Pair Mobile Device
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!pairingToken ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Child</label>
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose which child will use this device" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={platform} onValueChange={(value) => setPlatform(value as 'ios' | 'android')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ios">iOS (iPhone/iPad)</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generatePairingToken} 
                disabled={!selectedChildId || !platform || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Pairing Code'}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              {/* QR Code Display */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Scan with Child's Device
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Pairing QR Code" 
                    className="border rounded-lg"
                  />
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded text-lg font-mono">
                        {pairingToken}
                      </code>
                      <Button size="sm" variant="ghost" onClick={copyToken}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manual entry code (expires in 15 minutes)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Platform-specific instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platform === 'ios' ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">1</Badge>
                        <p className="text-sm">Open Camera app on the child's iPhone/iPad</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">2</Badge>
                        <p className="text-sm">Point camera at the QR code above</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">3</Badge>
                        <p className="text-sm">Tap the notification to install Guardian profile</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">4</Badge>
                        <p className="text-sm">Follow prompts to enable supervised mode</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">1</Badge>
                        <p className="text-sm">Install Guardian app from Google Play Store</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">2</Badge>
                        <p className="text-sm">Open app and scan QR code or enter pairing code</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">3</Badge>
                        <p className="text-sm">Grant required permissions when prompted</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">4</Badge>
                        <p className="text-sm">VPN and filtering will activate automatically</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Waiting for Device
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Complete the setup on the child's device. This dialog will update when the device is successfully paired.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetDialog} className="flex-1">
                  Generate New Code
                </Button>
                <Button 
                  onClick={() => {
                    setIsOpen(false);
                    onDevicePaired?.();
                  }} 
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
