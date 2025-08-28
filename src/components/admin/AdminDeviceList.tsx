import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Monitor, Wifi, WifiOff, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AdminDevice {
  id: string;
  device_code: string;
  device_name?: string;
  status: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
  parent_email?: string;
  parent_name?: string;
  child_name?: string;
  subscription_status?: string;
  firmware_version?: string;
  ui_version?: string;
}

const AdminDeviceList = () => {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0);
  const navigate = useNavigate();

  const pageSize = 12;

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-list-devices', {
        body: {
          q: searchQuery,
          page: currentPage,
          page_size: pageSize,
          order: 'created_at:desc'
        }
      });

      if (error) throw error;

      setDevices(data?.devices || []);
      setTotalDevices(data?.total || 0);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [currentPage, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string, isActive: boolean, lastSeen: string | null) => {
    const isRecentlyActive = lastSeen && new Date(lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
    
    if (status === 'online' || (isRecentlyActive && isActive)) {
      return (
        <Badge variant="default" className="bg-green-600">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      );
    }
    
    if (isActive && !isRecentlyActive) {
      return (
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

  const getSubscriptionBadge = (subscriptionStatus?: string) => {
    if (!subscriptionStatus) return null;
    
    const statusMap: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      trialing: { variant: 'secondary', label: 'Trial' },
      past_due: { variant: 'destructive', label: 'Past Due' },
      canceled: { variant: 'outline', label: 'Canceled' }
    };

    const statusInfo = statusMap[subscriptionStatus] || { variant: 'outline', label: subscriptionStatus };
    return <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>;
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

  const totalPages = Math.ceil(totalDevices / pageSize);

  if (loading && devices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search devices, parents, or emails..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchDevices} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {devices.length} of {totalDevices} devices
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No devices found' : 'No devices registered'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'No Game Guardian devices have been registered yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id} className="relative cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/devices/${device.id}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
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
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(device.status, device.is_active, device.last_seen)}
                    {getSubscriptionBadge(device.subscription_status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {device.parent_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Parent</span>
                      <span className="text-sm font-medium truncate max-w-32">
                        {device.parent_name}
                      </span>
                    </div>
                  )}

                  {device.child_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Child</span>
                      <span className="text-sm font-medium">{device.child_name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last seen</span>
                    <span className="text-sm">{formatLastSeen(device.last_seen)}</span>
                  </div>

                  {device.firmware_version && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Firmware</span>
                      <span className="text-sm font-mono">{device.firmware_version}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">View Details</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeviceList;