import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Send, Smartphone, Palette, Package } from "lucide-react";
import { toast } from "sonner";

interface Device {
  id: string;
  device_name?: string;
  device_code: string;
  parent_id: string;
  is_active: boolean;
  last_seen?: string;
}

interface UITheme {
  id: string;
  name: string;
  description?: string;
  theme_data: any;
  is_default: boolean;
  is_active: boolean;
}

export default function AdminContentPush() {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [pushType, setPushType] = useState<'app_catalog' | 'ui_theme' | 'full_update'>('app_catalog');

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['admin-all-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .is('deleted_at', null)
        .order('device_name');
      
      if (error) throw error;
      return data as Device[];
    },
  });

  const { data: themes } = useQuery({
    queryKey: ['admin-ui-themes-for-push'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_themes')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as UITheme[];
    },
  });

  const { data: appCatalogStats } = useQuery({
    queryKey: ['app-catalog-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('id, is_active')
        .eq('is_active', true);
      
      if (error) throw error;
      return {
        total: data?.length || 0,
        active: data?.filter(app => app.is_active).length || 0
      };
    },
  });

  const pushContentMutation = useMutation({
    mutationFn: async ({ deviceIds, contentType, contentId }: {
      deviceIds: string[];
      contentType: string;
      contentId?: string;
    }) => {
      const commands = deviceIds.map(deviceId => ({
        device_id: deviceId,
        cmd: 'update_content',
        payload: {
          type: contentType,
          content_id: contentId,
          timestamp: new Date().toISOString()
        }
      }));

      const { data, error } = await supabase
        .from('device_commands')
        .insert(commands)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Content push queued for ${data.length} device(s)`);
      setSelectedDevices([]);
      setSelectedTheme('');
    },
    onError: (error) => {
      toast.error('Failed to push content: ' + error.message);
    },
  });

  const handleDeviceSelection = (deviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices(prev => [...prev, deviceId]);
    } else {
      setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  const handleSelectAll = () => {
    if (selectedDevices.length === devices?.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices?.map(d => d.id) || []);
    }
  };

  const handlePushContent = () => {
    if (selectedDevices.length === 0) {
      toast.error('Please select at least one device');
      return;
    }

    if (pushType === 'ui_theme' && !selectedTheme) {
      toast.error('Please select a theme to push');
      return;
    }

    pushContentMutation.mutate({
      deviceIds: selectedDevices,
      contentType: pushType,
      contentId: pushType === 'ui_theme' ? selectedTheme : undefined
    });
  };

  const activeDevices = devices?.filter(d => d.is_active) || [];
  const offlineDevices = devices?.filter(d => !d.is_active) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Push Management</h1>
        <p className="text-muted-foreground">Deploy app catalog updates and UI themes to Guardian OS devices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Selection ({selectedDevices.length} selected)
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedDevices.length === devices?.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Badge variant="secondary">{activeDevices.length} online</Badge>
              <Badge variant="outline">{offlineDevices.length} offline</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <div className="text-center py-8">Loading devices...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices?.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(device.id)}
                          onChange={(e) => handleDeviceSelection(device.id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {device.device_name || `Device ${device.device_code.slice(-4)}`}
                          </div>
                          <div className="text-sm text-muted-foreground">{device.device_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={device.is_active ? "secondary" : "outline"}>
                          {device.is_active ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.last_seen ? 
                          new Date(device.last_seen).toLocaleString() : 
                          'Never'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Content Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Push Type</label>
                <Select value={pushType} onValueChange={(value: any) => setPushType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app_catalog">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        App Catalog Update
                      </div>
                    </SelectItem>
                    <SelectItem value="ui_theme">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        UI Theme Update
                      </div>
                    </SelectItem>
                    <SelectItem value="full_update">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Full Content Update
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pushType === 'ui_theme' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Theme</label>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes?.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded border"
                              style={{ 
                                backgroundColor: theme.theme_data?.colors?.primary ? 
                                  `hsl(${theme.theme_data.colors.primary})` : 
                                  '#000' 
                              }}
                            />
                            {theme.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {pushType === 'app_catalog' && 'Push the latest app catalog to selected devices'}
                  {pushType === 'ui_theme' && 'Apply the selected theme to devices'}
                  {pushType === 'full_update' && 'Push all content updates (apps + themes)'}
                </p>
                <Button
                  onClick={handlePushContent}
                  disabled={selectedDevices.length === 0 || pushContentMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Push to {selectedDevices.length} Device(s)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">App Catalog</span>
                <Badge variant="secondary">
                  {appCatalogStats?.active || 0} active apps
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">UI Themes</span>
                <Badge variant="secondary">
                  {themes?.length || 0} available
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Online Devices</span>
                <Badge variant={activeDevices.length > 0 ? "secondary" : "outline"}>
                  {activeDevices.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}