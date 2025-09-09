import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users } from 'lucide-react';
import { EnhancedChildCard } from '@/components/dashboard-v2/EnhancedChildCard';
import StatisticsCards from '@/components/dashboard-v2/StatisticsCards';
import CompactAlertsList from '@/components/dashboard-v2/CompactAlertsList';
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
  const [childDevice, setChildDevice] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    activeDevices: 0,
    totalChildren: 0,
    activeAlerts: 0,
    todaySessions: 0
  });

  // Load children on mount
  useEffect(() => {
    let isMounted = true;
    
  const loadChildren = async () => {
      try {
        const childrenData = await getChildrenWithAvatars();
        console.log('Loaded children data:', childrenData);
        if (!isMounted) return;
        
        setChildren(childrenData);
        
        // Auto-select first child if none selected
        if (!selectedChildId && childrenData.length > 0) {
          const firstChildId = childrenData[0].id;
          setSelectedChildId(firstChildId);
          navigate(`/monitoring?child=${firstChildId}`, { replace: true });
        }

        // Load statistics
        await loadStatistics(childrenData);
      } catch (error) {
        console.error('Failed to load children:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: `Failed to load children data: ${error.message}`,
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

  // Load statistics
  const loadStatistics = async (childrenData: any[]) => {
    try {
      // Count active devices
      const { data: devices } = await supabase
        .from('devices')
        .select('id, status')
        .eq('is_active', true);
      
      const activeDevices = devices?.filter(d => d.status === 'online').length || 0;

      // Count active alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('id, is_reviewed')
        .eq('is_reviewed', false);
      
      const activeAlerts = alertsData?.length || 0;

      // Count today's app sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: sessions } = await supabase
        .from('app_activity')
        .select('id')
        .gte('session_start', today.toISOString());
      
      const todaySessions = sessions?.length || 0;

      setStats({
        activeDevices,
        totalChildren: childrenData.length,
        activeAlerts,
        todaySessions
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // Load alerts for selected child
  useEffect(() => {
    if (!selectedChildId) return;
    
    let isMounted = true;
    
    const loadAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select(`
            id,
            child_id,
            alert_type,
            risk_level,
            ai_summary,
            flagged_at,
            is_reviewed,
            confidence_score,
            transcript_snippet,
            children!inner(name)
          `)
          .eq('child_id', selectedChildId)
          .order('flagged_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        if (isMounted) {
          // Format alerts with child names for CompactAlertsList
          const formattedAlerts = (data || []).map(alert => ({
            ...alert,
            child_name: alert.children?.name || 'Unknown'
          }));
          setAlerts(formattedAlerts);
        }
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    };

    const loadChildDevice = async () => {
      try {
        // Fetch child's assigned devices
        const { data, error } = await supabase
          .from('device_child_assignments')
          .select(`
            devices!inner(
              id,
              device_code,
              device_name,
              kind,
              status,
              last_seen
            )
          `)
          .eq('child_id', selectedChildId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (isMounted) {
          setChildDevice(data?.devices || null);
        }
      } catch (error) {
        console.error('Failed to load child device:', error);
        // Don't show toast error for device fetch as it's not critical
      }
    };

    loadAlerts();
    loadChildDevice();
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

  const handleViewAlertDetails = (alertId: string) => {
    console.log('View alert details:', alertId);
    // TODO: Implement alert details modal or navigation
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
              <Link to="/children">Add Child Profile</Link>
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

      {/* Statistics Overview */}
      <StatisticsCards 
        activeDevices={stats.activeDevices}
        totalChildren={stats.totalChildren}
        activeAlerts={stats.activeAlerts}
        todaySessions={stats.todaySessions}
      />

      {selectedChild && (
        <div className="space-y-6">
          <EnhancedChildCard
            child={selectedChild}
            device={childDevice}
            alerts={alerts.slice(0, 3)}
          />
          
          {/* Comprehensive Alerts Management */}
          {alerts.length > 0 ? (
            <CompactAlertsList
              alerts={alerts}
              onMarkReviewed={handleMarkReviewed}
              onViewDetails={handleViewAlertDetails}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                <p className="text-muted-foreground mb-4">
                  No safety alerts for {selectedChild.name} at this time.
                </p>
                <p className="text-sm text-muted-foreground">
                  Our AI monitoring continues to protect your child's digital experience.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}