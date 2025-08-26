
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Shield, Smartphone, Monitor, Battery, Zap, Trash2 } from 'lucide-react';
import { getChildren } from '@/lib/api';
import DeviceChildAssignmentDialog from './DeviceChildAssignmentDialog';
import PairDeviceDialog from './PairDeviceDialog';
import MobileDevicePairingDialog from './MobileDevicePairingDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const DeviceList = () => {
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          *,
          children (
            id,
            name
          )
        `)
        .is('deleted_at', null)
        .eq('is_active', true)
        .not('device_jwt', 'is', null)
        .not('paired_at', 'is', null)
        .in('status', ['online', 'active'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren,
  });

  const handleAssignmentChanged = () => {
    refetchDevices();
  };

  const handleDevicePaired = () => {
    refetchDevices();
  };

  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    try {
      const { error } = await supabase.rpc('rpc_remove_device', { _device: deviceId });
      if (error) throw error;
      
      toast.success(`Device "${deviceName}" removed successfully`);
      refetchDevices();
    } catch (error) {
      console.error('Error removing device:', error);
      toast.error('Failed to remove device');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return '🍎';
      case 'android': return '🤖';
      case 'windows': return '🪟';
      case 'linux': return '🐧';
      case 'macos': return '🍎';
      default: return '💻';
    }
  };

  const getDeviceIcon = (kind: string) => {
    return kind === 'mobile' ? Smartphone : Monitor;
  };

  if (devicesLoading || childrenLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const osDevices = devices?.filter(device => device.kind === 'os') || [];
  const mobileDevices = devices?.filter(device => device.kind === 'mobile') || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Devices</h2>
        <div className="flex gap-2">
          <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
          <MobileDevicePairingDialog children={children} onDevicePaired={handleDevicePaired} />
        </div>
      </div>

      {/* Guardian OS Devices */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Guardian OS Devices</h3>
          <Badge variant="outline">{osDevices.length}</Badge>
        </div>
        
        {osDevices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {osDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.kind);
              return (
                <Card key={device.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DeviceIcon className="h-5 w-5" />
                        {device.device_name || device.device_code}
                      </CardTitle>
                      {device.is_active ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{device.device_code}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={device.kind === 'mobile' ? 'secondary' : 'default'}>
                        {device.kind === 'mobile' ? 'Mobile' : 'OS'}
                      </Badge>
                      {device.platform && (
                        <Badge variant="outline" className="gap-1">
                          <span>{getPlatformIcon(device.platform)}</span>
                          {device.platform.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <div className="flex gap-2">
                        <Badge variant={device.is_active ? "default" : "secondary"}>
                          {device.status || (device.is_active ? 'Active' : 'Inactive')}
                        </Badge>
                        {device.mdm_enrolled && (
                          <Badge variant="default" className="bg-blue-500">
                            Supervised
                          </Badge>
                        )}
                        {device.vpn_active && (
                          <Badge variant="default" className="bg-green-500">
                            VPN Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assigned to:</span>
                      {device.children ? (
                        <Badge variant="outline">{device.children.name}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </div>

                    {device.battery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Battery:</span>
                        <div className="flex items-center gap-1">
                          <Battery className="h-4 w-4" />
                          <span className="text-sm">{device.battery}%</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <DeviceChildAssignmentDialog
                        device={device}
                        children={children}
                        onAssignmentChanged={handleAssignmentChanged}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Device</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{device.device_name || device.device_code}"? 
                              This will deactivate the device and remove all child assignments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveDevice(device.id, device.device_name || device.device_code)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No Guardian OS devices paired</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Devices */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Mobile Devices</h3>
          <Badge variant="outline">{mobileDevices.length}</Badge>
        </div>
        
        {mobileDevices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mobileDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.kind);
              return (
                <Card key={device.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DeviceIcon className="h-5 w-5" />
                        {device.device_name || `${device.platform} Device`}
                      </CardTitle>
                      {device.is_active ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{device.device_code}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        Mobile
                      </Badge>
                      {device.platform && (
                        <Badge variant="outline" className="gap-1">
                          <span>{getPlatformIcon(device.platform)}</span>
                          {device.platform.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <div className="flex gap-2">
                        <Badge variant={device.is_active ? "default" : "secondary"}>
                          {device.status || (device.is_active ? 'Active' : 'Inactive')}
                        </Badge>
                        {device.mdm_enrolled && (
                          <Badge variant="default" className="bg-blue-500">
                            Supervised
                          </Badge>
                        )}
                        {device.vpn_active && (
                          <Badge variant="default" className="bg-green-500">
                            <Zap className="h-3 w-3 mr-1" />
                            VPN
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assigned to:</span>
                      {device.children ? (
                        <Badge variant="outline">{device.children.name}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </div>

                    {device.battery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Battery:</span>
                        <div className="flex items-center gap-1">
                          <Battery className="h-4 w-4" />
                          <span className="text-sm">{device.battery}%</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <DeviceChildAssignmentDialog
                        device={device}
                        children={children}
                        onAssignmentChanged={handleAssignmentChanged}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Device</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{device.device_name || `${device.platform} Device`}"? 
                              This will deactivate the device and remove all child assignments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveDevice(device.id, device.device_name || `${device.platform} Device`)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No mobile devices paired yet
              </p>
              <MobileDevicePairingDialog children={children} onDevicePaired={handleDevicePaired} />
            </CardContent>
          </Card>
        )}
      </div>

      {devices && devices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices paired yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Get started by pairing your first Guardian device.
            </p>
            <div className="flex gap-2">
              <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
              <MobileDevicePairingDialog children={children} onDevicePaired={handleDevicePaired} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceList;
