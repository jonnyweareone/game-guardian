import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Calendar } from 'lucide-react';
import { edu } from '@/lib/educationApi';

interface EducationTimelineProps {
  childId: string;
}

export const EducationTimeline: React.FC<EducationTimelineProps> = ({ childId }) => {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['education-timeline', childId],
    queryFn: () => edu.timeline(childId),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessions = timelineData?.sessions || [];
  const timeline = timelineData?.timeline || [];

  const allEvents = [
    ...sessions.map((session: any) => ({
      id: session.id,
      type: 'session',
      title: 'Reading Session',
      description: `${Math.round(session.total_seconds / 60)} minutes`,
      timestamp: session.created_at,
      book: session.book_id
    })),
    ...timeline.map((event: any) => ({
      id: event.id,
      type: event.event_type,
      title: event.event_type === 'started' ? 'Started Reading' : 
             event.event_type === 'finished' ? 'Finished Book' : 'Reading Progress',
      description: event.books?.title || 'Unknown Book',
      timestamp: event.created_at,
      book: event.book_id
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {allEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reading activity yet. Start a reading session to see timeline events here.
          </p>
        ) : (
          <div className="space-y-4">
            {allEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 mt-1">
                  {event.type === 'session' && <Clock className="h-4 w-4 text-blue-500" />}
                  {event.type === 'started' && <BookOpen className="h-4 w-4 text-green-500" />}
                  {event.type === 'finished' && <BookOpen className="h-4 w-4 text-purple-500" />}
                  {event.type === 'progress' && <BookOpen className="h-4 w-4 text-orange-500" />}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};