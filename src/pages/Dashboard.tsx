import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity,
  GraduationCap,
  Coins,
  BookOpen,
  Plus,
  Eye,
  Wifi,
  WifiOff,
  Gift
} from 'lucide-react';
import { getChildren } from '@/lib/api';
import { getWallet, listRewards, listRedemptions } from '@/lib/rewardsApi';
import { edu } from '@/lib/educationApi';
import PairDeviceDialog from '@/components/PairDeviceDialog';
import AlertCard from '@/components/AlertCard';
import ActivationWizard from '@/components/ActivationWizard';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

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

interface Device {
  id: string;
  device_code: string;
  device_name: string | null;
  is_active: boolean;
  status: string;
  last_seen: string | null;
  child_id: string | null;
  children?: {
    id: string;
    name: string;
  } | null;
}

interface ChildData {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  parent_id: string;
  created_at: string;
  coins?: number;
  unread_alerts?: number;
  recent_education?: any[];
}

const Dashboard = () => {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [wallets, setWallets] = useState<Record<string, any>>({});
  const [timeline, setTimeline] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for activation parameters
  const shouldActivate = searchParams.get('activate') === '1';
  const activationDeviceId = searchParams.get('device_id');
  const activationDeviceCode = searchParams.get('device_code') || '';

  console.log('Dashboard activation check:', { shouldActivate, activationDeviceId, activationDeviceCode });

  // Fetch devices
  const { data: devices = [], isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          device_code,
          device_name,
          is_active,
          status,
          last_seen,
          child_id,
          children (
            id,
            name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Device[];
    },
  });

  // Fetch children with enhanced data
  const { data: childrenData = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['dashboard-children'],
    queryFn: async () => {
      const childrenResult = await getChildren();
      
      // Enhance children with wallet and alert data
      const enhancedChildren: ChildData[] = [];
      
      for (const child of childrenResult) {
        // Get wallet data
        let coins = 0;
        try {
          const wallet = await getWallet(child.id);
          coins = wallet.coins || 0;
        } catch (error) {
          console.warn(`Could not load wallet for child ${child.id}`);
        }

        // Get unread alerts count
        const { data: alertsData } = await supabase
          .from('alerts')
          .select('id')
          .eq('child_id', child.id)
          .eq('is_reviewed', false);

        enhancedChildren.push({
          ...child,
          coins,
          unread_alerts: alertsData?.length || 0
        });
      }

      return enhancedChildren;
    },
  });

  // Fetch alerts
  const { data: alertsData = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
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
          child_id,
          children:children!alerts_child_id_fkey ( name )
        `)
        .order('flagged_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map(alert => ({
        ...alert,
        child_name: (alert.children as any)?.name
      })) as Alert[];
    },
  });

  // Fetch parent timeline
  const { data: timelineData = [] } = useQuery({
    queryKey: ['parent-timeline'],
    queryFn: async () => {
      try {
        return await edu.parentTimeline();
      } catch (error) {
        console.warn('Could not load parent timeline');
        return [];
      }
    },
  });

  // Update children state when data changes
  useEffect(() => {
    if (childrenData) {
      setChildren(childrenData);
    }
  }, [childrenData]);

  const handleDevicePaired = () => {
    refetchDevices();
    toast({
      title: 'Device paired successfully!',
      description: 'Your new device is now connected to Guardian.'
    });
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_reviewed: true, reviewed_at: new Date().toISOString() })
        .eq('id', alertId);
      
      if (error) throw error;
      
      // Refetch alerts to update the list
      // This will be handled automatically by React Query
    } catch (error) {
      console.error('Failed to mark alert as reviewed:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark alert as reviewed',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (device: Device) => {
    const isOnline = device.status === 'online';
    return (
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-400" />
        )}
        <Badge variant={isOnline ? "default" : "secondary"}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>
    );
  };

  const getLastSeenText = (device: Device) => {
    if (!device.last_seen) return 'Never';
    return formatDistanceToNow(new Date(device.last_seen), { addSuffix: true });
  };

  const handleActivationWizardClose = () => {
    // Clear activation parameters from URL
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete('activate');
    currentParams.delete('device_id');
    currentParams.delete('device_code');
    
    // Update URL without activation parameters
    const newUrl = currentParams.toString();
    navigate(newUrl ? `?${newUrl}` : '/', { replace: true });
  };

  // Show loading state
  if (devicesLoading || childrenLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Activation Wizard */}
      {shouldActivate && activationDeviceCode && (
        <ActivationWizard deviceCode={activationDeviceCode} />
      )}

      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Family Dashboard</h1>
          <p className="text-muted-foreground">Monitor, educate, and reward your children's digital activities</p>
        </div>
        <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices?.filter(d => d.status === 'online').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {devices?.length || 0} total devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
            <p className="text-xs text-muted-foreground">
              {children.filter(c => c.unread_alerts && c.unread_alerts > 0).length} need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {children.reduce((total, child) => total + (child.coins || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              across all children
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsData?.filter(a => !a.is_reviewed).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {alertsData?.filter(a => a.risk_level === 'critical').length || 0} critical
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="text-center">
                <GraduationCap className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Education</CardTitle>
                <CardDescription>View reading sessions and learning activities</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="text-center">
                <Gift className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Rewards</CardTitle>
                <CardDescription>Manage coin rewards and redemptions</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Devices</CardTitle>
                <CardDescription>Monitor and manage connected devices</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events across your family's digital activities</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineData.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity to display</p>
              ) : (
                <div className="space-y-3">
                  {timelineData.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {event.kind === 'reading' && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {event.kind === 'learning' && <GraduationCap className="h-4 w-4 text-green-500" />}
                        {event.kind === 'reward' && <Gift className="h-4 w-4 text-purple-500" />}
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.detail?.subject || event.detail?.pages_completed ? 
                              `${event.detail.subject || 'Reading'} - ${event.detail.pages_completed || event.detail.duration_minutes || 0} ${event.detail.pages_completed ? 'pages' : 'minutes'}` : 
                              'Activity completed'
                            }
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="children" className="space-y-6">
          {children.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">No children profiles found</h3>
                  <p className="text-muted-foreground">
                    Add a child profile to start monitoring their digital activity
                  </p>
                </div>
                <Button asChild>
                  <Link to="/children">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child Profile
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {children.map((child) => (
                <Card key={child.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={child.avatar_url} alt={child.name} />
                          <AvatarFallback>
                            {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {child.name}
                            {child.age && (
                              <Badge variant="outline" className="text-xs">
                                {child.age} years old
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3 text-yellow-500" />
                              <span>{child.coins || 0} coins</span>
                            </div>
                            {child.unread_alerts && child.unread_alerts > 0 && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                <span>{child.unread_alerts} alerts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {child.unread_alerts && child.unread_alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {child.unread_alerts}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/education">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      Education
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/rewards">
                      <Gift className="h-4 w-4 mr-1" />
                      Rewards
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/monitoring?child=${child.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Monitor
                    </Link>
                  </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {alertsData.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Shield className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No alerts detected. Your children are safely browsing.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {alertsData.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkReviewed={handleMarkReviewed}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Family Timeline</CardTitle>
              <CardDescription>Complete history of education, rewards, and activities</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineData.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No timeline events yet</p>
              ) : (
                <div className="space-y-3">
                  {timelineData.map((event: any) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {event.kind === 'reading' && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {event.kind === 'learning' && <GraduationCap className="h-4 w-4 text-green-500" />}
                        {event.kind === 'reward' && <Gift className="h-4 w-4 text-purple-500" />}
                        {event.kind === 'system' && <Shield className="h-4 w-4 text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        {event.detail && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {JSON.stringify(event.detail, null, 2)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};

export default Dashboard;