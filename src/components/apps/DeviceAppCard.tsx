import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Clock, Check, X } from 'lucide-react';
import { ScheduleEditor, ScheduleJSON } from './ScheduleEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeviceApp {
  device_id: string;
  app_id: string;
  name: string | null;
  version: string | null;
  source: string | null;
  installed_by: string | null;
  seen_at: string;
}

interface AppPolicy {
  device_id: string;
  app_id: string;
  approved: boolean;
  hidden: boolean;
  schedule: ScheduleJSON;
  blocked_reason: string | null;
  approved_at: string | null;
}

interface DeviceAppCardProps {
  app: DeviceApp;
  policy: AppPolicy | null;
  onPolicyUpdate: () => void;
}

export const DeviceAppCard: React.FC<DeviceAppCardProps> = ({
  app,
  policy,
  onPolicyUpdate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [localSchedule, setLocalSchedule] = useState<ScheduleJSON>(policy?.schedule || {});
  const [localReason, setLocalReason] = useState(policy?.blocked_reason || '');

  const needsApproval = app.installed_by === 'local' && !policy?.approved;

  const updatePolicy = async (updates: Partial<AppPolicy>) => {
    if (!policy) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('device_app_policy')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          ...(updates.approved === true && { approved_at: new Date().toISOString() })
        })
        .eq('device_id', policy.device_id)
        .eq('app_id', policy.app_id);

      if (error) throw error;

      toast.success('App policy updated');
      onPolicyUpdate();
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update app policy');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveSchedule = async () => {
    await updatePolicy({ schedule: localSchedule });
    setShowSchedule(false);
  };

  const saveReason = async () => {
    await updatePolicy({ blocked_reason: localReason });
  };

  return (
    <Card className={`${needsApproval ? 'border-amber-500 bg-amber-50/10' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-xs font-mono">
              {app.source?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <CardTitle className="text-base">{app.name || app.app_id}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{app.version}</span>
              <Badge variant="outline" className="text-xs">
                {app.source}
              </Badge>
              {app.installed_by === 'local' && (
                <Badge variant="secondary" className="text-xs">
                  Desktop Install
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {needsApproval && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} />
            <span className="text-xs">Awaiting Approval</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {policy && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor={`approved-${app.app_id}`}>Approved</Label>
              <Switch
                id={`approved-${app.app_id}`}
                checked={policy.approved}
                disabled={isUpdating}
                onCheckedChange={(checked) => updatePolicy({ approved: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor={`hidden-${app.app_id}`}>Hidden</Label>
              <Switch
                id={`hidden-${app.app_id}`}
                checked={policy.hidden}
                disabled={isUpdating}
                onCheckedChange={(checked) => updatePolicy({ hidden: checked })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Time Controls</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <Clock size={14} className="mr-1" />
                  {showSchedule ? 'Hide Schedule' : 'Set Schedule'}
                </Button>
              </div>

              {showSchedule && (
                <div className="space-y-3">
                  <ScheduleEditor
                    value={localSchedule}
                    onChange={setLocalSchedule}
                    title="Allowed Times"
                    subtitle="Set when this app can be used"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveSchedule} disabled={isUpdating}>
                      <Check size={14} className="mr-1" />
                      Save Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalSchedule(policy.schedule || {});
                        setShowSchedule(false);
                      }}
                    >
                      <X size={14} className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`reason-${app.app_id}`}>Block Reason (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id={`reason-${app.app_id}`}
                  value={localReason}
                  onChange={(e) => setLocalReason(e.target.value)}
                  placeholder="Why is this app restricted?"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveReason}
                  disabled={isUpdating}
                >
                  Save
                </Button>
              </div>
            </div>

            {policy.approved_at && (
              <div className="text-xs text-muted-foreground">
                Approved: {new Date(policy.approved_at).toLocaleDateString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};