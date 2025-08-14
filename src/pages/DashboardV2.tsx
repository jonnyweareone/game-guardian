// MOBILE APP: Primary dashboard for mobile app - Enhanced version with better mobile UX
// Mobile features: Swipe gestures, card-based layout, quick actions, real-time updates
// Key screens: Overview, Alerts (with push), Social Media monitoring, Settings

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User,
  LogOut,
  Construction,
  Settings,
  BarChart3,
  MessageSquare,
  Eye,
  Shield,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getChildrenWithAvatars } from '@/lib/dashboardV2Api';
import ChildRemovalDialog from '@/components/dashboard-v2/ChildRemovalDialog';
import StatisticsCards from '@/components/dashboard-v2/StatisticsCards';
import EnhancedChildCard from '@/components/dashboard-v2/EnhancedChildCard';
import CompactAlertsList from '@/components/dashboard-v2/CompactAlertsList';
import SocialMediaVideoAnalysis from '@/components/dashboard-v2/SocialMediaVideoAnalysis';
import FilterPresetPicker from '@/components/dashboard-v2/FilterPresetPicker';
import BedtimePicker from '@/components/dashboard-v2/BedtimePicker';
import AppChooser from '@/components/dashboard-v2/AppChooser';
import NotificationsPanel from '@/components/dashboard-v2/NotificationsPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

// Mock data for demonstration - replace with real API calls
const mockSessions = [
  { id: '1', app_name: 'Minecraft', app_icon: '/placeholder.svg', session_start: '2024-01-15T14:00:00Z', session_end: '2024-01-15T15:30:00Z', duration_minutes: 90, is_active: false },
  { id: '2', app_name: 'YouTube', app_icon: '/placeholder.svg', session_start: '2024-01-15T16:00:00Z', duration_minutes: 45, is_active: true },
  { id: '3', app_name: 'Discord', app_icon: '/placeholder.svg', session_start: '2024-01-15T13:00:00Z', session_end: '2024-01-15T13:30:00Z', duration_minutes: 30, is_active: false },
];

const mockVideoWatches = [
  {
    id: '1',
    child_id: 'child-1',
    child_name: 'Emma',
    platform: 'tiktok' as const,
    video_url: 'https://tiktok.com/video/123',
    thumbnail_url: '/placeholder.svg',
    title: 'Funny Cat Compilation',
    watched_at: '2024-01-15T15:30:00Z',
    duration_seconds: 180,
    ai_analysis: {
      content_type: 'Entertainment',
      safety_rating: 'safe' as const,
      themes: ['animals', 'comedy', 'pets'],
      summary: 'Harmless compilation of funny cat videos with upbeat music',
      confidence_score: 0.95
    }
  },
  {
    id: '2',
    child_id: 'child-1',
    child_name: 'Emma',
    platform: 'youtube' as const,
    video_url: 'https://youtube.com/watch?v=xyz',
    thumbnail_url: '/placeholder.svg',
    title: 'Minecraft Building Tutorial',
    watched_at: '2024-01-15T14:00:00Z',
    duration_seconds: 600,
    ai_analysis: {
      content_type: 'Educational Gaming',
      safety_rating: 'educational' as const,
      themes: ['gaming', 'tutorial', 'creativity'],
      summary: 'Educational Minecraft tutorial showing building techniques',
      confidence_score: 0.98
    }
  }
];

const DashboardV2 = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [globalPreset, setGlobalPreset] = useState<'child' | 'teen' | 'adult'>('child');
  const [globalAllowedApps, setGlobalAllowedApps] = useState<string[]>([]);
  const [childToRemove, setChildToRemove] = useState<Child | null>(null);
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();

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
        .limit(50);
      
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
      queryClient.invalidateQueries({ queryKey: ['alerts-dashboard-v2'] });
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

  // Calculate statistics
  const activeDevices = children.length; // Simplified - assuming each child has a device
  const activeAlerts = alertsData.filter(alert => !alert.is_reviewed).length;
  const todaySessions = children.length * 3; // Mock calculation

  if (childrenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Guardian Dashboard V2...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Guardian Dashboard V2</h1>
              <Badge variant="secondary">Enhanced</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                {user?.email}
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Development Notice */}
        <Alert>
          <Construction className="h-4 w-4" />
          <AlertDescription>
            Dashboard V2 Enhanced - Now featuring social media monitoring, improved child management, and comprehensive analytics.
          </AlertDescription>
        </Alert>

        {/* Statistics Cards */}
        <StatisticsCards
          activeDevices={activeDevices}
          totalChildren={children.length}
          activeAlerts={activeAlerts}
          todaySessions={todaySessions}
        />

        {/* Main Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Alerts
              {activeAlerts > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {activeAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="social-media" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {children.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Children Overview</h2>
                {children.map((child) => {
                  const childAlerts = getChildAlerts(child.id);
                  const unreadAlerts = childAlerts.filter(alert => !alert.is_reviewed);
                  
                  return (
                    <EnhancedChildCard
                      key={child.id}
                      child={child}
                      sessions={mockSessions}
                      totalTodayMinutes={165}
                      unreadAlerts={unreadAlerts.length}
                      isExpanded={expandedCards.includes(child.id)}
                      onToggleExpanded={toggleChildCard}
                      onRemoveChild={setChildToRemove}
                      onAddTime={(childId) => console.log('Add time:', childId)}
                      onPauseDevice={(childId) => console.log('Pause device:', childId)}
                      onViewFullActivity={(childId) => console.log('View activity:', childId)}
                    />
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="font-medium text-lg mb-2">No Children Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first child to start protecting them with Guardian AI.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <CompactAlertsList
              alerts={alertsData}
              onMarkReviewed={handleMarkReviewed}
              onViewDetails={(alertId) => console.log('View alert details:', alertId)}
            />
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social-media">
            <SocialMediaVideoAnalysis videoWatches={mockVideoWatches} />
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Conversations Monitoring</h3>
                <p className="text-muted-foreground">
                  Real-time conversation monitoring and AI analysis coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">AI Insights</h3>
                <p className="text-muted-foreground">
                  Advanced analytics and insights powered by AI coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Content Filtering */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Filtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterPresetPicker
                    selectedPreset={globalPreset}
                    onPresetChange={setGlobalPreset}
                  />
                </CardContent>
              </Card>

              {/* Screen Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global Bedtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <BedtimePicker
                    onValueChange={(value) => console.log('Global bedtime:', value)}
                  />
                </CardContent>
              </Card>

              {/* App Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global App Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <AppChooser
                    selectedApps={globalAllowedApps}
                    onSelectionChange={setGlobalAllowedApps}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Apps ({globalAllowedApps.length} selected)
                    </Button>
                  </AppChooser>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <NotificationsPanel scope="GLOBAL" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChildRemovalDialog
        child={childToRemove}
        open={!!childToRemove}
        onOpenChange={() => setChildToRemove(null)}
        onConfirm={(childId) => {
          handleChildRemoved(childId);
          setChildToRemove(null);
        }}
      />
    </div>
  );
};

export default DashboardV2;
