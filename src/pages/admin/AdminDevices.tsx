
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Upload, Settings, Power, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDevices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-devices', search, statusFilter, page],
    queryFn: async () => {
      // Get the current session to access the JWT token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (search.trim()) {
        params.append('q', search.trim());
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Make direct fetch request to the Edge Function
      const response = await fetch(
        `https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/admin-list-devices?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Admin devices fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch devices: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Admin devices response:', result);
      return result;
    },
  });

  const devices = data?.devices || [];
  const pagination = data?.pagination;

  const getStatusBadge = (status: string, lastSeen: string | null) => {
    console.log('Device status details:', { status, lastSeen, type: typeof status });
    
    // Determine if device is truly online (last seen within 2 minutes)
    const isRecentlyActive = lastSeen && 
      new Date(lastSeen).getTime() > Date.now() - (2 * 60 * 1000);
    
    if (status === 'online' && isRecentlyActive) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      );
    }
    
    if (status === 'idle' || (status === 'online' && !isRecentlyActive)) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <WifiOff className="h-3 w-3 mr-1" />
          Idle
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    
    try {
      const date = new Date(lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Failed to load devices: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Device Management</h1>
        <p className="text-muted-foreground">
          Manage Guardian devices, monitor connectivity, and check heartbeat status
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices, parents, or children..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Device Table */}
      <Card>
        <CardHeader>
          <CardTitle>Devices ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Versions</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device: any) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{device.device_name || device.device_code}</div>
                      <div className="text-sm text-muted-foreground font-mono">{device.device_code}</div>
                      {device.model && (
                        <div className="text-xs text-muted-foreground">{device.model}</div>
                      )}
                      {device.id && (
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {device.id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{device.parent_name}</div>
                      <div className="text-sm text-muted-foreground">{device.parent_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {device.child_name ? (
                      <Badge variant="outline">{device.child_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No assignment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(device.status, device.last_seen)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>UI: {device.ui_version || 'Unknown'}</div>
                      <div>FW: {device.firmware_version || 'Unknown'}</div>
                      {device.build_id && (
                        <div className="text-xs text-muted-foreground">
                          Build: {device.build_id}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatLastSeen(device.last_seen)}</div>
                      {device.last_seen && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(device.last_seen).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/device/${device.id}`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/device/${device.id}?action=update`)}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {devices.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No devices found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Total devices: {devices.length}</div>
              <div>Online devices: {devices.filter((d: any) => d.status === 'online').length}</div>
              <div>Devices with recent heartbeat (2min): {devices.filter((d: any) => 
                d.last_seen && new Date(d.last_seen).getTime() > Date.now() - (2 * 60 * 1000)
              ).length}</div>
              <div>Current time: {new Date().toISOString()}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} devices
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
