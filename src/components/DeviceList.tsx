
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Monitor, Wifi, WifiOff, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Device {
  id: string;
  device_code: string;
  device_name?: string;
  status: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
  child?: {
    id: string;
    name: string;
  };
  kind: string;
}

const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          device_code,
          device_name,
          status,
          is_active,
          last_seen,
          created_at,
          kind,
          children:child_id (
            id,
            name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const devicesWithChild = data?.map(device => ({
        ...device,
        child: device.children || undefined
      })) || [];

      setDevices(devicesWithChild);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase.rpc('rpc_remove_device', {
        _device: deviceId
      });

      if (error) throw error;

      toast.success('Device removed successfully');
      fetchDevices(); // Refresh the list
    } catch (error: any) {
      console.error('Error removing device:', error);
      toast.error(error.message || 'Failed to remove device');
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const getStatusBadge = (status: string, isActive: boolean, lastSeen: string | null) => {
    if (status === 'active' && isActive) {
      const isOnline = lastSeen && new Date(lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
      return isOnline ? (
        <Badge variant="default" className="bg-green-600">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      ) : (
        <Badge variant="secondary">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      );
    }
    
    const statusMap: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      active: { variant: 'default', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      removed: { variant: 'destructive', label: 'Removed' }
    };

    const statusInfo = statusMap[status] || { variant: 'outline', label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDeviceIcon = (kind: string) => {
    return kind === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No devices found</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't registered any devices yet. Add your first Game Guardian device to get started.
          </p>
          <Button onClick={() => window.location.href = '/device-activation'}>
            Add Device
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <Card key={device.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getDeviceIcon(device.kind)}
                <div>
                  <CardTitle className="text-base font-mono">
                    {device.device_code}
                  </CardTitle>
                  {device.device_name && (
                    <CardDescription className="text-sm">
                      {device.device_name}
                    </CardDescription>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Device
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Device</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove device {device.device_code}? This action cannot be undone and will deactivate the device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeDevice(device.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(device.status, device.is_active, device.last_seen)}
              </div>

              {device.child && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assigned to</span>
                  <span className="text-sm font-medium">{device.child.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last seen</span>
                <span className="text-sm">{formatLastSeen(device.last_seen)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Added</span>
                <span className="text-sm">
                  {new Date(device.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeviceList;
