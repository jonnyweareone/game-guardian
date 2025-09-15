import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Router, Wifi, WifiOff, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Gateway {
  id: string;
  external_id: string;
  model?: string;
  firmware?: string;
  site_name?: string;
  last_heartbeat?: string;
  created_at: string;
}

export const GatewaysList = () => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('cpe_gateways')
          .select('*')
          .eq('parent_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGateways(data || []);
      } catch (error) {
        console.error('Error fetching gateways:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGateways();
  }, []);

  const getStatusBadge = (lastHeartbeat?: string) => {
    if (!lastHeartbeat) {
      return <Badge variant="secondary">Never Connected</Badge>;
    }

    const timeSince = Date.now() - new Date(lastHeartbeat).getTime();
    const isOnline = timeSince < 5 * 60 * 1000; // 5 minutes

    return (
      <Badge variant={isOnline ? "default" : "destructive"}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3 mr-1" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </>
        )}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            No Gateways Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect your first network gateway to start managing network policies.
          </p>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Setup Instructions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Network Gateways</h1>
        <Badge variant="outline">{gateways.length} gateway{gateways.length !== 1 ? 's' : ''}</Badge>
      </div>
      
      <div className="grid gap-4">
        {gateways.map((gateway) => (
          <Card key={gateway.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  {gateway.site_name || `Gateway ${gateway.external_id}`}
                </div>
                {getStatusBadge(gateway.last_heartbeat)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">ID</p>
                  <p className="font-mono">{gateway.external_id}</p>
                </div>
                {gateway.model && (
                  <div>
                    <p className="font-medium text-muted-foreground">Model</p>
                    <p>{gateway.model}</p>
                  </div>
                )}
                {gateway.firmware && (
                  <div>
                    <p className="font-medium text-muted-foreground">Firmware</p>
                    <p className="font-mono">{gateway.firmware}</p>
                  </div>
                )}
                {gateway.last_heartbeat && (
                  <div>
                    <p className="font-medium text-muted-foreground">Last Seen</p>
                    <p>{formatDistanceToNow(new Date(gateway.last_heartbeat), { addSuffix: true })}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};