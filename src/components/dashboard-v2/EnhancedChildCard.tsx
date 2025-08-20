import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp,
  Activity,
  AlertTriangle,
  Trash2,
  Settings,
  MessageSquare,
  Gamepad2,
  Share2,
  BarChart3,
  BookOpen
} from 'lucide-react';
import SessionTimeline from './SessionTimeline';
import FilterPresetPicker from './FilterPresetPicker';
import BedtimePicker from './BedtimePicker';
import AppChooser from './AppChooser';
import NotificationsPanel from './NotificationsPanel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  parent_id: string;
  created_at: string;
}

interface AppSession {
  id: string;
  app_name: string;
  app_icon?: string;
  session_start: string;
  session_end?: string;
  duration_minutes: number;
  is_active: boolean;
}

interface EnhancedChildCardProps {
  child: Child;
  sessions: AppSession[];
  totalTodayMinutes: number;
  unreadAlerts: number;
  isExpanded: boolean;
  onToggleExpanded: (childId: string) => void;
  onRemoveChild: (child: Child) => void;
  onAddTime: (childId: string) => void;
  onPauseDevice: (childId: string) => void;
  onViewFullActivity: (childId: string) => void;
}

const EnhancedChildCard = ({
  child,
  sessions,
  totalTodayMinutes,
  unreadAlerts,
  isExpanded,
  onToggleExpanded,
  onRemoveChild,
  onAddTime,
  onPauseDevice,
  onViewFullActivity
}: EnhancedChildCardProps) => {
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const { toast } = useToast();
  
  const isOnline = sessions.some(s => s.is_active);

  const handleNovaLearning = async () => {
    try {
      // Mint a child token for Nova Learning access
      const { data, error } = await supabase.functions.invoke('nova-mint-child-token', {
        body: { child_id: child.id }
      });

      if (error) throw error;

      if (data?.nova_url) {
        // Open Nova Learning in new tab with the token
        window.open(data.nova_url, '_blank');
        
        toast({
          title: "Nova Learning Opened",
          description: `${child.name} can now access Nova Learning directly.`,
        });
      }
    } catch (error) {
      console.error('Error opening Nova Learning:', error);
      toast({
        title: "Error",
        description: "Failed to open Nova Learning. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={() => onToggleExpanded(child.id)}>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors pb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={child.avatar_url} alt={child.name} />
                  <AvatarFallback className="text-lg font-medium">
                    {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {child.name}
                    {child.age && (
                      <Badge variant="outline" className="text-xs">
                        {child.age} years old
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className={`h-3 w-3 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
                      <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Screen time: {Math.floor(totalTodayMinutes / 60)}h {totalTodayMinutes % 60}m</span>
                    </div>
                    {unreadAlerts > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span>{unreadAlerts} alerts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNovaLearning();
                  }}
                  title="Open Nova Learning"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveChild(child);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {unreadAlerts > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadAlerts}
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
          <CardContent className="border-t bg-muted/20 pt-6">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversations
                </TabsTrigger>
                <TabsTrigger value="apps" className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Apps & Games
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Social Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Activity Timeline */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Timeline
                  </h3>
                  <SessionTimeline
                    childId={child.id}
                    childName={child.name}
                    sessions={sessions}
                    totalTodayMinutes={totalTodayMinutes}
                    onAddTime={onAddTime}
                    onPauseDevice={onPauseDevice}
                    onViewFullActivity={onViewFullActivity}
                  />
                </div>
                
                {/* Controls */}
                <div className="grid md:grid-cols-2 gap-4">
                  <BedtimePicker
                    onValueChange={(value) => {
                      console.log(`${child.name} bedtime:`, value);
                    }}
                  />
                  
                  <FilterPresetPicker
                    selectedPreset="child"
                    onPresetChange={(preset) => {
                      console.log(`${child.name} preset:`, preset);
                    }}
                    childName={child.name}
                    childAvatar={child.avatar_url}
                  />
                </div>

                <NotificationsPanel 
                  scope="CHILD" 
                  child={{
                    id: child.id,
                    name: child.name,
                    avatar_url: child.avatar_url
                  }}
                />
              </TabsContent>

              <TabsContent value="conversations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Conversations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Discord Chat</span>
                          <Badge variant="outline">2h ago</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Conversation flagged for potential cyberbullying content
                        </p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Xbox Live</span>
                          <Badge variant="outline">4h ago</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Inappropriate language detected in voice chat
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="apps" className="space-y-4">
                <div className="space-y-4">
                  <AppChooser
                    selectedApps={selectedApps}
                    onSelectionChange={setSelectedApps}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Apps ({selectedApps.length} selected)
                    </Button>
                  </AppChooser>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Most Used Apps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-500 rounded"></div>
                            <span className="font-medium">YouTube</span>
                          </div>
                          <span className="text-sm text-muted-foreground">2h 15m today</span>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded"></div>
                            <span className="font-medium">Roblox</span>
                          </div>
                          <span className="text-sm text-muted-foreground">1h 45m today</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Social Media Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Instagram</span>
                          <Badge variant="destructive">High Risk</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Potential stranger contact detected
                        </p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">TikTok</span>
                          <Badge variant="secondary">Medium Risk</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Excessive use during school hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EnhancedChildCard;