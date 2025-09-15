import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Router, 
  Activity, 
  Settings, 
  LogOut,
  Wifi,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ISPSession {
  email: string;
  ispCode: string;
  role: string;
  loginTime: number;
}

const ISPDashboard = () => {
  const [session, setSession] = useState<ISPSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSession = localStorage.getItem('isp-session');
    if (!savedSession) {
      navigate('/isp/auth');
      return;
    }
    
    try {
      const parsed = JSON.parse(savedSession);
      setSession(parsed);
    } catch {
      navigate('/isp/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isp-session');
    navigate('/isp/auth');
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  // Mock data for ISP dashboard
  const stats = {
    totalCustomers: 1247,
    activeBridges: 1189,
    offlineBridges: 58,
    alertsCount: 12
  };

  const recentActivity = [
    { id: 1, type: 'bridge_online', device: 'GW-001-ABC123', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'policy_update', device: 'GW-002-DEF456', time: '15 minutes ago', status: 'success' },
    { id: 3, type: 'bridge_offline', device: 'GW-003-GHI789', time: '1 hour ago', status: 'warning' },
    { id: 4, type: 'new_customer', device: 'GW-004-JKL012', time: '3 hours ago', status: 'info' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">ISP Portal</h1>
                <p className="text-sm text-muted-foreground">{session.ispCode}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {session.email}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bridges</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeBridges.toLocaleString()}</p>
                </div>
                <Wifi className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offline Bridges</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.offlineBridges}</p>
                </div>
                <Router className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.alertsCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Bridge Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-orange-500' :
                        activity.status === 'info' ? 'bg-blue-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{activity.device}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {activity.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Router className="w-4 h-4 mr-2" />
                Manage Bridges
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                View Customers
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Network Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Policy Templates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All systems operational. Bridge connectivity: 95.3% | Policy sync: Active | Customer portal: Online
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ISPDashboard;