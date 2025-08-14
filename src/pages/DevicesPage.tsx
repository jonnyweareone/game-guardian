
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Shield, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getChildren } from '@/lib/api';
import DeviceChildAssignmentDialog from '@/components/DeviceChildAssignmentDialog';
import PairDeviceDialog from '@/components/PairDeviceDialog';

interface Device {
  id: string;
  device_code: string;
  device_name: string | null;
  status: string;
  last_seen: string | null;
  is_active: boolean;
  child_id: string | null;
  children?: {
    id: string;
    name: string;
  } | null;
}

const DevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  const { data: devicesData, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          device_code,
          device_name,
          status,
          last_seen,
          is_active,
          child_id,
          children (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Device[];
    },
  });

  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren,
  });

  // Update local state when query data changes
  useEffect(() => {
    if (devicesData) {
      setDevices(devicesData);
    }
  }, [devicesData]);

  // Set up realtime subscription for live updates
  useEffect(() => {
    console.log('Setting up devices realtime subscription...');
    const channel = supabase
      .channel('devices-realtime-page')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'devices' 
      }, (payload) => {
        console.log('Device realtime update:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new) {
          setDevices((prev) => 
            prev.map(d => 
              d.id === (payload.new as any).id 
                ? { ...d, ...(payload.new as any) } 
                : d
            )
          );
        } else if (payload.eventType === 'INSERT' && payload.new) {
          setDevices((prev) => [...prev, payload.new as Device]);
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setDevices((prev) => prev.filter(d => d.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up devices realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAssignmentChanged = () => {
    refetchDevices();
  };

  const handleDevicePaired = () => {
    refetchDevices();
  };

  const getStatusDisplay = (device: Device) => {
    const isOnline = device.status === 'online';
    return {
      icon: isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />,
      badge: (
        <Badge variant={isOnline ? "default" : "secondary"}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      )
    };
  };

  const getLastSeenDisplay = (device: Device) => {
    if (!device.last_seen) return 'Never';
    try {
      return formatDistanceToNow(new Date(device.last_seen), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (devicesLoading || childrenLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Device Manager</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your Guardian AI devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDevices()}
            disabled={devicesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${devicesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
        </div>
      </div>

      {devices && devices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => {
            const status = getStatusDisplay(device);
            return (
              <Card key={device.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {device.device_name || device.device_code}
                    </CardTitle>
                    {status.icon}
                  </div>
                  <p className="text-sm text-muted-foreground">{device.device_code}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {status.badge}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Seen:</span>
                    <span className="text-sm text-muted-foreground">
                      {getLastSeenDisplay(device)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Assigned to:</span>
                    {device.children ? (
                      <Badge variant="outline">{device.children.name}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active:</span>
                    <Badge variant={device.is_active ? "default" : "secondary"}>
                      {device.is_active ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <DeviceChildAssignmentDialog
                      device={device}
                      children={children}
                      onAssignmentChanged={handleAssignmentChanged}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by pairing your first Guardian AI device to begin monitoring and protecting your family.
            </p>
            <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DevicesPage;
