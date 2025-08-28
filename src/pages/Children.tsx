import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Users, Smartphone } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AddChildDialog from '@/components/AddChildDialog';
import ChildRemovalDialog from '@/components/dashboard-v2/ChildRemovalDialog';
import { toast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';

interface Child {
  id: string;
  name: string;
  age?: number;
  dob?: string;
  avatar_url?: string;
  parent_id: string;
  created_at: string;
}

interface Device {
  id: string;
  device_name?: string;
  kind: string;
  status: string;
  last_seen?: string;
  is_active: boolean;
}

interface ChildWithDevices extends Child {
  assigned_devices: Device[];
}

export default function Children() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [removingChild, setRemovingChild] = useState<Child | null>(null);

  const { data: childrenWithDevices, isLoading } = useQuery({
    queryKey: ['children-with-devices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch children
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (childrenError) throw childrenError;

      // Fetch devices assigned to each child directly
      const childrenWithDevices = await Promise.all(
        (children || []).map(async (child) => {
          const { data: devices, error: devicesError } = await supabase
            .from('devices')
            .select(`
              id,
              device_name,
              kind,
              status,
              last_seen,
              is_active
            `)
            .eq('child_id', child.id)
            .is('deleted_at', null);

          if (devicesError) throw devicesError;

          return {
            ...child,
            assigned_devices: devices || []
          };
        })
      );

      return childrenWithDevices as ChildWithDevices[];
    },
  });

  const removeChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children-with-devices'] });
      queryClient.invalidateQueries({ queryKey: ['children'] }); // Also invalidate children query
      toast({
        title: "Child profile removed",
        description: "The child profile has been permanently deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing child",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveChild = (childId: string) => {
    removeChildMutation.mutate(childId);
    setRemovingChild(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getDeviceStatusColor = (device: Device) => {
    // Check if device is online based on recent activity
    const isRecentlyActive = device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000);
    
    if (device.status === 'online' || isRecentlyActive) return 'bg-green-500';
    if (device.status === 'offline' || !isRecentlyActive) return 'bg-gray-400';
    return 'bg-yellow-500';
  };

  return (
    <>
      <SEOHead
        title="Children Management - Game Guardian AI"
        description="Manage your children's profiles, devices, and settings in one place."
      />
      
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Children</h1>
            <p className="text-muted-foreground">
              Manage your children's profiles and device assignments
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : childrenWithDevices && childrenWithDevices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {childrenWithDevices.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={child.avatar_url} alt={child.name} />
                        <AvatarFallback className="text-lg font-medium">
                          {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {child.name}
                          {child.age && (
                            <Badge variant="outline" className="text-xs">
                              {child.age} years
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          DOB: {formatDate(child.dob)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingChild(child)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRemovingChild(child)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned Devices</span>
                      <Badge variant="secondary" className="text-xs">
                        {child.assigned_devices.length}
                      </Badge>
                    </div>
                    
                    {child.assigned_devices.length > 0 ? (
                      <div className="space-y-2">
                        {child.assigned_devices.map((device) => (
                          <div key={device.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getDeviceStatusColor(device)}`} />
                              <span className="text-sm font-medium">
                                {device.device_name || `${device.kind} Device`}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {device.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No devices assigned</p>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(child.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Users className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No children profiles</h3>
                <p className="text-muted-foreground">
                  Get started by adding your first child profile
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Child
              </Button>
            </div>
          </Card>
        )}

        <AddChildDialog
          open={showAddDialog || !!editingChild}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddDialog(false);
              setEditingChild(null);
            }
          }}
          editingChild={editingChild}
          onChildAdded={() => {
            queryClient.invalidateQueries({ queryKey: ['children-with-devices'] });
            queryClient.invalidateQueries({ queryKey: ['children'] }); // Also invalidate children query
            setShowAddDialog(false);
            setEditingChild(null);
          }}
        />

        <ChildRemovalDialog
          child={removingChild}
          open={!!removingChild}
          onOpenChange={(open) => !open && setRemovingChild(null)}
          onConfirm={handleRemoveChild}
        />
      </div>
    </>
  );
}