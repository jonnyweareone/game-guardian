import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  MessageSquare, 
  Lightbulb,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';

interface NovaTimelineProps {
  childId: string;
}

export function NovaTimeline({ childId }: NovaTimelineProps) {
  // Load reading timeline
  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['nova-timeline', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('child_reading_timeline')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!childId,
  });

  // Load reading rollups for summary stats
  const { data: rollups = [] } = useQuery({
    queryKey: ['nova-rollups', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_rollups')
        .select(`
          *,
          books (title, cover_url, authors)
        `)
        .eq('child_id', childId)
        .order('last_session_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!childId,
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'started':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'progress':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'finished':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'note':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'highlight':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatEventTitle = (event: any) => {
    switch (event.event_type) {
      case 'started':
        return `Started reading "${event.title}"`;
      case 'progress':
        return `Reading progress: ${Math.round(event.progress || 0)}%`;
      case 'finished':
        return `Finished reading "${event.title}"`;
      case 'note':
        return `Added note to "${event.title}"`;
      case 'highlight':
        return `Highlighted text in "${event.title}"`;
      default:
        return `Activity in "${event.title}"`;
    }
  };

  // Calculate total stats
  const totalSessions = rollups.reduce((sum, rollup) => sum + (rollup.sessions || 0), 0);
  const totalMinutes = rollups.reduce((sum, rollup) => sum + Math.round((rollup.total_seconds || 0) / 60), 0);
  const totalPages = rollups.reduce((sum, rollup) => sum + (rollup.pages_completed || 0), 0);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto mb-4 animate-pulse" />
        <p>Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalSessions}</div>
            <div className="text-sm text-muted-foreground">Reading Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalPages}</div>
            <div className="text-sm text-muted-foreground">Pages Read</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalMinutes}m</div>
            <div className="text-sm text-muted-foreground">Reading Time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{rollups.length}</div>
            <div className="text-sm text-muted-foreground">Books Started</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </h3>
          
          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold mb-2">No reading activity yet</h4>
              <p className="text-muted-foreground">
                Start reading a book to see your activity timeline here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  {/* Book Cover */}
                  <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {event.cover_url ? (
                      <img
                        src={event.cover_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Event Header */}
                    <div className="flex items-center gap-2 mb-2">
                      {getEventIcon(event.event_type)}
                      <h4 className="font-medium text-sm">
                        {formatEventTitle(event)}
                      </h4>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {event.event_type}
                      </Badge>
                    </div>

                    {/* Event Details */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center justify-between">
                        <span>
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                        {event.progress && (
                          <span className="font-medium">
                            {Math.round(event.progress)}% complete
                          </span>
                        )}
                      </div>
                      
                      {event.note && (
                        <div className="bg-background p-2 rounded border-l-2 border-primary">
                          <p className="text-sm">{event.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Books in Progress */}
      {rollups.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Reading Progress
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {rollups.slice(0, 6).map((rollup) => (
                <div key={rollup.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  {/* Book Cover */}
                  <div className="w-10 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    {rollup.books?.cover_url ? (
                      <img
                        src={rollup.books.cover_url}
                        alt={rollup.books.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {rollup.books?.title || 'Unknown Book'}
                    </h4>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>{rollup.sessions} sessions</span>
                        <span>{rollup.pages_completed} pages</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{Math.round((rollup.total_seconds || 0) / 60)}m reading</span>
                        {rollup.last_session_at && (
                          <span>
                            Last: {new Date(rollup.last_session_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {rollup.last_summary && (
                      <div className="mt-2 text-xs bg-background p-2 rounded border-l-2 border-primary">
                        {rollup.last_summary}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}