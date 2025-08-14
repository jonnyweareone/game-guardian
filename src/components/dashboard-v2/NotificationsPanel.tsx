
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Shield, MessageSquare, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import SeveritySelect from './SeveritySelect';
import DigestSelect from './DigestSelect';
import { getNotificationPreferences, upsertNotificationPreference, NotificationPreference } from '@/lib/dashboardV2Api';

interface Child {
  id: string;
  name: string;
  avatar_url?: string;
}

interface NotificationsPanelProps {
  scope: 'GLOBAL' | 'CHILD';
  child?: Child;
  className?: string;
}

const alertTypes = [
  { type: 'BULLYING' as const, label: 'Bullying & Harassment', icon: Shield, description: 'Threats, name-calling, exclusion' },
  { type: 'GROOMING' as const, label: 'Stranger Danger', icon: AlertTriangle, description: 'Inappropriate contact, requests for personal info' },
  { type: 'PROFANITY' as const, label: 'Inappropriate Language', icon: MessageSquare, description: 'Excessive profanity, offensive content' },
  { type: 'SYSTEM' as const, label: 'System Alerts', icon: Settings, description: 'Device status, connectivity issues' },
];

export default function NotificationsPanel({ scope, child, className }: NotificationsPanelProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [scope, child?.id]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences(scope, child?.id);
      setPreferences(prefs);
      console.log('Loaded preferences:', prefs);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const getPreference = (alertType: 'BULLYING' | 'GROOMING' | 'PROFANITY' | 'LOGIN' | 'SYSTEM'): NotificationPreference | undefined => {
    return preferences.find(p => p.alert_type === alertType && p.scope === scope && p.child_id === child?.id);
  };

  const updatePreference = async (alertType: 'BULLYING' | 'GROOMING' | 'PROFANITY' | 'LOGIN' | 'SYSTEM', updates: Partial<NotificationPreference>) => {
    const updateKey = `${alertType}-${scope}-${child?.id || 'global'}`;
    
    try {
      setUpdating(updateKey);
      const existing = getPreference(alertType);
      
      const preference = {
        ...existing,
        scope,
        child_id: child?.id,
        alert_type: alertType,
        ...updates
      };

      console.log('Updating preference:', preference);
      await upsertNotificationPreference(preference);
      await loadPreferences();
      
      toast.success(`${alertType.toLowerCase()} notification updated`);
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      toast.error('Failed to update notification preference');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base">
          {child && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={child.avatar_url} alt={child.name} />
              <AvatarFallback className="text-xs">
                {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <Bell className="h-4 w-4" />
          <span>
            {scope === 'GLOBAL' ? 'Global Notifications' : `${child?.name} Notifications`}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {alertTypes.map((alertType) => {
          const preference = getPreference(alertType.type);
          const isEnabled = preference !== undefined && preference.min_severity < 10;
          const Icon = alertType.icon;
          const updateKey = `${alertType.type}-${scope}-${child?.id || 'global'}`;
          const isUpdating = updating === updateKey;
          
          return (
            <div key={alertType.type} className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{alertType.label}</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {alertType.description}
                      </p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      disabled={isUpdating}
                      onCheckedChange={(enabled) => {
                        console.log(`Toggling ${alertType.type} to ${enabled}`);
                        if (enabled) {
                          updatePreference(alertType.type, {
                            min_severity: 2,
                            channel_ids: [],
                            digest: 'NONE'
                          });
                        } else {
                          // Set a very high severity to effectively disable
                          updatePreference(alertType.type, { 
                            min_severity: 10,
                            channel_ids: [],
                            digest: 'NONE'
                          });
                        }
                      }}
                    />
                  </div>
                  
                  {isEnabled && preference && (
                    <div className="grid grid-cols-2 gap-3 ml-0">
                      <div className="space-y-1">
                        <Label className="text-xs">Minimum Severity</Label>
                        <SeveritySelect
                          value={preference.min_severity}
                          onValueChange={(severity) => {
                            console.log(`Changing severity for ${alertType.type} to ${severity}`);
                            updatePreference(alertType.type, { min_severity: severity });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Delivery</Label>
                        <DigestSelect
                          value={preference.digest}
                          onValueChange={(digest) => {
                            console.log(`Changing digest for ${alertType.type} to ${digest}`);
                            updatePreference(alertType.type, { digest });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
