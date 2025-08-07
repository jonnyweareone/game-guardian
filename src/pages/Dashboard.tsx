import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, AlertTriangle, Settings, Plus, MessageSquare, TrendingUp, Bell, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AlertCard from '@/components/AlertCard';
import ChildSwitcher from '@/components/ChildSwitcher';
import ConversationViewer from '@/components/ConversationViewer';
import AIInsightCards from '@/components/AIInsightCards';
import NotificationHistory from '@/components/NotificationHistory';
import { demoChildren, demoDevices, demoAlerts, demoNotifications, demoConversations, demoInsights } from '@/data/demoData';

interface DashboardAlert {
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

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface Device {
  id: string;
  device_name?: string;
  is_active: boolean;
  child_name?: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const isDemoMode = localStorage.getItem('demo-mode') === 'true';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (isDemoMode) {
        // Use demo data
        setChildren(demoChildren);
        setAlerts(demoAlerts);
        setDevices(demoDevices);
        setNotifications(demoNotifications);
        setConversations(demoConversations);
      } else {
        // Fetch real data from Supabase
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .order('created_at', { ascending: false });

        if (childrenError) throw childrenError;
        
        // Fetch alerts with child names
        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select(`
            *,
            children!inner(name)
          `)
          .order('flagged_at', { ascending: false })
          .limit(20);

        if (alertsError) throw alertsError;

        // Fetch devices with child names
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select(`
            *,
            children(name)
          `)
          .order('created_at', { ascending: false });

        if (devicesError) throw devicesError;

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('parent_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (notificationsError) throw notificationsError;

        // Fetch conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .order('session_start', { ascending: false })
          .limit(20);

        if (conversationsError) throw conversationsError;

        setChildren(childrenData || []);
        setAlerts(alertsData?.map(alert => ({
          ...alert,
          child_name: alert.children?.name
        })) || []);
        setDevices(devicesData?.map(device => ({
          ...device,
          child_name: device.children?.name
        })) || []);
        setNotifications(notificationsData || []);
        setConversations(conversationsData || []);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      if (isDemoMode) {
        // Update demo data locally
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_reviewed: true }
            : alert
        ));
      } else {
        const { error } = await supabase
          .from('alerts')
          .update({ 
            is_reviewed: true, 
            reviewed_at: new Date().toISOString() 
          })
          .eq('id', alertId);

        if (error) throw error;

        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_reviewed: true }
            : alert
        ));
      }

      toast({
        title: "Alert reviewed",
        description: "The alert has been marked as reviewed."
      });
    } catch (error: any) {
      toast({
        title: "Error updating alert",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
        : notif
    ));
  };

  const handleViewConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setActiveTab('conversations');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeDevices = devices.filter(d => d.is_active).length;
  const unreviewedAlerts = alerts.filter(a => !a.is_reviewed).length;
  const criticalAlerts = alerts.filter(a => a.risk_level === 'critical' && !a.is_reviewed).length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  
  // Filter data based on selected child
  const filteredAlerts = selectedChildId 
    ? alerts.filter(a => a.child_id === selectedChildId)
    : alerts;
  
  const filteredConversations = selectedChildId 
    ? conversations.filter(c => c.child_id === selectedChildId)
    : conversations;
  
  const filteredNotifications = selectedChildId 
    ? notifications.filter(n => n.child_id === selectedChildId)
    : notifications;

  // Calculate alert counts per child for switcher
  const alertCounts = children.reduce((acc, child) => {
    const childAlerts = alerts.filter(a => a.child_id === child.id);
    acc[child.id] = {
      total: childAlerts.length,
      critical: childAlerts.filter(a => a.risk_level === 'critical' && !a.is_reviewed).length
    };
    return acc;
  }, {} as Record<string, { total: number; critical: number }>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Game Guardian AI™</h1>
                <p className="text-sm text-muted-foreground">Parent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Switcher */}
        <ChildSwitcher
          children={children}
          selectedChildId={selectedChildId}
          onChildSelect={setSelectedChildId}
          alertCounts={alertCounts}
        />

        {/* Conversation Viewer Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <ConversationViewer
              conversation={selectedConversation}
              childName={children.find(c => c.id === selectedConversation.child_id)?.name || 'Unknown'}
              onClose={() => setSelectedConversation(null)}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
              {unreviewedAlerts > 0 && (
                <Badge variant="destructive" className="ml-1">{unreviewedAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              History
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadNotifications}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Children Protected</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{children.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                  <Shield className="h-4 w-4 text-safe" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeDevices}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unreviewed Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unreviewedAlerts}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-critical" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{criticalAlerts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button className="h-16 flex flex-col gap-2">
                <Plus className="h-5 w-5" />
                Add Child Profile
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <Shield className="h-5 w-5" />
                Pair New Device
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>Latest safety concerns and highlights</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredAlerts.slice(0, 3).length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-safe mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                      <p className="text-muted-foreground">
                        No concerning activity detected.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-md">
                          <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                            alert.risk_level === 'critical' ? 'text-critical' : 
                            alert.risk_level === 'high' ? 'text-warning' : 'text-safe'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.child_name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {alert.ai_summary}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('alerts')}
                        className="w-full"
                      >
                        View All Alerts
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversations</CardTitle>
                  <CardDescription>Latest gaming interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredConversations.slice(0, 3).map((conversation) => (
                      <div key={conversation.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <div className="text-lg">
                          {conversation.sentiment_score > 0.3 ? '😊' : 
                           conversation.sentiment_score > 0 ? '😐' : 
                           conversation.sentiment_score > -0.3 ? '😟' : '😡'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {children.find(c => c.id === conversation.child_id)?.name} - {conversation.platform}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {conversation.participants.length} participants • 
                            {conversation.risk_assessment} risk
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedConversation(conversation);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('conversations')}
                      className="w-full"
                    >
                      View All Conversations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empty States for New Users */}
            {children.length === 0 && (
              <Alert className="mt-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Get started:</strong> Add your first child profile and pair a Game Guardian device to begin monitoring.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedChildId ? `${children.find(c => c.id === selectedChildId)?.name}'s Alerts` : 'All Alerts'}
              </h2>
              {criticalAlerts > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {criticalAlerts} Critical Alert{criticalAlerts > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 text-safe mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No concerning activity detected. Your children are gaming safely.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkReviewed={handleMarkReviewed}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedChildId ? `${children.find(c => c.id === selectedChildId)?.name}'s Conversations` : 'All Conversations'}
            </h2>
            
            <div className="grid gap-4">
              {filteredConversations.map((conversation) => (
                <Card key={conversation.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedConversation(conversation)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {conversation.sentiment_score > 0.3 ? '😊' : 
                           conversation.sentiment_score > 0 ? '😐' : 
                           conversation.sentiment_score > -0.3 ? '😟' : '😡'}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {children.find(c => c.id === conversation.child_id)?.name} - {conversation.platform}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {conversation.participants.length} participants • 
                            {conversation.risk_assessment} risk • 
                            {conversation.conversation_type.replace('_', ' ')}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant={conversation.risk_assessment === 'critical' ? 'destructive' : 'outline'}>
                              {conversation.risk_assessment}
                            </Badge>
                            <Badge variant="outline">
                              Sentiment: {(conversation.sentiment_score * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Transcript
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">AI Insights & Recommendations</h2>
            <AIInsightCards insights={demoInsights} />
          </TabsContent>

          {/* Notification History Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationHistory
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkNotificationRead}
              onViewConversation={handleViewConversation}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;