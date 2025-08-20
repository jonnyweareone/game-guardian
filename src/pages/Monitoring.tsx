import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users } from 'lucide-react';
import EnhancedChildCard from '@/components/dashboard-v2/EnhancedChildCard';
import { getChildrenWithAvatars } from '@/lib/dashboardV2Api';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Monitoring() {
  const query = useQuery();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(query.get('child'));
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Load children on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadChildren = async () => {
      try {
        const childrenData = await getChildrenWithAvatars();
        if (!isMounted) return;
        
        setChildren(childrenData);
        
        // Auto-select first child if none selected
        if (!selectedChildId && childrenData.length > 0) {
          const firstChildId = childrenData[0].id;
          setSelectedChildId(firstChildId);
          navigate(`/monitoring?child=${firstChildId}`, { replace: true });
        }
      } catch (error) {
        console.error('Failed to load children:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load children data',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChildren();
    return () => { isMounted = false; };
  }, [selectedChildId, navigate, toast]);

  // Load alerts for selected child
  useEffect(() => {
    if (!selectedChildId) return;
    
    let isMounted = true;
    
    const loadAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('id,alert_type,risk_level,ai_summary,flagged_at,is_reviewed,confidence_score')
          .eq('child_id', selectedChildId)
          .order('flagged_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        if (isMounted) {
          setAlerts(data || []);
        }
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    };

    loadAlerts();
    return () => { isMounted = false; };
  }, [selectedChildId]);

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    navigate(`/monitoring?child=${childId}`, { replace: true });
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_reviewed: true, reviewed_at: new Date().toISOString() })
        .eq('id', alertId);
      
      if (error) throw error;
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_reviewed: true } : alert
      ));
      
      toast({
        title: 'Alert marked as reviewed',
        description: 'The alert has been successfully reviewed.',
      });
    } catch (error) {
      console.error('Failed to mark alert as reviewed:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark alert as reviewed',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading monitoring dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No children profiles found</h3>
              <p className="text-muted-foreground">
                Add a child profile to start monitoring their digital activity
              </p>
            </div>
            <Button asChild>
              <a href="/children">Add Child Profile</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedChild = children.find(child => child.id === selectedChildId);
  const unreadAlerts = alerts.filter(alert => !alert.is_reviewed).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor your children's digital activities and safety alerts</p>
        </div>
        
        {children.length > 1 && (
          <Select value={selectedChildId || ''} onValueChange={handleChildChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedChild && (
        <div className="space-y-6">
          <EnhancedChildCard
            child={selectedChild}
            sessions={[]} // Empty for now - will be populated when device data flows
            totalTodayMinutes={0}
            unreadAlerts={unreadAlerts}
            isExpanded={expandedCards[selectedChild.id] || false}
            onToggleExpanded={() => {
              setExpandedCards(prev => ({
                ...prev,
                [selectedChild.id]: !prev[selectedChild.id]
              }));
            }}
            onAddTime={() => {}}
            onPauseDevice={() => {}}
            onViewFullActivity={() => {}}
            onRemoveChild={() => {}}
          />
          
          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 10).map(alert => (
                    <div key={alert.id} className="flex items-start justify-between gap-3 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium capitalize">{alert.alert_type.replace('_', ' ')}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                            alert.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.risk_level}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.ai_summary}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.flagged_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={alert.is_reviewed ? "secondary" : "default"}
                        disabled={alert.is_reviewed}
                        onClick={() => handleMarkReviewed(alert.id)}
                      >
                        {alert.is_reviewed ? 'Reviewed' : 'Mark Reviewed'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}