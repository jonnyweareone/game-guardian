import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Upload, 
  Settings, 
  AlertTriangle, 
  Power, 
  MapPin,
  Monitor,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface DeviceConfig {
  ui_update?: string;
  firmware_update?: string;
  factory_reset?: boolean;
  features?: Record<string, any>;
}

export default function AdminDeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [firmwareDialogOpen, setFirmwareDialogOpen] = useState(false);
  const [uiVersion, setUiVersion] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [updateFile, setUpdateFile] = useState<File | null>(null);

  const { data: device, isLoading, error } = useQuery({
    queryKey: ['admin-device', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_admin_devices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (patch: DeviceConfig) => {
      const { data, error } = await supabase.functions.invoke('device-config-admin', {
        body: {
          device_id: id,
          patch,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-device', id] });
      setUpdateDialogOpen(false);
      setFirmwareDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update device configuration",
        variant: "destructive",
      });
    },
  });

  const handlePushUIUpdate = async () => {
    if (!uiVersion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a UI version",
        variant: "destructive",
      });
      return;
    }

    let updateUrl = uiVersion;

    // If file is uploaded, upload to storage first
    if (updateFile) {
      const fileName = `ui/${Date.now()}-${updateFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('updates')
        .upload(fileName, updateFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload update file",
          variant: "destructive",
        });
        return;
      }

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from('updates')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (urlData?.signedUrl) {
        updateUrl = urlData.signedUrl;
      }
    }

    updateConfigMutation.mutate({
      ui_update: updateUrl,
    });
  };

  const handlePushFirmwareUpdate = async () => {
    if (!firmwareVersion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a firmware version",
        variant: "destructive",
      });
      return;
    }

    updateConfigMutation.mutate({
      firmware_update: firmwareVersion,
    });
  };

  const handleFactoryReset = () => {
    if (confirm('Are you sure you want to factory reset this device? This action cannot be undone.')) {
      updateConfigMutation.mutate({
        factory_reset: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'online') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
    }
    if (status === 'idle') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Idle</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Device not found or access denied</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/devices')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Devices
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{device.device_name || device.device_code}</h1>
          <p className="text-muted-foreground">{device.device_code}</p>
        </div>
        {getStatusBadge(device.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Parent</Label>
                <div className="text-sm">
                  <div>{device.parent_name}</div>
                  <div className="text-muted-foreground">{device.parent_email}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Active Child</Label>
                <div className="text-sm">
                  {device.child_name ? (
                    <Badge variant="outline">{device.child_name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">No assignment</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Model</Label>
                <div className="text-sm">{device.model || 'Unknown'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Seen</Label>
                <div className="text-sm">
                  {device.last_seen ? (
                    formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })
                  ) : (
                    'Never'
                  )}
                </div>
              </div>
            </div>

            {device.location && typeof device.location === 'object' && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <div className="text-sm">
                  {(device.location as any).city && (device.location as any).country && (
                    <span>{(device.location as any).city}, {(device.location as any).country}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">UI Version</Label>
                <div className="text-sm">{device.ui_version || 'Unknown'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Firmware</Label>
                <div className="text-sm">{device.firmware_version || 'Unknown'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">OS Version</Label>
                <div className="text-sm">{device.os_version || 'Unknown'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Build ID</Label>
                <div className="text-sm">{device.build_id || 'Unknown'}</div>
              </div>
            </div>

            {device.kernel_version && (
              <div>
                <Label className="text-sm font-medium">Kernel</Label>
                <div className="text-sm">{device.kernel_version}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Plan</Label>
                <div className="text-sm">{device.subscription_plan || 'None'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="text-sm">
                  <Badge variant={device.subscription_status === 'active' ? 'default' : 'secondary'}>
                    {device.subscription_status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>

            {device.trial_ends_at && (
              <div>
                <Label className="text-sm font-medium">Trial Ends</Label>
                <div className="text-sm">
                  {formatDistanceToNow(new Date(device.trial_ends_at), { addSuffix: true })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Device Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Push UI Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Push UI Update</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ui-version">Version or URL</Label>
                    <Input
                      id="ui-version"
                      value={uiVersion}
                      onChange={(e) => setUiVersion(e.target.value)}
                      placeholder="1.2.3 or https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="ui-file">Or upload file</Label>
                    <Input
                      id="ui-file"
                      type="file"
                      onChange={(e) => setUpdateFile(e.target.files?.[0] || null)}
                      accept=".zip,.tar.gz,.deb"
                    />
                  </div>
                  <Button
                    onClick={handlePushUIUpdate}
                    disabled={updateConfigMutation.isPending}
                    className="w-full"
                  >
                    {updateConfigMutation.isPending ? 'Pushing...' : 'Push Update'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={firmwareDialogOpen} onOpenChange={setFirmwareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Offer Firmware Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Offer Firmware Update</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firmware-version">Firmware Version</Label>
                    <Input
                      id="firmware-version"
                      value={firmwareVersion}
                      onChange={(e) => setFirmwareVersion(e.target.value)}
                      placeholder="2.1.0"
                    />
                  </div>
                  <Button
                    onClick={handlePushFirmwareUpdate}
                    disabled={updateConfigMutation.isPending}
                    className="w-full"
                  >
                    {updateConfigMutation.isPending ? 'Offering...' : 'Offer Update'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleFactoryReset}
              disabled={updateConfigMutation.isPending}
            >
              <Power className="h-4 w-4 mr-2" />
              Factory Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}