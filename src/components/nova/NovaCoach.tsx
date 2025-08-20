import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, HelpCircle, TrendingUp } from 'lucide-react';

interface NovaCoachProps {
  sessionId: string;
  childId: string;
}

export const NovaCoach: React.FC<NovaCoachProps> = ({ sessionId, childId }) => {
  // Fetch latest AI insights for this session
  const { data: latestInsight } = useQuery({
    queryKey: ['ai-insights', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_reading_insights' as any)
        .select('*')
        .eq('session_id', sessionId)
        .eq('scope', 'chunk')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

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
              Reading along... AI insights coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Type guard to ensure we have a valid insight object
  const insight = latestInsight as any;

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
          {insight?.summary && (
            <div>
              <p className="text-sm text-muted-foreground">
                {insight.summary}
              </p>
            </div>
          )}

          {insight?.difficulty && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Difficulty:</span>
              <Badge variant={
                insight.difficulty <= 3 ? 'default' :
                insight.difficulty <= 6 ? 'secondary' :
                'destructive'
              }>
                {insight.difficulty <= 3 ? 'Easy' :
                 insight.difficulty <= 6 ? 'Medium' :
                 'Challenging'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Points */}
      {insight?.key_points && insight.key_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insight.key_points.slice(0, 3).map((point: string, index: number) => (
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
      {insight?.questions && insight.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Try These
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insight.questions.slice(0, 2).map((question: string, index: number) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Question {index + 1}:</p>
                  <p className="text-sm text-muted-foreground">{question}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scope indicator */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          {insight?.scope === 'chunk' ? 'Chapter' : 'Session'} insights
        </Badge>
      </div>
    </div>
  );
    </div>
  );
}