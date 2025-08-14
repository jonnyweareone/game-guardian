
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Bell, User, Settings } from 'lucide-react';
import VerificationSection from '@/components/VerificationSection';
import NotificationChannelManager from '@/components/dashboard-v2/NotificationChannelManager';
import NotificationsPanel from '@/components/dashboard-v2/NotificationsPanel';
import { useAuth } from '@/hooks/useAuth';

export default function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('verification');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">Please sign in to access your account settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account verification, security, and notification preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VerificationSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Security features like 2FA and passkeys will be available in a future update.
                </p>
                {/* TODO: Import and integrate existing 2FA/Passkey components from Security.tsx */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <NotificationChannelManager />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="space-y-6">
            <NotificationsPanel scope="GLOBAL" />
            
            <Card>
              <CardHeader>
                <CardTitle>Child-Specific Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Child-specific notification preferences can be configured from the individual child pages in your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
