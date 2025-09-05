
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Clock, Check, X } from 'lucide-react';
import { ScheduleEditor, ScheduleJSON } from './ScheduleEditor';
import { toast } from 'sonner';
import { approveApp, blockApp, setSchedule } from '@/lib/osAppsApi';
import type { DeviceAppInventory, DeviceAppPolicy } from '@/types/os-apps';

interface DeviceAppCardProps {
  app: DeviceAppInventory;
  policy: DeviceAppPolicy | null;
  usage?: { totalSeconds: number; sessionsCount: number };
  onPolicyUpdate: () => void;
}

export const DeviceAppCard: React.FC<DeviceAppCardProps> = ({
  app,
  policy,
  usage,
  onPolicyUpdate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [localSchedule, setLocalSchedule] = useState<ScheduleJSON>(policy?.schedule || {});
  const [localReason, setLocalReason] = useState(policy?.blocked_reason || '');

  const needsApproval = app.installed_by === 'local' && !policy?.approved;

  const updatePolicy = async (updates: { approved?: boolean; hidden?: boolean; blocked_reason?: string }) => {
    if (!policy) return;
    
    setIsUpdating(true);
    try {
      if (updates.approved !== undefined) {
        // Use RPC for approval/blocking - convert device_id to string
        if (updates.approved) {
          await approveApp(String(policy.device_id), policy.app_id, updates.blocked_reason);
        } else {
          await blockApp(String(policy.device_id), policy.app_id, updates.blocked_reason);
        }
      } else if (updates.hidden !== undefined) {
        // For hidden status, use toggle RPC with current approval status
        await (updates.hidden ? blockApp : approveApp)(
          String(policy.device_id), 
          policy.app_id, 
          updates.blocked_reason
        );
      }

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
    if (!policy) return;
    
    setIsUpdating(true);
    try {
      await setSchedule(String(policy.device_id), policy.app_id, localSchedule);
      toast.success('Schedule updated');
      onPolicyUpdate();
      setShowSchedule(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveReason = async () => {
    await updatePolicy({ blocked_reason: localReason });
  };

  const formatUsage = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
            {usage && usage.totalSeconds > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Last 7d: {formatUsage(usage.totalSeconds)} ({usage.sessionsCount} sessions)
              </div>
            )}
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
