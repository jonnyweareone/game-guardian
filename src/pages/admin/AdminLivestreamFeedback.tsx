import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, User, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackRecord {
  id: string;
  speaker_slug: string;
  comfortable: boolean;
  notes: string | null;
  preferred_intro: string | null;
  headshot_path: string | null;
  tech_notes: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminLivestreamFeedback() {
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('livestream_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load livestream feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadHeadshot = async (headshotPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('livestream-headshots')
        .download(headshotPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = headshotPath.split('/').pop() || 'headshot.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading headshot:', error);
      toast({
        title: 'Error',
        description: 'Failed to download headshot',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Livestream Speaker Feedback</h1>
        <p className="text-muted-foreground">
          Feedback and preferences submitted by speakers for the online safety livestream
        </p>
      </div>

      {feedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No feedback submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {feedback.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {record.speaker_slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={record.comfortable ? 'default' : 'secondary'}>
                    {record.comfortable ? 'Comfortable with live stream' : 'Has concerns'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {record.preferred_intro && (
                  <div>
                    <h4 className="font-medium mb-2">Preferred Introduction</h4>
                    <p className="text-sm bg-muted p-3 rounded-md">{record.preferred_intro}</p>
                  </div>
                )}

                {record.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes & Comments</h4>
                    <p className="text-sm bg-muted p-3 rounded-md">{record.notes}</p>
                  </div>
                )}

                {record.tech_notes && (
                  <div>
                    <h4 className="font-medium mb-2">Technical Notes</h4>
                    <p className="text-sm bg-muted p-3 rounded-md">{record.tech_notes}</p>
                  </div>
                )}

                {record.headshot_path && (
                  <div>
                    <h4 className="font-medium mb-2">Headshot Uploaded</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadHeadshot(record.headshot_path!)}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Download Headshot
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {record.user_agent && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <strong>User Agent:</strong> {record.user_agent}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}