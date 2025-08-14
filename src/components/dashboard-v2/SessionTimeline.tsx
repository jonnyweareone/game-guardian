
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Plus, Eye } from 'lucide-react';

interface AppSession {
  id: string;
  app_name: string;
  app_icon?: string;
  session_start: string;
  session_end?: string;
  duration_minutes: number;
  is_active: boolean;
}

interface SessionTimelineProps {
  childId: string;
  childName: string;
  sessions: AppSession[];
  dailyLimitMinutes?: number;
  totalTodayMinutes: number;
  onAddTime: (childId: string) => void;
  onPauseDevice: (childId: string) => void;
  onViewFullActivity: (childId: string) => void;
}

const SessionTimeline = ({ 
  childId, 
  childName, 
  sessions, 
  dailyLimitMinutes = 120, 
  totalTodayMinutes,
  onAddTime,
  onPauseDevice,
  onViewFullActivity 
}: SessionTimelineProps) => {
  const progressPercentage = Math.min((totalTodayMinutes / dailyLimitMinutes) * 100, 100);
  const isOverLimit = totalTodayMinutes > dailyLimitMinutes;
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Daily Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Today's Screen Time</span>
          <span className="text-sm text-muted-foreground">
            {formatDuration(totalTodayMinutes)} / {formatDuration(dailyLimitMinutes)}
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-2 ${isOverLimit ? 'bg-red-100' : ''}`}
        />
        {isOverLimit && (
          <Badge variant="destructive" className="text-xs">
            Over daily limit by {formatDuration(totalTodayMinutes - dailyLimitMinutes)}
          </Badge>
        )}
      </div>

      {/* Current Activity */}
      {sessions.some(s => s.is_active) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-medium text-green-800 mb-2">Currently Active</div>
          {sessions.filter(s => s.is_active).map(session => (
            <div key={session.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg border flex items-center justify-center">
                {session.app_icon ? (
                  <img src={session.app_icon} alt={session.app_name} className="w-6 h-6 rounded" />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                    {session.app_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-green-800">{session.app_name}</div>
                <div className="text-xs text-green-600">
                  Started at {formatTime(session.session_start)} • {formatDuration(session.duration_minutes)} so far
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Timeline */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Recent Sessions</div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sessions.filter(s => !s.is_active).slice(0, 8).map(session => (
            <div key={session.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-white rounded-lg border flex items-center justify-center">
                {session.app_icon ? (
                  <img src={session.app_icon} alt={session.app_name} className="w-6 h-6 rounded" />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                    {session.app_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{session.app_name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(session.session_start)} - {session.session_end ? formatTime(session.session_end) : 'Ongoing'}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatDuration(session.duration_minutes)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button size="sm" variant="outline" onClick={() => onAddTime(childId)}>
          <Plus className="h-3 w-3 mr-1" />
          Add Time
        </Button>
        <Button size="sm" variant="outline" onClick={() => onPauseDevice(childId)}>
          <Pause className="h-3 w-3 mr-1" />
          Pause
        </Button>
        <Button size="sm" variant="outline" onClick={() => onViewFullActivity(childId)}>
          <Eye className="h-3 w-3 mr-1" />
          Full Activity
        </Button>
      </div>
    </div>
  );
};

export default SessionTimeline;
