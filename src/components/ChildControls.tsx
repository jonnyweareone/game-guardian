import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AppRailItem, AppPolicyPatch, DeviceAppItem } from '@/components/AppRailItem';
import { getChildTimePolicy, listChildApps, upsertChildTimePolicy } from '@/lib/api';

type ChildControlsProps = {
  childId: string;
  childName: string;
  isDemoMode: boolean;
  childPolicies: Record<string, { allowed?: boolean; daily_limit_minutes?: number | null; enforced_hours?: string[] | null }>;
  onPolicyChange: (appId: string, patch: AppPolicyPatch) => void;
};

export default function ChildControls({
  childId,
  childName,
  isDemoMode,
  childPolicies,
  onPolicyChange,
}: ChildControlsProps) {
  const { toast } = useToast();

  // Apps for this child (effective, from SQL view)
  const [apps, setApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Time policy state
  const [dailyMinutes, setDailyMinutes] = useState<number | ''>('');
  const [bedtime, setBedtime] = useState<string>(''); // int4range encoded e.g. "[21,7)"
  const [savingTime, setSavingTime] = useState(false);
  const [loadingTime, setLoadingTime] = useState(true);

  useEffect(() => {
    if (!childId || isDemoMode) {
      setApps([]);
      setLoadingApps(false);
      setLoadingTime(false);
      return;
    }

    setLoadingApps(true);
    listChildApps(childId)
      .then((data) => setApps(data || []))
      .catch((e) => {
        console.error('Failed to load child apps', e);
        toast({
          title: 'Failed to load apps',
          description: e.message,
          variant: 'destructive',
        });
      })
      .finally(() => setLoadingApps(false));

    setLoadingTime(true);
    getChildTimePolicy(childId)
      .then((policy) => {
        if (policy) {
          setDailyMinutes(policy.daily_total_minutes ?? '');
          // Bedtime stored as int4range (text), keep as-is for now
          setBedtime(policy.bedtime ?? '');
        } else {
          setDailyMinutes('');
          setBedtime('');
        }
      })
      .catch((e) => {
        console.error('Failed to load time policy', e);
        toast({
          title: 'Failed to load time policy',
          description: e.message,
          variant: 'destructive',
        });
      })
      .finally(() => setLoadingTime(false));
  }, [childId, isDemoMode, toast]);

  const games = useMemo(() => apps.filter(a => (a.category ?? 'App') === 'Game'), [apps]);
  const otherApps = useMemo(() => apps.filter(a => (a.category ?? 'App') !== 'Game'), [apps]);

  const asDeviceAppItem = (row: any): DeviceAppItem => ({
    app_id: row.app_id,
    name: row.name,
    icon_url: row.icon_url,
    category: row.category ?? 'App',
    pegi_rating: null, // not present on the view; leave null
  });

  const handleSaveTime = async () => {
    if (isDemoMode) {
      toast({ title: 'Demo mode', description: 'Time policy changes are disabled in demo mode.' });
      return;
    }
    setSavingTime(true);
    try {
      const payload = {
        daily_total_minutes: dailyMinutes === '' ? null : Number(dailyMinutes),
        bedtime: bedtime || null,
      };
      await upsertChildTimePolicy(childId, payload);
      toast({ title: 'Saved', description: 'Child time policy updated.' });
    } catch (e: any) {
      console.error('Failed to save time policy', e);
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSavingTime(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{childName} — Time control</CardTitle>
          <CardDescription>Set daily screen time and quiet hours.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="daily-total">Daily total (minutes)</Label>
            <Input
              id="daily-total"
              type="number"
              inputMode="numeric"
              placeholder="No cap"
              min={0}
              disabled={isDemoMode || loadingTime}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(e.target.value ? Number(e.target.value) : '')}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bedtime (quiet hours)</Label>
            <Select
              disabled={isDemoMode || loadingTime}
              value={bedtime ?? ''}
              onValueChange={(v) => setBedtime(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="[21,7)">School night (21–07)</SelectItem>
                <SelectItem value="[22,6)">Late night (22–06)</SelectItem>
                <SelectItem value="[0,6)">Night block (00–06)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Interpreted in local time; enforcement handled by device/OS.
            </p>
          </div>
          <div className="flex items-end">
            <Button className="w-full md:w-auto" onClick={handleSaveTime} disabled={isDemoMode || savingTime || loadingTime}>
              {savingTime ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3">
          <h3 className="text-xl font-semibold">Games</h3>
          <p className="text-sm text-muted-foreground">Manage per-game access and limits for {childName}.</p>
        </div>
        {loadingApps ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Loading games…</CardContent></Card>
        ) : games.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No games reported yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {games.map((row) => (
              <AppRailItem
                key={`child-game-${row.app_id}`}
                app={asDeviceAppItem(row)}
                policy={childPolicies[row.app_id]}
                onChange={(patch) => onPolicyChange(row.app_id, patch)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3">
          <h3 className="text-xl font-semibold">Apps</h3>
          <p className="text-sm text-muted-foreground">Manage app access and limits for {childName}.</p>
        </div>
        {loadingApps ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Loading apps…</CardContent></Card>
        ) : otherApps.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No apps reported yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {otherApps.map((row) => (
              <AppRailItem
                key={`child-app-${row.app_id}`}
                app={asDeviceAppItem(row)}
                policy={childPolicies[row.app_id]}
                onChange={(patch) => onPolicyChange(row.app_id, patch)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
