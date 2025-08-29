import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface PendingApp {
  device_id: string;
  app_id: string;
  name: string | null;
  source: string | null;
  installed_by: string | null;
  seen_at: string;
  device_name: string | null;
  child_name: string | null;
  child_id: string | null;
}

export const AppApprovalNotification: React.FC = () => {
  const { user } = useAuth();
  const [pendingApps, setPendingApps] = useState<PendingApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadPendingApps();

    // Set up real-time subscription for new apps
    const subscription = supabase
      .channel('app-approvals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_app_inventory',
          filter: `installed_by=eq.local`
        },
        () => {
          loadPendingApps();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadPendingApps = async () => {
    if (!user) return;

    try {
      // Get pending apps that need approval
      const { data, error } = await supabase
        .from('device_app_inventory')
        .select(`
          *,
          devices!inner(
            id,
            device_name,
            child_id,
            parent_id,
            children(
              id,
              name
            )
          ),
          device_app_policy!left(
            approved,
            hidden
          )
        `)
        .eq('devices.parent_id', user.id)
        .eq('installed_by', 'local')
        .is('device_app_policy.approved', false);

      if (error) throw error;

      // Transform the data to make it easier to work with
      const transformedData = (data || []).map(item => ({
        device_id: item.device_id,
        app_id: item.app_id,
        name: item.name,
        source: item.source,
        installed_by: item.installed_by,
        seen_at: item.seen_at,
        device_name: (item.devices as any)?.device_name,
        child_name: ((item.devices as any)?.children as any)?.name,
        child_id: ((item.devices as any)?.children as any)?.id
      }));

      setPendingApps(transformedData);
    } catch (error) {
      console.error('Error loading pending apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (app: PendingApp, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('device_app_policy')
        .update({
          approved,
          hidden: !approved,
          approved_at: approved ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('device_id', app.device_id)
        .eq('app_id', app.app_id);

      if (error) throw error;

      toast.success(`${app.name} ${approved ? 'approved' : 'blocked'}`);
      loadPendingApps(); // Refresh the list
    } catch (error) {
      console.error('Error updating app approval:', error);
      toast.error('Failed to update app approval');
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (pendingApps.length === 0) {
    return null; // Don't show notification if no pending apps
  }

  return (
    <Card className="border-amber-500 bg-amber-50/10">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <div>
          <CardTitle className="text-base">
            {pendingApps.length} App{pendingApps.length !== 1 ? 's' : ''} Need Approval
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            New apps installed from desktop require your approval
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {pendingApps.slice(0, 3).map((app) => (
          <div
            key={`${app.device_id}-${app.app_id}`}
            className="flex items-center justify-between p-3 bg-background rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-xs font-mono">
                  {app.source?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <div className="font-medium">{app.name || app.app_id}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="h-3 w-3" />
                  <span>{app.device_name}</span>
                  {app.child_name && (
                    <>
                      <span>•</span>
                      <span>{app.child_name}</span>
                    </>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {app.source}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApproval(app, true)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApproval(app, false)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Block
              </Button>
            </div>
          </div>
        ))}

        {pendingApps.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground mb-2">
              +{pendingApps.length - 3} more apps need approval
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/os-apps">
              View All Apps
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};