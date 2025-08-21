import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, HelpCircle, TrendingUp } from 'lucide-react';

interface NovaCoachProps {
  sessionId: string;
  childId: string;
}

type NovaInsight = {
  ai_summary: string;
  difficulty_level: string | null;
  key_points: string[] | null;
  comprehension_questions: string[] | null;
  created_at: string;
};

export const NovaCoach: React.FC<NovaCoachProps> = ({ sessionId, childId }) => {
  const [latestInsight, setLatestInsight] = useState<NovaInsight | null>(null);
  const [problemWords, setProblemWords] = useState<any[]>([]);

  // Fetch latest AI insights for this session
  const { data: insight, refetch } = useQuery({
    queryKey: ['nova-insights', sessionId],
    queryFn: async (): Promise<NovaInsight | null> => {
      if (!sessionId || !childId) return null;
      
      const { data, error } = await supabase
        .from('nova_insights')
        .select('ai_summary, difficulty_level, key_points, comprehension_questions, created_at')
        .eq('session_id', sessionId)
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching insights:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!sessionId && !!childId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Load problem words
  useEffect(() => {
    if (!sessionId) return;
    
    const loadProblemWords = async () => {
      const { data } = await supabase
        .from('nova_problem_words')
        .select('word, phonetics, count')
        .eq('session_id', sessionId)
        .order('count', { ascending: false })
        .limit(5);
      setProblemWords(data || []);
    };

    loadProblemWords();
  }, [sessionId]);

  // Set up realtime subscription for new insights
  useEffect(() => {
    if (!sessionId) return;
    
    const channel = supabase
      .channel(`insights_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nova_insights',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          console.log('New insight received, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, refetch]);

  // Update local state when query data changes
  useEffect(() => {
    setLatestInsight(insight || null);
  }, [insight]);

  if (!latestInsight) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Nova Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">
              {!sessionId 
                ? "Creating reading session..." 
                : "Reading along... AI insights coming soon!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestInsight.ai_summary && (
            <div>
              <p className="text-sm text-muted-foreground">
                {latestInsight.ai_summary}
              </p>
            </div>
          )}

          {latestInsight.difficulty_level && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Difficulty:</span>
              <Badge variant={
                latestInsight.difficulty_level === 'easy' ? 'default' :
                latestInsight.difficulty_level === 'medium' ? 'secondary' :
                'destructive'
              }>
                {latestInsight.difficulty_level === 'easy' ? 'Easy' :
                 latestInsight.difficulty_level === 'medium' ? 'Medium' :
                 'Challenging'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Points */}
      {latestInsight.key_points && latestInsight.key_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {latestInsight.key_points.slice(0, 3).map((point: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Comprehension Questions */}
      {latestInsight.comprehension_questions && latestInsight.comprehension_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Try These
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latestInsight.comprehension_questions.slice(0, 2).map((question: string, index: number) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Question {index + 1}:</p>
                  <p className="text-sm text-muted-foreground">{question}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Words */}
      {problemWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Tricky Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {problemWords.map((word, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded bg-muted text-sm"
                  title={word.phonetics || `Seen ${word.count} times`}
                >
                  {word.word}
                  {word.phonetics && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      — {word.phonetics}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scope indicator */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          Reading insights • {new Date(latestInsight.created_at).toLocaleTimeString()}
        </Badge>
      </div>
    </div>
  );
};