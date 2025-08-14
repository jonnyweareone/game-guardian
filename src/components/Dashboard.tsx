import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ActivationWizard from './ActivationWizard';

interface DashboardStats {
  activeDevices: number;
  totalChildren: number;
  alertsToday: number;
  activeTime: string;
}

interface Alert {
  id: string;
  alert_type: string;
  risk_level: string;
  ai_summary: string;
  created_at: string;
  child_id: string;
  children: {
    name: string;
  };
}

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<DashboardStats>({
    activeDevices: 0,
    totalChildren: 0,
    alertsToday: 0,
    activeTime: '0h 0m'
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivationWizard, setShowActivationWizard] = useState(false);
  const [activationDeviceId, setActivationDeviceId] = useState('');
  const [activationDeviceCode, setActivationDeviceCode] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Check for activation parameters on component mount
  useEffect(() => {
    const shouldActivate = searchParams.get('activate') === '1';
    const deviceId = searchParams.get('device_id');
    const deviceCode = searchParams.get('device_code');
    
    if (shouldActivate && deviceId && deviceCode) {
      console.log('Dashboard: Opening activation wizard for device:', deviceId, deviceCode);
      setActivationDeviceId(deviceId);
      setActivationDeviceCode(deviceCode);
      setShowActivationWizard(true);
      
      // Clear the search params to avoid showing the wizard again on refresh
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('activate');
        newParams.delete('device_id');
        newParams.delete('device_code');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load stats
      const [devicesData, childrenData, alertsData] = await Promise.all([
        supabase.from('devices').select('id, status').eq('parent_id', user.id),
        supabase.from('children').select('id').eq('parent_id', user.id),
        supabase
          .from('alerts')
          .select(`
            id,
            alert_type,
            risk_level,
            ai_summary,
            created_at,
            child_id,
            children!inner(name)
          `)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .eq('children.parent_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      
      setStats({
        activeDevices: devicesData.data?.filter(d => d.status === 'online').length || 0,
        totalChildren: childrenData.data?.length || 0,
        alertsToday: alertsData.data?.length || 0,
        activeTime: '2h 34m' // This would come from app_activity data
      });
      
      setRecentAlerts(alertsData.data as Alert[] || []);
    } catch (error: any) {
      toast({
        title: 'Error loading dashboard',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleActivationComplete = () => {
    setShowActivationWizard(false);
    setActivationDeviceId('');
    setActivationDeviceCode('');
    
    // Refresh dashboard data to show the newly activated device
    loadDashboardData();
    
    toast({
      title: 'Device activated successfully!',
      description: 'Your Guardian AI device is now protecting your family.'
    });
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Family Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and protect your family's digital activities
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Protected
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDevices}</div>
              <p className="text-xs text-muted-foreground">
                Monitoring your family
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Children</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChildren}</div>
              <p className="text-xs text-muted-foreground">
                Protected profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts Today</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.alertsToday}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTime}</div>
              <p className="text-xs text-muted-foreground">
                Today's usage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              Latest notifications from your Guardian AI devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent alerts - your family is safe!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getRiskBadgeVariant(alert.risk_level)}>
                          {alert.risk_level}
                        </Badge>
                        <span className="text-sm font-medium">
                          {alert.children.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.ai_summary}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                Add Child Profile
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Shield className="h-6 w-6" />
                Pair New Device
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activation Wizard */}
      <ActivationWizard
        deviceId={activationDeviceId}
        deviceCode={activationDeviceCode}
        isOpen={showActivationWizard}
        onClose={handleActivationComplete}
      />
    </div>
  );
};

export default Dashboard;
