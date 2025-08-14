import { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { getChildren } from '@/lib/api';
import PairDeviceDialog from '@/components/PairDeviceDialog';
import DeviceChildAssignmentDialog from '@/components/DeviceChildAssignmentDialog';
import AlertCard from '@/components/AlertCard';
import AIInsightCards from '@/components/AIInsightCards';
import ConversationViewer from '@/components/ConversationViewer';
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
  children?: { name: string };
}

interface ConversationData {
  id: string;
  platform: string;
  session_start: string;
  total_messages: number;
  risk_assessment: string;
  child_id: string;
  child_name?: string;
  children?: { name: string };
}

const Dashboard = () => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);

  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          *,
          children (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren,
  });

  const { data: alerts = [] } = useQuery({
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
          children:children!conversations_child_id_fkey(name)
        `)
        .order('flagged_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map(alert => ({
        ...alert,
        child_name: alert.children?.name
      })) as Alert[];
    },
  });

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          platform,
          session_start,
          total_messages,
          risk_assessment,
          child_id,
          children:children!conversations_child_id_fkey(name)
        `)
        .order('session_start', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return data.map(conv => ({
        ...conv,
        child_name: conv.children?.name || 'Unknown Child'
      })) as ConversationData[];
    },
    enabled: children.length > 0,
  });

  const handleDevicePaired = () => {
    refetchDevices();
  };

  const handleAssignmentChanged = () => {
    refetchDevices();
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_reviewed: true, reviewed_at: new Date().toISOString() })
        .eq('id', alertId);
      
      if (error) throw error;
      
      // Refetch alerts to update the UI
      // You would need to add this query refetch here
    } catch (error) {
      console.error('Failed to mark alert as reviewed:', error);
    }
  };

  // Mock insights data - in a real app, this would come from your API
  const mockInsights = {
    weeklyStats: {
      totalSessions: conversations.length,
      positiveInteractions: conversations.filter(c => c.risk_assessment === 'low').length,
      concerningInteractions: conversations.filter(c => c.risk_assessment === 'medium').length,
      criticalAlerts: alerts.filter(a => a.risk_level === 'critical').length,
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <PairDeviceDialog children={children} onDevicePaired={handleDevicePaired} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices?.filter(d => d.is_active).length || 0}
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
              {alerts.filter(a => !a.is_reviewed).length}
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
                        <div className={`w-3 h-3 rounded-full ${device.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{device.device_name || device.device_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.children ? `Assigned to ${device.children.name}` : 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={device.is_active ? "default" : "secondary"}>
                          {device.is_active ? 'Active' : 'Inactive'}
                        </Badge>
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
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.slice(0, 3).map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={{
                        id: alert.id,
                        child_id: alert.child_id,
                        alert_type: alert.alert_type,
                        risk_level: alert.risk_level,
                        ai_summary: alert.ai_summary,
                        transcript_snippet: alert.transcript_snippet ?? '',
                        confidence_score: alert.confidence_score ?? 0.5,
                        is_reviewed: alert.is_reviewed ?? false,
                        flagged_at: alert.flagged_at,
                        child_name: alert.child_name
                      }}
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
              {alerts.filter(a => !a.is_reviewed).length} unreviewed
            </Badge>
          </div>
          
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={{
                    id: alert.id,
                    child_id: alert.child_id,
                    alert_type: alert.alert_type,
                    risk_level: alert.risk_level,
                    ai_summary: alert.ai_summary,
                    transcript_snippet: alert.transcript_snippet ?? '',
                    confidence_score: alert.confidence_score ?? 0.5,
                    is_reviewed: alert.is_reviewed ?? false,
                    flagged_at: alert.flagged_at,
                    child_name: alert.child_name
                  }}
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
                    conversation={{
                      id: selectedConversation.id,
                      child_id: selectedConversation.child_id,
                      session_start: selectedConversation.session_start,
                      session_end: undefined,
                      platform: selectedConversation.platform,
                      participants: [],
                      sentiment_score: 0,
                      conversation_type: 'voice_chat',
                      risk_assessment: selectedConversation.risk_assessment,
                      transcript: []
                    }}
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
    </div>
  );
};

export default Dashboard;
