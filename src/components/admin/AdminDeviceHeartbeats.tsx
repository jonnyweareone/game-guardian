import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Clock, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceHeartbeat {
  id: string;
  timestamp: string;
  device_id: string;
  device_code?: string;
  device_name?: string;
  parent_name?: string;
  child_name?: string;
  payload: Record<string, any>;
}

interface HeartbeatResponse {
  heartbeats: DeviceHeartbeat[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

const AdminDeviceHeartbeats = () => {
  const [heartbeats, setHeartbeats] = useState<DeviceHeartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchHeartbeats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-device-heartbeats', {
        body: {
          hours: parseInt(timeFilter),
          page: currentPage,
          page_size: 20,
        }
      });

      if (error) throw error;

      const response = data as HeartbeatResponse;
      setHeartbeats(response.heartbeats || []);
      setTotalPages(response.pagination?.total_pages || 0);
    } catch (error: any) {
      console.error('Error fetching heartbeats:', error);
      toast.error('Failed to load device heartbeats');
      setHeartbeats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeartbeats();
  }, [timeFilter, currentPage]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleString();
  };

  const getPayloadSummary = (payload: Record<string, any>) => {
    const keys = Object.keys(payload);
    if (keys.length === 0) return 'No data';
    
    const importantKeys = ['ui_version', 'firmware_version', 'os_version', 'battery', 'location'];
    const summary = importantKeys
      .filter(key => payload[key] !== undefined)
      .map(key => `${key}: ${payload[key]}`)
      .slice(0, 2);
    
    return summary.length > 0 ? summary.join(', ') : `${keys.length} fields`;
  };

  if (loading && heartbeats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Device Heartbeats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Device Heartbeats
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last hour</SelectItem>
                <SelectItem value="6">Last 6 hours</SelectItem>
                <SelectItem value="24">Last 24 hours</SelectItem>
                <SelectItem value="72">Last 3 days</SelectItem>
                <SelectItem value="168">Last week</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchHeartbeats} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {heartbeats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No device heartbeats found for the selected time range</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {heartbeats.map((heartbeat) => (
                <div
                  key={heartbeat.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <Monitor className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                          {heartbeat.device_code || heartbeat.device_id.slice(0, 8)}
                        </code>
                        {heartbeat.device_name && (
                          <span className="text-sm text-muted-foreground">
                            ({heartbeat.device_name})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {heartbeat.parent_name && (
                          <span>Parent: {heartbeat.parent_name}</span>
                        )}
                        {heartbeat.child_name && (
                          <Badge variant="outline" className="text-xs">
                            {heartbeat.child_name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                        {getPayloadSummary(heartbeat.payload)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(heartbeat.timestamp)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDeviceHeartbeats;