import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface AlertCardProps {
  alert: Alert;
  onMarkReviewed: (id: string) => void;
}

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical': return 'critical';
    case 'high': return 'warning';
    case 'medium': return 'warning';
    case 'low': return 'safe';
    default: return 'muted';
  }
};

const getAlertTypeLabel = (type: string) => {
  const labels = {
    bullying: 'Bullying',
    grooming: 'Grooming',
    explicit_language: 'Explicit Language',
    violent_content: 'Violent Content',
    inappropriate_sharing: 'Inappropriate Sharing',
    cyberbullying: 'Cyberbullying'
  };
  return labels[type as keyof typeof labels] || type;
};

const AlertCard = ({ alert, onMarkReviewed }: AlertCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const riskColor = getRiskColor(alert.risk_level);

  return (
    <Card className={`border-l-4 ${
      riskColor === 'critical' ? 'border-l-critical' :
      riskColor === 'warning' ? 'border-l-warning' :
      riskColor === 'safe' ? 'border-l-safe' : 'border-l-muted'
    } ${alert.is_reviewed ? 'bg-muted/30' : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${
              riskColor === 'critical' ? 'text-critical' :
              riskColor === 'warning' ? 'text-warning' :
              'text-muted-foreground'
            }`} />
            <Badge variant={riskColor === 'critical' ? 'destructive' : 'secondary'}>
              {alert.risk_level.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {getAlertTypeLabel(alert.alert_type)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(alert.flagged_at), { addSuffix: true })}
          </div>
        </div>
        {alert.child_name && (
          <p className="text-sm font-medium text-foreground">
            Child: {alert.child_name}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            {alert.ai_summary}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Confidence: {Math.round(alert.confidence_score * 100)}%
            </span>
          </div>

          {alert.transcript_snippet && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-auto p-2 text-xs"
              >
                {showDetails ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show Details
                  </>
                )}
              </Button>
              
              {showDetails && (
                <div className="bg-muted p-3 rounded-md border">
                  <p className="text-xs text-muted-foreground mb-1">Transcript Snippet:</p>
                  <p className="text-sm text-foreground italic">
                    "{alert.transcript_snippet}"
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {alert.is_reviewed && (
                <Badge variant="outline" className="text-safe">
                  ✓ Reviewed
                </Badge>
              )}
            </div>
            
            {!alert.is_reviewed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkReviewed(alert.id)}
              >
                Mark as Reviewed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;