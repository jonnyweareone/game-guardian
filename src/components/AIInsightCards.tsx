import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Heart,
  Lightbulb,
  Target
} from 'lucide-react';

interface InsightCardsProps {
  insights: {
    weeklyStats: {
      totalSessions: number;
      positiveInteractions: number;
      concerningInteractions: number;
      criticalAlerts: number;
      averageSentiment: number;
    };
    talkingPoints: string[];
    emotionalTrends: Array<{
      child: string;
      trend: string;
      description: string;
    }>;
    onlineFriends: Record<string, string[]>;
  };
}

const AIInsightCards = ({ insights }: InsightCardsProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-safe" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-critical" />;
      case 'concerning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-safe';
      case 'negative': return 'text-critical';
      case 'concerning': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* What to Talk About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            What to Talk About
          </CardTitle>
          <CardDescription>
            AI-generated conversation starters based on recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.talkingPoints.slice(0, 3).map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          {insights.talkingPoints.length > 3 && (
            <Button variant="ghost" size="sm" className="mt-3">
              View {insights.talkingPoints.length - 3} more suggestions
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Emotional Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Emotional Trends
          </CardTitle>
          <CardDescription>
            How your children are feeling during their gaming sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.emotionalTrends.map((trend, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon(trend.trend)}
                  <Badge variant="outline" className={getTrendColor(trend.trend)}>
                    {trend.child}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {trend.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Online Friends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Online Friends
          </CardTitle>
          <CardDescription>
            Regular gaming companions your children interact with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(insights.onlineFriends).map(([child, friends]) => (
              <div key={child}>
                <h4 className="font-medium text-sm mb-2">{child}'s Friends</h4>
                <div className="flex flex-wrap gap-1">
                  {friends.map((friend, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {friend}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High-Risk Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            High-Risk Interactions
          </CardTitle>
          <CardDescription>
            Interactions that require attention or follow-up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-critical mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Stranger Contact</p>
                <p className="text-xs text-muted-foreground">
                  Lily interacted with unknown player requesting personal info
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-critical mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Cyberbullying</p>
                <p className="text-xs text-muted-foreground">
                  Jake experienced harassment during gaming session
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Recommendation</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Consider having conversations about online safety and setting up
              additional privacy controls for your children's gaming accounts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightCards;