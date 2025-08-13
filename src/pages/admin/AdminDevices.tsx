import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Upload, Settings, Power, AlertTriangle } from 'lucide-react';
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
      const { data, error } = await supabase.functions.invoke('admin-list-devices', {
        body: {
          q: search,
          status: statusFilter === 'all' ? '' : statusFilter,
          page,
          page_size: pageSize,
        }
      });

      if (error) throw error;
      return data;
    },
  });

  const devices = data?.devices || [];
  const pagination = data?.pagination;

  const getStatusBadge = (status: string, lastSeen: string | null) => {
    if (status === 'online') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
    }
    if (status === 'idle') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Idle</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
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
          Manage Guardian devices, push updates, and monitor the fleet
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
                      <div className="text-sm text-muted-foreground">{device.device_code}</div>
                      {device.model && (
                        <div className="text-xs text-muted-foreground">{device.model}</div>
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
                    </div>
                  </TableCell>
                  <TableCell>
                    {device.last_seen ? (
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Never</span>
                    )}
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