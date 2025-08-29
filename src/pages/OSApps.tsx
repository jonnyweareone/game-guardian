import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Monitor, Store, ArrowLeft } from 'lucide-react';
import { DeviceAppCard } from '@/components/apps/DeviceAppCard';
import AppStoreTab from '@/components/apps/AppStoreTab';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { fetchDeviceApps, fetchDevicePolicies } from '@/lib/osAppsApi';
import { subscribePendingLocalInstalls } from '@/lib/realtimeHelpers';
import { supabase } from '@/integrations/supabase/client';
import type { DeviceAppInventory, DeviceAppPolicy } from '@/types/os-apps';

interface Child {
  id: string;
  name: string;
  parent_id: string;
}

interface Device {
  id: string;
  device_name: string | null;
  status: string | null;
  is_active: boolean | null;
}

const OSApps: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceApps, setDeviceApps] = useState<DeviceAppInventory[]>([]);
  const [appPolicies, setAppPolicies] = useState<DeviceAppPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('control');

  // Load children
  useEffect(() => {
    if (!user) return;

    const loadChildren = async () => {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user.id)
          .order('name');

        if (error) throw error;
        setChildren(data || []);
        
        if (data && data.length > 0 && !selectedChild) {
          setSelectedChild(data[0].id);
        }
      } catch (error) {
        console.error('Error loading children:', error);
        toast.error('Failed to load children');
      }
    };

    loadChildren();
  }, [user, selectedChild]);

  // Load devices for selected child
  useEffect(() => {
    if (!selectedChild) return;

    const loadDevices = async () => {
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('child_id', selectedChild)
          .order('device_name');

        if (error) throw error;
        setDevices(data || []);
        
        if (data && data.length > 0 && !selectedDevice) {
          setSelectedDevice(data[0].id);
        }
      } catch (error) {
        console.error('Error loading devices:', error);
        toast.error('Failed to load devices');
      }
    };

    loadDevices();
  }, [selectedChild, selectedDevice]);

  // Load device apps and policies
  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const loadDeviceData = async () => {
      setLoading(true);
      try {
        const [apps, policies] = await Promise.all([
          fetchDeviceApps(selectedDevice),
          fetchDevicePolicies(selectedDevice)
        ]);

        setDeviceApps(apps);
        setAppPolicies(policies);
      } catch (error) {
        console.error('Error loading device data:', error);
        toast.error('Failed to load device apps');
      } finally {
        setLoading(false);
      }
    };

    loadDeviceData();

    // Set up realtime subscription for app changes
    const unsubscribe = subscribePendingLocalInstalls(() => {
      loadDeviceData();
    }, selectedDevice);

    return () => {
      unsubscribe();
    };
  }, [selectedDevice]);

  const refreshData = async () => {
    if (selectedDevice) {
      try {
        const [apps, policies] = await Promise.all([
          fetchDeviceApps(selectedDevice),
          fetchDevicePolicies(selectedDevice)
        ]);

        setDeviceApps(apps);
        setAppPolicies(policies);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }
  };

  const pendingApprovals = deviceApps.filter(app => {
    const policy = appPolicies.find(p => p.app_id === app.app_id);
    return app.installed_by === 'local' && !policy?.approved;
  });

  const selectedChildData = children.find(c => c.id === selectedChild);
  const selectedDeviceData = devices.find(d => d.id === selectedDevice);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/children">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Children
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">OS Apps Management</h1>
            <p className="text-muted-foreground">
              Manage apps installed on your child's devices
            </p>
          </div>
        </div>

        {/* Child Selection */}
        {children.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedChild(child.id);
                  setSelectedDevice(null);
                }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                  {child.name.charAt(0)}
                </div>
                {child.name}
                {pendingApprovals.length > 0 && selectedChild === child.id && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingApprovals.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}

        {selectedChildData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold">
                  {selectedChildData.name.charAt(0)}
                </div>
                {selectedChildData.name}'s Apps
              </CardTitle>
              
              {/* Device Selection */}
              {devices.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {devices.map((device) => (
                    <Button
                      key={device.id}
                      variant={selectedDevice === device.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDevice(device.id)}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      {device.device_name || device.id.slice(0, 8)}
                      <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </CardHeader>

            {selectedDeviceData && (
              <CardContent>
                {/* Pending Approvals Alert */}
                {pendingApprovals.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <h3 className="font-medium text-amber-800">
                        {pendingApprovals.length} app{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
                      </h3>
                      <p className="text-sm text-amber-700">
                        New apps installed from the desktop need your approval before they can be used.
                      </p>
                    </div>
                  </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="control" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      App Control
                      {pendingApprovals.length > 0 && (
                        <Badge variant="destructive" className="ml-1">
                          {pendingApprovals.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="store" className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      App Store
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="control" className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Manage installed applications on {selectedDeviceData.device_name || 'this device'}
                    </div>
                    
                    {deviceApps.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Apps Found</h3>
                        <p>No apps have been detected on this device yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {deviceApps.map((app) => {
                          const policy = appPolicies.find(p => p.app_id === app.app_id);
                          return (
                            <DeviceAppCard
                              key={app.app_id}
                              app={app}
                              policy={policy || null}
                              onPolicyUpdate={refreshData}
                            />
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="store">
                    <AppStoreTab
                      childId={selectedChild!}
                      selectedDeviceId={selectedDevice}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}

            {devices.length === 0 && selectedChild && (
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Devices Found</h3>
                  <p>No devices are associated with this child yet.</p>
                  <Button className="mt-4" asChild>
                    <Link to="/devices">Set up a device</Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {children.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No Children Found</h3>
              <p className="text-muted-foreground mb-4">
                You need to add children to your account first.
              </p>
              <Button asChild>
                <Link to="/children">Add a Child</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OSApps;