
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, AlertTriangle, TrendingUp, Clock, MapPin, Activity, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ActivationWizard from '@/components/ActivationWizard';
import AIInsightCards from '@/components/AIInsightCards';
import AlertCard from '@/components/AlertCard';
import ConversationViewer from '@/components/ConversationViewer';

interface Device {
  id: string;
  device_code: string;
  device_name?: string;
  is_active: boolean;
  last_seen?: string;
  child_id?: string;
  children?: {
    name: string;
  };
}

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface AlertData {
  id: string;
  alert_type: string;
  risk_level: string;
  ai_summary: string;
  created_at: string;
  child_id: string;
  children?: {
    name: string;
  };
}

interface ConversationData {
  id: string;
  platform: string;
  session_start: string;
  total_messages: number;
  risk_assessment: string;
  child_id: string;
  children?: {
    name: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivationWizard, setShowActivationWizard] = useState(false);
  const [activationDevice, setActivationDevice] = useState<{ id: string; code: string } | null>(null);

  // Check for activation parameters
  useEffect(() => {
    const deviceId = searchParams.get('activate_device');
    const deviceCode = searchParams.get('device_code');
    
    if (deviceId && deviceCode) {
      setActivationDevice({ id: deviceId, code: deviceCode });
      setShowActivationWizard(true);
      // Clean up URL parameters
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load devices
      const { data: devicesData } = await supabase
        .from('devices')
        .select(`
          id,
          device_code,
          device_name,
          is_active,
          last_seen,
          child_id,
          children (name)
        `)
        .order('created_at', { ascending: false });

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name, age, avatar_url')
        .order('name');

      // Load recent alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select(`
          id,
          alert_type,
          risk_level,
          ai_summary,
          created_at,
          child_id,
          children (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Load recent conversations
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select(`
          id,
          platform,
          session_start,
          total_messages,
          risk_assessment,
          child_id,
          children (name)
        `)
        .order('session_start', { ascending: false })
        .limit(5);

      setDevices(devicesData || []);
      setChildren(childrenData || []);
      setAlerts(alertsData || []);
      setConversations(conversationsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivationComplete = () => {
    setShowActivationWizard(false);
    setActivationDevice(null);
    loadDashboardData(); // Refresh data after activation
  };

  const activeDevices = devices.filter(d => d.is_active);
  const recentAlerts = alerts.filter(a => a.risk_level === 'high' || a.risk_level === 'critical');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Activation Wizard */}
      {activationDevice && (
        <ActivationWizard
          deviceId={activationDevice.id}
          deviceCode={activationDevice.code}
          isOpen={showActivationWizard}
          onClose={handleActivationComplete}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your family's digital activity overview.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Guardian Active
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDevices.length}</div>
            <p className="text-xs text-muted-foreground">
              {devices.length} total devices
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
              Profiles created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitored today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsightCards data={{
        weeklyStats: {
          totalSessions: conversations.length,
          positiveInteractions: conversations.filter(c => c.risk_assessment === 'low').length,
          concerningInteractions: conversations.filter(c => c.risk_assessment === 'medium').length,
          criticalAlerts: alerts.filter(a => a.risk_level === 'critical').length,
          averageSentiment: 0.7
        },
        talkingPoints: [
          "Great job maintaining positive online interactions",
          "Consider discussing online gaming etiquette",
          "Review screen time limits for weekdays"
        ],
        emotionalTrends: [
          { period: 'Week 1', positive: 85, neutral: 10, negative: 5 },
          { period: 'Week 2', positive: 78, neutral: 15, negative: 7 },
          { period: 'Week 3', positive: 82, neutral: 12, negative: 6 },
          { period: 'Week 4', positive: 88, neutral: 8, negative: 4 }
        ],
        onlineFriends: {}
      }} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No alerts to show. Your children are staying safe online! 🎉</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={{
                  id: alert.id,
                  type: alert.alert_type,
                  severity: alert.risk_level as 'low' | 'medium' | 'high' | 'critical',
                  message: alert.ai_summary,
                  timestamp: alert.created_at,
                  childName: alert.children?.name || 'Unknown'
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          {conversations.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No recent conversations to display.</p>
              </CardContent>
            </Card>
          ) : (
            conversations.map(conversation => (
              <ConversationViewer
                key={conversation.id}
                conversation={{
                  id: conversation.id,
                  platform: conversation.platform,
                  startTime: conversation.session_start,
                  messageCount: conversation.total_messages,
                  riskLevel: conversation.risk_assessment as 'low' | 'medium' | 'high',
                  childName: conversation.children?.name || 'Unknown',
                  participants: []
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4">
            {devices.map(device => (
              <Card key={device.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${device.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <h3 className="font-medium">{device.device_name || device.device_code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.children?.name ? `Assigned to ${device.children.name}` : 'No child assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={device.is_active ? 'default' : 'secondary'}>
                        {device.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {device.last_seen && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last seen: {new Date(device.last_seen).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {devices.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No devices registered yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
