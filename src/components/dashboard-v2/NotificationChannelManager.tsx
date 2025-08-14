
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, Plus, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getNotificationChannels, 
  addNotificationChannel, 
  deleteNotificationChannel,
  sendVerificationCode,
  verifyNotificationChannel,
  NotificationChannel 
} from '@/lib/dashboardV2Api';

export default function NotificationChannelManager() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [channelType, setChannelType] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [destination, setDestination] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await getNotificationChannels();
      setChannels(data);
    } catch (error) {
      console.error('Failed to load notification channels:', error);
      toast.error('Failed to load notification channels');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async () => {
    if (!destination.trim()) {
      toast.error('Please enter a valid destination');
      return;
    }

    try {
      setAdding(true);
      const newChannel = await addNotificationChannel(channelType, destination.trim());
      setChannels(prev => [...prev, newChannel]);
      setAddDialogOpen(false);
      setDestination('');
      
      // Automatically send verification code
      await handleSendVerificationCode(newChannel);
      
      toast.success(`${channelType.toLowerCase()} channel added. Verification code sent.`);
    } catch (error) {
      console.error('Failed to add notification channel:', error);
      toast.error('Failed to add notification channel');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await deleteNotificationChannel(channelId);
      setChannels(prev => prev.filter(c => c.id !== channelId));
      toast.success('Channel deleted');
    } catch (error) {
      console.error('Failed to delete channel:', error);
      toast.error('Failed to delete channel');
    }
  };

  const handleSendVerificationCode = async (channel: NotificationChannel) => {
    try {
      setSendingCode(true);
      await sendVerificationCode(channel.id);
      setSelectedChannel(channel);
      setVerifyDialogOpen(true);
      toast.success('Verification code sent');
    } catch (error) {
      console.error('Failed to send verification code:', error);
      toast.error('Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyChannel = async () => {
    if (!selectedChannel || !verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setVerifying(true);
      await verifyNotificationChannel(selectedChannel.id, verificationCode.trim());
      
      // Update the channel in the list
      setChannels(prev => prev.map(c => 
        c.id === selectedChannel.id 
          ? { ...c, is_verified: true }
          : c
      ));
      
      setVerifyDialogOpen(false);
      setVerificationCode('');
      setSelectedChannel(null);
      toast.success('Channel verified successfully');
    } catch (error) {
      console.error('Failed to verify channel:', error);
      toast.error('Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const maskDestination = (destination: string, kind: 'EMAIL' | 'SMS') => {
    if (kind === 'EMAIL') {
      const [local, domain] = destination.split('@');
      if (local && domain) {
        return `${local.slice(0, 2)}***@${domain}`;
      }
    } else if (kind === 'SMS') {
      if (destination.length > 4) {
        return `***${destination.slice(-4)}`;
      }
    }
    return destination;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notification Channels
          </div>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Notification Channel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Channel Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={channelType === 'EMAIL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChannelType('EMAIL')}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      variant={channelType === 'SMS' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChannelType('SMS')}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      SMS
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>
                    {channelType === 'EMAIL' ? 'Email Address' : 'Phone Number'}
                  </Label>
                  <Input
                    type={channelType === 'EMAIL' ? 'email' : 'tel'}
                    placeholder={channelType === 'EMAIL' ? 'your@email.com' : '+1234567890'}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddChannel} disabled={adding}>
                    {adding ? 'Adding...' : 'Add Channel'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {channels.length === 0 ? (
          <Alert>
            <AlertDescription>
              No notification channels configured. Add an email or SMS channel to receive alerts.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {channel.kind === 'EMAIL' ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  )}
                  
                  <div>
                    <div className="font-medium">
                      {maskDestination(channel.destination, channel.kind)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {channel.kind === 'EMAIL' ? 'Email' : 'SMS'}
                    </div>
                  </div>
                  
                  <Badge variant={channel.is_verified ? 'default' : 'secondary'}>
                    {channel.is_verified ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {channel.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {!channel.is_verified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendVerificationCode(channel)}
                      disabled={sendingCode}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Verify
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteChannel(channel.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  We've sent a verification code to {selectedChannel && maskDestination(selectedChannel.destination, selectedChannel.kind)}. 
                  Enter the code below to verify your channel.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label>Verification Code</Label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleVerifyChannel} disabled={verifying}>
                  {verifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
