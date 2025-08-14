
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Clock,
  Eye,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getChildren } from '@/lib/api';
import PairDeviceDialog from '@/components/PairDeviceDialog';
import DeviceChildAssignmentDialog from '@/components/DeviceChildAssignmentDialog';
import AlertCard from '@/components/AlertCard';
import AIInsightCards from '@/components/AIInsightCards';
import ConversationViewer from '@/components/ConversationViewer';
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

interface ConversationData {
  id: string;
  platform: string;
  session_start: string;
  session_end?: string;
  total_messages: number;
  risk_assessment: string;
  child_id: string;
  participants: string[];
  sentiment_score: number;
  conversation_type: string;
  transcript: any[];
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

const Dashboard = () => {
  console.log('Dashboard component rendering...');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showActivationWizard, setShowActivationWizard] = useState(false);
  const [activationDeviceId, setActivationDeviceId] = useState('');
  const [activationDeviceCode, setActivationDeviceCode] = useState('');
  
  const { toast } = useToast();

  // Check for activation parameters on component mount
  useEffect(() => {
    console.log('Dashboard: Checking URL parameters...');
    console.log('Current search params:', Object.fromEntries(searchParams.entries()));
    
    const shouldActivate = searchParams.get('activate') === '1';
    const deviceId = searchParams.get('device_id');
    const deviceCode = searchParams.get('device_code');
    
    console.log('Activation check:', { shouldActivate, deviceId, deviceCode });
    
    if (shouldActivate && deviceId) {
      if (!deviceCode) {
        console.log('Dashboard: Looking up device code for device ID:', deviceId);
        lookupDeviceCode(deviceId);
      } else {
        console.log('Dashboard: Opening activation wizard for device:', deviceId, deviceCode);
        setActivationDeviceId(deviceId);
        setActivationDeviceCode(deviceCode);
        setShowActivationWizard(true);
        clearUrlParams();
      }
    } else {
      console.log('Dashboard: Activation conditions not met');
    }
  }, [searchParams, setSearchParams]);

  const lookupDeviceCode = async (deviceId: string) => {
    try {
      console.log('Looking up device code for device ID:', deviceId);
      const { data, error } = await supabase
        .from('devices')
        .select('device_code')
        .eq('id', deviceId)
        .single();
      
      if (error) throw error;
      
      if (data?.device_code) {
        console.log('Found device code:', data.device_code);
        setActivationDeviceId(deviceId);
        setActivationDeviceCode(data.device_code);
        setShowActivationWizard(true);
        clearUrlParams();
      } else {
        console.error('Device not found or no device code');
        toast({
          title: 'Device not found',
          description: 'Could not find the device to activate.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error looking up device:', error);
      toast({
        title: 'Error',
        description: 'Failed to look up device information.',
        variant: 'destructive'
      });
    }
  };

  const clearUrlParams = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('activate');
      newParams.delete('device_id');
      newParams.delete('device_code');
      console.log('Clearing URL parameters...');
      return newParams;
    });
  };

  const { data: devicesData, isLoading: devicesLoading, error: devicesError, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      console.log('Fetching devices...');
      try {
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
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Devices query error:', error);
          throw error;
        }
        console.log('Devices fetched successfully:', data);
        return data as Device[];
      } catch (err) {
        console.error('Error in devices query:', err);
        throw err;
      }
    },
  });

  // Update local devices state when query data changes
  useEffect(() => {
    if (devicesData) {
      console.log('Updating local devices state:', devicesData);
      setDevices(devicesData);
    }
  }, [devicesData]);

  // Add realtime subscription for device updates
  useEffect(() => {
    console.log('Setting up realtime subscription...');
    const channel = supabase
      .channel('devices-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'devices' 
      }, (payload) => {
        console.log('Device realtime update:', payload);
        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
          setDevices((prev) => 
            prev.map(d => 
              d.id === (payload.new as any).id 
                ? { ...d, ...(payload.new as any) } 
                : d
            )
          );
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  const { data: children = [], isLoading: childrenLoading, error: childrenError } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      console.log('Fetching children...');
      try {
        const result = await getChildren();
        console.log('Children fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('Error fetching children:', err);
        throw err;
      }
    },
  });

  const { data: alertsData = [], isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      console.log('Fetching alerts...');
      try {
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
        
        if (error) {
          console.error('Alerts query error:', error);
          throw error;
        }
        
        const result = data.map(alert => ({
          ...alert,
          child_name: (alert.children as any)?.name
        })) as Alert[];
        
        console.log('Alerts fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('Error fetching alerts:', err);
        throw err;
      }
    },
  });

  const { data: conversations = [], refetch: refetchConversations, isLoading: conversationsLoading, error: conversationsError } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      console.log('Fetching conversations...');
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            platform,
            session_start,
            session_end,
            total_messages,
            risk_assessment,
            child_id,
            participants,
            sentiment_score,
            conversation_type,
            transcript,
            children:children!conversations_child_id_fkey ( name )
          `)
          .order('session_start', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('Conversations query error:', error);
          throw error;
        }
        
        const result = data.map(conv => ({
          ...conv,
          child_name: (conv.children as any)?.name || 'Unknown Child'
        })) as ConversationData[];
        
        console.log('Conversations fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('Error fetching conversations:', err);
        throw err;
      }
    },
    enabled: children.length > 0,
  });

  const handleDevicePaired = () => {
    console.log('Device paired, refetching...');
    refetchDevices();
  };

  const handleAssignmentChanged = () => {
    console.log('Assignment changed, refetching...');
    refetchDevices();
  };

  const handleActivationComplete = () => {
    console.log('Activation wizard completed');
    setShowActivationWizard(false);
    setActivationDeviceId('');
    setActivationDeviceCode('');
    
    refetchDevices();
    
    toast({
      title: 'Device activated successfully!',
      description: 'Your Guardian AI device is now protecting your family.'
    });
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      console.log('Marking alert as reviewed:', alertId);
      const { error } = await supabase
        .from('alerts')
        .update({ is_reviewed: true, reviewed_at: new Date().toISOString() })
        .eq('id', alertId);
      
      if (error) throw error;
      console.log('Alert marked as reviewed successfully');
    } catch (error) {
      console.error('Failed to mark alert as reviewed:', error);
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

  // Mock insights data with proper structure
  const mockInsights = {
    weeklyStats: {
      totalSessions: conversations.length,
      positiveInteractions: conversations.filter(c => c.risk_assessment === 'low').length,
      concerningInteractions: conversations.filter(c => c.risk_assessment === 'medium').length,
      criticalAlerts: alertsData.filter(a => a.risk_level === 'critical').length,
      averageSentiment: 0.65,
    },
    talkingPoints: [
      "Ask Jake about his new gaming friends from last week's Minecraft session",
      "Discuss with Lily about the positive leadership she showed in her team games",
      "Check in on Alex's gaming time - he's been playing longer sessions recently"
    ],
    emotionalTrends: [
      {
        child: "Jake",
        trend: "positive",
        description: "Showing increased confidence and making new friends"
      },
      {
        child: "Lily", 
        trend: "concerning",
        description: "Had some negative interactions that affected her mood"
      }
    ],
    onlineFriends: {
      "Jake": ["MinecraftMaster", "BlockBuilder99", "CraftingKid"],
      "Lily": ["GamerGirl2024", "PuzzleSolver", "TeamLeader"]
    }
  };

  // Show loading state
  if (devicesLoading || childrenLoading) {
    console.log('Showing loading state');
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

  // Show error state
  if (devicesError || childrenError) {
    console.log('Showing error state', { devicesError, childrenError });
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load dashboard</p>
            <p className="text-muted-foreground text-sm mt-2">
              {devicesError?.message || childrenError?.message || 'Unknown error occurred'}
            </p>
            <Button 
              onClick={() => {
                refetchDevices();
              }} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering dashboard content');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
      </div>

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
              profiles created
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
              {alertsData.filter(a => !a.is_reviewed).length}
            </div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations.filter(c => {
                const today = new Date();
                const sessionDate = new Date(c.session_start);
                return sessionDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              gaming sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Devices</CardTitle>
              <CardDescription>Your connected Guardian AI devices</CardDescription>
            </CardHeader>
            <CardContent>
              {devicesLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse h-16 bg-muted rounded"></div>
                  <div className="animate-pulse h-16 bg-muted rounded"></div>
                </div>
              ) : devices && devices.length > 0 ? (
                <div className="space-y-3">
                  {devices.slice(0, 3).map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{device.device_name || device.device_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.children ? `Assigned to ${device.children.name}` : 'Unassigned'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last seen: {getLastSeenText(device)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(device)}
                        <DeviceChildAssignmentDialog
                          device={device}
                          children={children}
                          onAssignmentChanged={handleAssignmentChanged}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No devices paired yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Latest AI-detected incidents requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsData.length > 0 ? (
                <div className="space-y-4">
                  {alertsData.slice(0, 3).map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onMarkReviewed={handleMarkReviewed}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No alerts to show</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Security Alerts</h2>
            <Badge variant="outline">
              {alertsData.filter(a => !a.is_reviewed).length} unreviewed
            </Badge>
          </div>
          
          {alertsData.length > 0 ? (
            <div className="space-y-4">
              {alertsData.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkReviewed={handleMarkReviewed}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts to show</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Gaming Conversations</h2>
            <Badge variant="outline">
              {conversations.length} total sessions
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Latest gaming conversations monitored</CardDescription>
              </CardHeader>
              <CardContent>
                {conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.slice(0, 10).map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{conversation.platform}</p>
                            <p className="text-sm text-muted-foreground">
                              {conversation.child_name} • {conversation.total_messages} messages
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            conversation.risk_assessment === 'critical' ? 'destructive' :
                            conversation.risk_assessment === 'high' ? 'destructive' :
                            conversation.risk_assessment === 'medium' ? 'secondary' : 'outline'
                          }>
                            {conversation.risk_assessment}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(conversation.session_start), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations to show</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedConversation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Conversation Details
                  </CardTitle>
                  <CardDescription>
                    {selectedConversation.platform} session with {selectedConversation.child_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConversationViewer 
                    conversation={selectedConversation}
                    childName={selectedConversation.child_name || 'Unknown'}
                    onClose={() => setSelectedConversation(null)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI Insights</h2>
            <Badge variant="outline">
              <TrendingUp className="h-3 w-3 mr-1" />
              Weekly Summary
            </Badge>
          </div>
          
          <AIInsightCards insights={mockInsights} />
        </TabsContent>
      </Tabs>

      {/* Activation Wizard */}
      <ActivationWizard
        deviceId={activationDeviceId}
        deviceCode={activationDeviceCode}
        isOpen={showActivationWizard}
        onClose={handleActivationComplete}
      />
    </div>
  );
};

export default Dashboard;
