
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import ChildSwitcher from '@/components/ChildSwitcher';
import DeviceList from '@/components/DeviceList';
import AlertCard from '@/components/AlertCard';
import ConversationViewer from '@/components/ConversationViewer';
import NotificationHistory from '@/components/NotificationHistory';
import AIInsightCards from '@/components/AIInsightCards';
import ActivationWizard from '@/components/ActivationWizard';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, AlertTriangle, MessageSquare, Activity } from 'lucide-react';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Activation wizard state
  const [showActivationWizard, setShowActivationWizard] = useState(false);
  const [activationDeviceId, setActivationDeviceId] = useState('');
  const [activationDeviceCode, setActivationDeviceCode] = useState('');

  // Check for activation parameters on load
  useEffect(() => {
    const activate = searchParams.get('activate');
    const deviceId = searchParams.get('device_id');
    const deviceCode = searchParams.get('device_code');

    if (activate === '1' && deviceId) {
      setActivationDeviceId(deviceId);
      setActivationDeviceCode(deviceCode || '');
      setShowActivationWizard(true);
      
      // Clear the activation parameters from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('activate');
      newParams.delete('device_id');
      newParams.delete('device_code');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleWizardClose = () => {
    setShowActivationWizard(false);
    setActivationDeviceId('');
    setActivationDeviceCode('');
  };

  const dashboardStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Guardian AI Dashboard",
    "description": "Monitor and manage your family's gaming safety with AI-powered insights.",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <SEOHead
        title="Dashboard - Game Guardian AI™"
        description="Monitor your family's gaming activity, manage devices, and review AI-powered safety insights from your Guardian AI dashboard."
        keywords="gaming safety dashboard, parental controls, AI monitoring, family protection"
        canonicalUrl="https://gameguardianai.com/dashboard"
        structuredData={dashboardStructuredData}
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Family Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Monitor and manage your family's gaming safety
              </p>
            </div>
            <ChildSwitcher />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="children" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Children
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Guardian AI devices protecting your family
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Safety alerts in the last 24 hours
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gaming Sessions</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Monitored sessions today
                    </p>
                  </CardContent>
                </Card>
              </div>

              <AIInsightCards />
            </TabsContent>

            <TabsContent value="devices">
              <DeviceList />
            </TabsContent>

            <TabsContent value="children">
              <Card>
                <CardHeader>
                  <CardTitle>Children Management</CardTitle>
                  <CardDescription>
                    Manage your children's profiles and gaming preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Child management features coming soon. Use the device section to assign children to devices.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <AlertCard />
            </TabsContent>

            <TabsContent value="conversations">
              <ConversationViewer />
            </TabsContent>
          </Tabs>
        </main>

        {/* Activation Wizard */}
        <ActivationWizard
          deviceId={activationDeviceId}
          deviceCode={activationDeviceCode}
          isOpen={showActivationWizard}
          onClose={handleWizardClose}
        />
      </div>
    </>
  );
};

export default Dashboard;
