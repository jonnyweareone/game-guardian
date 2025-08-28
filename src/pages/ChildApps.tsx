
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Smartphone, Store } from "lucide-react";
import AppControlTab from "@/components/apps/AppControlTab";
import AppStoreTab from "@/components/apps/AppStoreTab";
import { toast } from "sonner";

interface Device {
  id: string;
  device_name: string | null;
  device_code: string;
  status: string | null;
}

interface Child {
  id: string;
  name: string;
}

export default function ChildApps() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [child, setChild] = useState<Child | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/store')) return 'store';
    return 'control'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const basePath = `/children/${childId}/apps`;
    const newPath = value === 'store' ? `${basePath}/store` : `${basePath}/control`;
    navigate(newPath, { replace: true });
  };

  // Load child and devices
  useEffect(() => {
    const loadData = async () => {
      if (!childId) return;
      
      try {
        setLoading(true);
        
        // Load child info
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('id, name')
          .eq('id', childId)
          .single();

        if (childError) throw childError;
        setChild(childData);

        // Load devices for this child's parent
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select('id, device_name, device_code, status')
          .eq('parent_id', (await supabase.auth.getUser()).data.user?.id)
          .order('device_name');

        if (devicesError) throw devicesError;
        setDevices(devicesData || []);
        
        // Auto-select first device if none selected
        if (devicesData && devicesData.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(devicesData[0].id);
        }
        
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [childId]);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/children/${childId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {child.name}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Apps for {child.name}</h1>
          <p className="text-muted-foreground">
            Manage app access and discover new educational content
          </p>
        </div>

        {devices.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Device:</span>
            <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.device_name || device.device_code}
                    {device.status && (
                      <span className={`ml-2 text-xs ${
                        device.status === 'online' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        ({device.status})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Devices Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to set up a Guardian device before managing apps for {child.name}.
            </p>
            <Button onClick={() => navigate('/devices')}>
              Set Up Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              App Control
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              App Store
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control">
            <AppControlTab 
              childId={childId!} 
              deviceId={selectedDeviceId || undefined} 
            />
          </TabsContent>

          <TabsContent value="store">
            <AppStoreTab 
              childId={childId!} 
              deviceId={selectedDeviceId || undefined} 
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
