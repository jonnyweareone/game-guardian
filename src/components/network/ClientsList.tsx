import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wifi, WifiOff, Pause, Shield, AlertTriangle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Client {
  id: string;
  mac: string;
  hostname?: string;
  child_id?: string;
  first_seen: string;
  last_seen?: string;
  gateway_id: string;
  cpe_policy_assignments?: Array<{ profile_id: string }>;
}

interface Child {
  id: string;
  name: string;
}

export const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch clients with policy assignments
        const { data: clientsData, error: clientsError } = await supabase
          .from('cpe_clients')
          .select(`
            *,
            cpe_policy_assignments(profile_id)
          `)
          .eq('parent_id', user.id)
          .order('last_seen', { ascending: false, nullsFirst: false });

        if (clientsError) throw clientsError;

        // Fetch children for assignment
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('id, name')
          .eq('parent_id', user.id);

        if (childrenError) throw childrenError;

        setClients(clientsData || []);
        setChildren(childrenData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load network clients');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (lastSeen?: string) => {
    if (!lastSeen) {
      return <Badge variant="secondary">Never Seen</Badge>;
    }

    const timeSince = Date.now() - new Date(lastSeen).getTime();
    const isOnline = timeSince < 5 * 60 * 1000; // 5 minutes

    return (
      <Badge variant={isOnline ? "default" : "secondary"}>
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

  const handleAssignChild = async (clientId: string, childId: string) => {
    try {
      const { error } = await supabase
        .from('cpe_clients')
        .update({ child_id: childId || null })
        .eq('id', clientId);

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === clientId ? { ...client, child_id: childId || undefined } : client
      ));

      toast.success('Child assignment updated');
      setAssignDialogOpen(false);
    } catch (error) {
      console.error('Error assigning child:', error);
      toast.error('Failed to assign child');
    }
  };

  const handlePauseClient = async (client: Client) => {
    try {
      // This would trigger a kill-switch operation via policy-render
      const response = await fetch('/api/client-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pause',
          client_id: client.id,
          mac: client.mac
        })
      });

      if (!response.ok) throw new Error('Failed to pause client');

      toast.success(`Paused internet for ${client.hostname || client.mac}`);
    } catch (error) {
      console.error('Error pausing client:', error);
      toast.error('Failed to pause client');
    }
  };

  const getChildName = (childId?: string) => {
    if (!childId) return null;
    const child = children.find(c => c.id === childId);
    return child?.name;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            No Network Clients Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No devices have been discovered on your network. Make sure your gateway is connected and devices are online.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Network Clients</h1>
        <Badge variant="outline">{clients.length} device{clients.length !== 1 ? 's' : ''}</Badge>
      </div>
      
      <div className="grid gap-4">
        {clients.map((client) => {
          const childName = getChildName(client.child_id);
          return (
            <Card key={client.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    {client.hostname || `Device ${client.mac.slice(-6)}`}
                  </div>
                  {getStatusBadge(client.last_seen)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="font-medium text-muted-foreground">MAC Address</p>
                    <p className="font-mono">{client.mac}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Assigned Child</p>
                    <p>{childName ? (
                      <Badge variant="outline">
                        <User className="w-3 h-3 mr-1" />
                        {childName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}</p>
                  </div>
                  {client.last_seen && (
                    <div>
                      <p className="font-medium text-muted-foreground">Last Seen</p>
                      <p>{formatDistanceToNow(new Date(client.last_seen), { addSuffix: true })}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Dialog open={assignDialogOpen && selectedClient?.id === client.id} onOpenChange={setAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedClient(client)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {childName ? 'Reassign' : 'Assign to Child'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Device to Child</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Assign {client.hostname || client.mac} to:</p>
                        <Select onValueChange={(value) => handleAssignChild(client.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a child" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No assignment</SelectItem>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id}>
                                {child.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePauseClient(client)}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Internet
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};