
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Wifi, Settings } from 'lucide-react';
import { getChildren } from '@/lib/api';
import PairDeviceDialog from './PairDeviceDialog';
import DeviceChildAssignmentDialog from './DeviceChildAssignmentDialog';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren,
  });

  const handleDevicePaired = () => {
    refetchDevices();
  };

  const handleAssignmentChanged = () => {
    refetchDevices();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices?.filter(d => d.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {devices?.length || 0} total devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
            <p className="text-xs text-muted-foreground">
              profiles created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices?.filter(d => d.child_id).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              devices assigned to children
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Devices</CardTitle>
          <Link to="/devices">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <div className="space-y-3">
              <div className="animate-pulse h-16 bg-muted rounded"></div>
              <div className="animate-pulse h-16 bg-muted rounded"></div>
            </div>
          ) : devices && devices.length > 0 ? (
            <div className="space-y-3">
              {devices.slice(0, 3).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${device.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium">{device.device_name || device.device_code}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.children ? `Assigned to ${device.children.name}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={device.is_active ? "default" : "secondary"}>
                      {device.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <DeviceChildAssignmentDialog
                      device={device}
                      children={children}
                      onAssignmentChanged={handleAssignmentChanged}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No devices paired yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
