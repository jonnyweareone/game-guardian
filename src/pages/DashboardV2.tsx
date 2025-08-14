
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  ChevronDown, 
  ChevronUp,
  Settings,
  Bell,
  Clock,
  AlertTriangle,
  Activity,
  Gamepad2,
  Eye,
  Construction
} from 'lucide-react';
import { getChildrenWithAvatars } from '@/lib/dashboardV2Api';
import FilterPresetPicker from '@/components/dashboard-v2/FilterPresetPicker';
import BedtimePicker from '@/components/dashboard-v2/BedtimePicker';
import AppChooser from '@/components/dashboard-v2/AppChooser';
import NotificationsPanel from '@/components/dashboard-v2/NotificationsPanel';
import AlertCard from '@/components/AlertCard';
import DashboardSidebar from '@/components/dashboard-v2/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  parent_id: string;
  created_at: string;
}

interface Alert {
  id: string;
  child_id: string;
  alert_type: string;
  risk_level: string;
  ai_summary: string;
  transcript_snippet?: string;
  confidence_score: number;
  is_reviewed: boolean;
  flagged_at: string;
  child_name?: string;
}

const DashboardV2 = () => {
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [globalPreset, setGlobalPreset] = useState<'child' | 'teen' | 'adult'>('child');
  const [globalAllowedApps, setGlobalAllowedApps] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch children data
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['children-with-avatars'],
    queryFn: getChildrenWithAvatars,
  });

  // Fetch alerts data
  const { data: alertsData = [] } = useQuery({
    queryKey: ['alerts-dashboard-v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          alert_type,
          risk_level,
          ai_summary,
          flagged_at,
          transcript_snippet,
          confidence_score,
          is_reviewed,
          child_id
        `)
        .order('flagged_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Get child names
      const childIds = [...new Set(data.map(alert => alert.child_id))];
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name')
        .in('id', childIds);
      
      const childrenMap = new Map(childrenData?.map(child => [child.id, child.name]) || []);
      
      return data.map(alert => ({
        ...alert,
        child_name: childrenMap.get(alert.child_id)
      })) as Alert[];
    },
  });

  // Initialize selected children
  useEffect(() => {
    if (children.length > 0 && selectedChildren.length === 0) {
      setSelectedChildren(children.map(child => child.id));
    }
  }, [children, selectedChildren.length]);

  const toggleChildCard = (childId: string) => {
    setExpandedCards(prev => 
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const getChildAlerts = (childId: string) => {
    return alertsData.filter(alert => alert.child_id === childId);
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_reviewed: true, reviewed_at: new Date().toISOString() })
        .eq('id', alertId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark alert as reviewed:', error);
    }
  };

  const handleChildRemoved = async (childId: string) => {
    try {
      // Get devices linked to this child
      const { data: linkedDevices } = await supabase
        .from('device_child_assignments')
        .select('device_id')
        .eq('child_id', childId)
        .eq('is_active', true);

      // Factory reset linked devices
      if (linkedDevices && linkedDevices.length > 0) {
        const deviceResetPromises = linkedDevices.map(({ device_id }) =>
          supabase
            .from('device_commands')
            .insert({
              device_id,
              cmd: 'factory_reset',
              payload: { reason: 'child_profile_removed' }
            })
        );
        
        await Promise.all(deviceResetPromises);
      }

      // Remove child profile
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      // Update local state
      setSelectedChildren(prev => prev.filter(id => id !== childId));
      
      // Refresh children data
      queryClient.invalidateQueries({ queryKey: ['children-with-avatars'] });
      
      toast({
        title: "Child Profile Removed",
        description: "The child profile has been successfully removed and linked devices have been reset.",
      });
    } catch (error) {
      console.error('Failed to remove child:', error);
      toast({
        title: "Error",
        description: "Failed to remove child profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate alert counts for sidebar
  const alertCounts = children.reduce((acc, child) => {
    const childAlerts = getChildAlerts(child.id);
    const criticalAlerts = childAlerts.filter(alert => 
      alert.risk_level === 'high' && !alert.is_reviewed
    );
    
    acc[child.id] = {
      total: childAlerts.length,
      critical: criticalAlerts.length
    };
    
    return acc;
  }, {} as Record<string, { total: number; critical: number }>);

  if (childrenLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Guardian Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar
          children={children}
          selectedChildren={selectedChildren}
          onChildrenChange={setSelectedChildren}
          alertCounts={alertCounts}
          onChildRemoved={handleChildRemoved}
        />

        <SidebarInset>
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Guardian Dashboard V2</h1>
              <Badge variant="secondary">Beta</Badge>
            </div>
          </header>

          <div className="p-6 space-y-8">
            {/* Development Notice */}
            <Alert>
              <Construction className="h-4 w-4" />
              <AlertDescription>
                Dashboard V2 is currently under development. Some features are temporarily disabled while the database migration is being completed.
                The original dashboard is still fully functional.
              </AlertDescription>
            </Alert>

            {/* Global Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FilterPresetPicker
                    selectedPreset={globalPreset}
                    onPresetChange={setGlobalPreset}
                  />
                  
                  <BedtimePicker
                    onValueChange={(value) => {
                      console.log('Global bedtime changed:', value);
                    }}
                  />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Global App Access
                  </h3>
                  
                  <AppChooser
                    selectedApps={globalAllowedApps}
                    onSelectionChange={setGlobalAllowedApps}
                  >
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Global App Access ({globalAllowedApps.length} apps selected)
                    </Button>
                  </AppChooser>
                </div>
                
                <NotificationsPanel scope="GLOBAL" />
              </CardContent>
            </Card>

            {/* Per-Child Cards - Only show selected children */}
            {selectedChildren.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  Selected Children ({selectedChildren.length})
                </h2>
                
                {children
                  .filter(child => selectedChildren.includes(child.id))
                  .map((child) => {
                    const isExpanded = expandedCards.includes(child.id);
                    const childAlerts = getChildAlerts(child.id);
                    const unreadAlerts = childAlerts.filter(alert => !alert.is_reviewed);
                    
                    return (
                      <Card key={child.id} className="overflow-hidden">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <CardHeader 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => toggleChildCard(child.id)}
                            >
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
                                        <Badge variant="outline">
                                          {child.age} years old
                                        </Badge>
                                      )}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        <span>Online</span>
                                      </div>
                                      {unreadAlerts.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3 text-warning" />
                                          <span>{unreadAlerts.length} alerts</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {unreadAlerts.length > 0 && (
                                    <Badge variant="destructive">
                                      {unreadAlerts.length}
                                    </Badge>
                                  )}
                                  {isExpanded ? 
                                    <ChevronUp className="h-5 w-5" /> : 
                                    <ChevronDown className="h-5 w-5" />
                                  }
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <CardContent className="space-y-6 border-t bg-muted/20">
                              {/* Alerts Section */}
                              {childAlerts.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Recent Alerts
                                    {unreadAlerts.length > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {unreadAlerts.length} new
                                      </Badge>
                                    )}
                                  </h3>
                                  
                                  <div className="space-y-2">
                                    {childAlerts.slice(0, 3).map((alert) => (
                                      <AlertCard
                                        key={alert.id}
                                        alert={alert}
                                        onMarkReviewed={handleMarkReviewed}
                                      />
                                    ))}
                                  </div>
                                  
                                  {childAlerts.length > 3 && (
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-3 w-3 mr-1" />
                                      View All Alerts ({childAlerts.length})
                                    </Button>
                                  )}
                                </div>
                              )}
                              
                              {/* Apps & Controls */}
                              <div className="space-y-3">
                                <h3 className="font-medium flex items-center gap-2">
                                  <Gamepad2 className="h-4 w-4" />
                                  Apps & Controls
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <AppChooser
                                    selectedApps={[]}
                                    onSelectionChange={(apps) => {
                                      console.log(`${child.name} apps:`, apps);
                                    }}
                                  >
                                    <Button variant="outline" className="w-full">
                                      <Settings className="h-4 w-4 mr-2" />
                                      Manage Apps
                                    </Button>
                                  </AppChooser>
                                  
                                  <BedtimePicker
                                    onValueChange={(value) => {
                                      console.log(`${child.name} bedtime:`, value);
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Policy Overrides */}
                              <div className="space-y-3">
                                <h3 className="font-medium">Policy Overrides</h3>
                                <FilterPresetPicker
                                  selectedPreset="child"
                                  onPresetChange={(preset) => {
                                    console.log(`${child.name} preset:`, preset);
                                  }}
                                  childName={child.name}
                                  childAvatar={child.avatar_url}
                                />
                              </div>
                              
                              {/* Notifications */}
                              <NotificationsPanel 
                                scope="CHILD" 
                                child={{
                                  id: child.id,
                                  name: child.name,
                                  avatar_url: child.avatar_url
                                }}
                              />
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
              </div>
            )}

            {selectedChildren.length === 0 && children.length > 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Children Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select children from the sidebar to monitor their activity.
                  </p>
                </CardContent>
              </Card>
            )}

            {children.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Avatar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Children Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first child to start protecting them with Guardian AI.
                  </p>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardV2;
