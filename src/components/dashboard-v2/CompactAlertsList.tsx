
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, Eye, CheckCircle, Filter } from 'lucide-react';

interface Alert {
  id: string;
  child_id: string;
  child_name?: string;
  alert_type: string;
  risk_level: string;
  ai_summary: string;
  transcript_snippet?: string;
  confidence_score: number;
  is_reviewed: boolean;
  flagged_at: string;
}

interface CompactAlertsListProps {
  alerts: Alert[];
  onMarkReviewed: (alertId: string) => void;
  onViewDetails: (alertId: string) => void;
}

const CompactAlertsList = ({ alerts, onMarkReviewed, onViewDetails }: CompactAlertsListProps) => {
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterChild, setFilterChild] = useState<string>('all');

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'bullying': return '🚨';
      case 'grooming': return '⚠️';
      case 'profanity': return '🤬';
      case 'inappropriate_content': return '🔞';
      case 'stranger_contact': return '👤';
      default: return '⚡';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get unique values for filters
  const uniqueChildren = Array.from(new Set(alerts.map(a => ({ id: a.child_id, name: a.child_name })))).reduce((acc, curr) => {
    if (!acc.find(child => child.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as { id: string; name: string | undefined }[]);

  const uniqueTypes = [...new Set(alerts.map(a => a.alert_type))];
  const uniqueRiskLevels = [...new Set(alerts.map(a => a.risk_level))];

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterRisk !== 'all' && alert.risk_level !== filterRisk) return false;
    if (filterType !== 'all' && alert.alert_type !== filterType) return false;
    if (filterChild !== 'all' && alert.child_id !== filterChild) return false;
    return true;
  });

  const unreadCount = filteredAlerts.filter(alert => !alert.is_reviewed).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Alert Filters
            </div>
            <Badge variant="destructive" className="text-xs">
              {unreadCount} unread
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterChild} onValueChange={setFilterChild}>
              <SelectTrigger>
                <SelectValue placeholder="All children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {uniqueChildren.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="All risk levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                {uniqueRiskLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <Card key={alert.id} className={`${!alert.is_reviewed ? 'border-l-4 border-l-destructive' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{getAlertIcon(alert.alert_type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getRiskColor(alert.risk_level)} className="text-xs">
                        {alert.risk_level.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{alert.child_name}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(alert.flagged_at)}
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-1">
                      {alert.alert_type.replace('_', ' ').charAt(0).toUpperCase() + alert.alert_type.replace('_', ' ').slice(1)} Alert
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {alert.ai_summary}
                    </p>
                    
                    {alert.transcript_snippet && (
                      <div className="bg-muted/50 p-2 rounded text-xs italic mb-2">
                        "{alert.transcript_snippet.substring(0, 100)}..."
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Confidence: {Math.round(alert.confidence_score * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {!alert.is_reviewed && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onMarkReviewed(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Reviewed
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewDetails(alert.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Alerts Found</h3>
            <p className="text-muted-foreground">
              No alerts match your current filters. This is good news!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompactAlertsList;
