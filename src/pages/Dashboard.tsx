import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AlertCard from '@/components/AlertCard';

interface DashboardAlert {
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

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface Device {
  id: string;
  device_name?: string;
  is_active: boolean;
  child_name?: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (childrenError) throw childrenError;
      
      // Fetch alerts with child names
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select(`
          *,
          children!inner(name)
        `)
        .order('flagged_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;

      // Fetch devices with child names
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select(`
          *,
          children(name)
        `)
        .order('created_at', { ascending: false });

      if (devicesError) throw devicesError;

      setChildren(childrenData || []);
      setAlerts(alertsData?.map(alert => ({
        ...alert,
        child_name: alert.children?.name
      })) || []);
      setDevices(devicesData?.map(device => ({
        ...device,
        child_name: device.children?.name
      })) || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_reviewed: true, 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_reviewed: true }
          : alert
      ));

      toast({
        title: "Alert reviewed",
        description: "The alert has been marked as reviewed."
      });
    } catch (error: any) {
      toast({
        title: "Error updating alert",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeDevices = devices.filter(d => d.is_active).length;
  const unreviewedAlerts = alerts.filter(a => !a.is_reviewed).length;
  const criticalAlerts = alerts.filter(a => a.risk_level === 'critical' && !a.is_reviewed).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Game Guardian AI™</h1>
                <p className="text-sm text-muted-foreground">Parent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Children Protected</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Shield className="h-4 w-4 text-safe" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDevices}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unreviewed Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreviewedAlerts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalAlerts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button className="h-16 flex flex-col gap-2">
            <Plus className="h-5 w-5" />
            Add Child Profile
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Shield className="h-5 w-5" />
            Pair New Device
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </div>

        {/* Alerts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recent Alerts</h2>
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalAlerts} Critical Alert{criticalAlerts > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-safe mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  No concerning activity detected. Your children are gaming safely.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkReviewed={handleMarkReviewed}
                />
              ))}
            </div>
          )}
        </div>

        {/* Empty States for New Users */}
        {children.length === 0 && (
          <Alert className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Get started:</strong> Add your first child profile and pair a Game Guardian device to begin monitoring.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
};

export default Dashboard;