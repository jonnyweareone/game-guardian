import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Router, 
  Wifi, 
  WifiOff, 
  Settings, 
  RefreshCw, 
  Search,
  MoreVertical,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Bridge {
  id: string;
  deviceCode: string;
  customerEmail: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  version: string;
  location: string;
  connectedClients: number;
  uptime: string;
}

const BridgeManager = () => {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for bridges
    const mockBridges: Bridge[] = [
      {
        id: '1',
        deviceCode: 'GW-001-ABC123',
        customerEmail: 'john@example.com',
        status: 'online',
        lastSeen: '2 minutes ago',
        version: '2.1.4',
        location: 'Manchester, UK',
        connectedClients: 8,
        uptime: '15 days'
      },
      {
        id: '2',
        deviceCode: 'GW-002-DEF456',
        customerEmail: 'sarah@example.com',
        status: 'online',
        lastSeen: '5 minutes ago',
        version: '2.1.3',
        location: 'London, UK',
        connectedClients: 12,
        uptime: '23 days'
      },
      {
        id: '3',
        deviceCode: 'GW-003-GHI789',
        customerEmail: 'mike@example.com',
        status: 'offline',
        lastSeen: '2 hours ago',
        version: '2.1.4',
        location: 'Birmingham, UK',
        connectedClients: 0,
        uptime: '0 minutes'
      }
    ];
    
    setTimeout(() => {
      setBridges(mockBridges);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusIcon = (status: Bridge['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: Bridge['status']) => {
    const variants = {
      online: 'default',
      offline: 'destructive',
      maintenance: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const filteredBridges = bridges.filter(bridge =>
    bridge.deviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bridge.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bridge.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading bridges...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bridge Management</h2>
          <p className="text-muted-foreground">Monitor and manage customer bridge devices</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search bridges by device code, customer, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bridges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBridges.map((bridge) => (
          <Card key={bridge.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Router className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{bridge.deviceCode}</CardTitle>
                    <p className="text-sm text-muted-foreground">{bridge.customerEmail}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Activity className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(bridge.status)}
                    {getStatusBadge(bridge.status)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm font-medium">{bridge.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <Badge variant="outline">{bridge.version}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Clients</span>
                  <span className="text-sm font-medium">{bridge.connectedClients}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium">{bridge.uptime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Seen</span>
                  <span className="text-sm font-medium">{bridge.lastSeen}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBridges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Router className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bridges found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No bridge devices are currently registered'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BridgeManager;