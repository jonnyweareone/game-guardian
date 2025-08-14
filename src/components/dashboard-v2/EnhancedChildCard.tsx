
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp,
  Activity,
  AlertTriangle,
  Trash2,
  Settings
} from 'lucide-react';
import SessionTimeline from './SessionTimeline';
import FilterPresetPicker from './FilterPresetPicker';
import BedtimePicker from './BedtimePicker';
import AppChooser from './AppChooser';
import NotificationsPanel from './NotificationsPanel';

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
  
  const isOnline = sessions.some(s => s.is_active);

  return (
    <Card className="overflow-hidden">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors pb-4"
            onClick={() => onToggleExpanded(child.id)}
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
          <CardContent className="space-y-6 border-t bg-muted/20 pt-6">
            {/* Session Timeline */}
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
            
            {/* Apps & Controls */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                App Controls
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <AppChooser
                  selectedApps={selectedApps}
                  onSelectionChange={setSelectedApps}
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Apps ({selectedApps.length} selected)
                  </Button>
                </AppChooser>
                
                <BedtimePicker
                  onValueChange={(value) => {
                    console.log(`${child.name} bedtime:`, value);
                  }}
                />
              </div>
            </div>
            
            {/* Policy Settings */}
            <div className="space-y-3">
              <h3 className="font-medium">Content Filter Settings</h3>
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
};

export default EnhancedChildCard;
