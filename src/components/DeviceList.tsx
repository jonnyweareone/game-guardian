
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Shield } from 'lucide-react';
import { getChildren } from '@/lib/api';
import DeviceChildAssignmentDialog from './DeviceChildAssignmentDialog';
import PairDeviceDialog from './PairDeviceDialog';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Devices</h2>
        <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
      </div>

      {devices && devices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={device.is_active ? "default" : "secondary"}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Assigned to:</span>
                  {device.children ? (
                    <Badge variant="outline">{device.children.name}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>

                <div className="pt-2">
                  <DeviceChildAssignmentDialog
                    device={device}
                    children={children}
                    onAssignmentChanged={handleAssignmentChanged}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices paired yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by pairing your first Guardian AI device.
            </p>
            <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceList;
