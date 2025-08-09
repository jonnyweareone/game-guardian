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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AppRailItem, AppPolicyPatch, DeviceAppItem } from '@/components/AppRailItem';
import { getChildTimePolicy, listChildApps, upsertChildTimePolicy, upsertAppCategoryPolicy, listAppCategoryPolicies, addTimeTokens, getCurrentActivity } from '@/lib/api';

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

  // Category policies and activity
  const CATEGORIES = ['Game','App','Social','Education','Streaming','Messaging','Browser','Other'] as const;
  type Cat = typeof CATEGORIES[number];
  const [categoryPolicies, setCategoryPolicies] = useState<Record<string, { allowed: boolean; daily_limit_minutes: number | null }>>({});
  const [currentActivity, setCurrentActivity] = useState<{ app_id: string; session_start: string } | null>(null);

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
          setBedtime(typeof policy.bedtime === 'string' ? policy.bedtime : '');
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

  // Load category policies and current activity
  useEffect(() => {
    if (!childId || isDemoMode) return;

    listAppCategoryPolicies('child', childId)
      .then((rows) => {
        const map: Record<string, { allowed: boolean; daily_limit_minutes: number | null }> = {};
        (rows || []).forEach((r: any) => {
          map[r.category] = { allowed: !!r.allowed, daily_limit_minutes: r.daily_limit_minutes ?? null };
        });
        setCategoryPolicies(map);
      })
      .catch((e) => console.error('Load category policies failed', e));

    getCurrentActivity(childId)
      .then((act) => setCurrentActivity(act))
      .catch((e) => console.error('Load current activity failed', e));
  }, [childId, isDemoMode]);

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

  // Helpers
  const getAppName = (id: string) => {
    const found = apps.find((a) => a.app_id === id);
    return found?.name || id;
  };

  const handleCategoryToggle = async (category: Cat, allowed: boolean) => {
    if (isDemoMode) {
      toast({ title: 'Demo mode', description: 'Category changes are disabled in demo mode.' });
      return;
    }
    try {
      await upsertAppCategoryPolicy({ subject_type: 'child', subject_id: childId, category, allowed });
      setCategoryPolicies((prev) => ({
        ...prev,
        [category]: { allowed, daily_limit_minutes: prev[category]?.daily_limit_minutes ?? null },
      }));
      toast({ title: 'Saved', description: `${category} ${allowed ? 'allowed' : 'blocked'}` });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleCategoryMinutes = async (category: Cat, minutes: number | null) => {
    if (isDemoMode) {
      toast({ title: 'Demo mode', description: 'Category changes are disabled in demo mode.' });
      return;
    }
    try {
      await upsertAppCategoryPolicy({ subject_type: 'child', subject_id: childId, category, daily_limit_minutes: minutes });
      setCategoryPolicies((prev) => ({
        ...prev,
        [category]: { allowed: prev[category]?.allowed ?? true, daily_limit_minutes: minutes },
      }));
      toast({ title: 'Saved', description: `${category} limit updated` });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleTokenDelta = async (delta: number) => {
    if (isDemoMode) {
      toast({ title: 'Demo mode', description: 'Tokens are disabled in demo mode.' });
      return;
    }
    try {
      await addTimeTokens(childId, delta, delta > 0 ? 'Bonus time' : 'Deducted');
      toast({ title: 'Updated', description: `${delta > 0 ? '+' : ''}${delta} minutes` });
    } catch (e: any) {
      toast({ title: 'Token update failed', description: e.message, variant: 'destructive' });
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
      {/* Now + quick tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Now</CardTitle>
          <CardDescription>Live activity and quick actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            {currentActivity ? (
              <div>
                <div className="text-sm text-muted-foreground">Currently playing</div>
                <div className="text-base font-medium">{getAppName(currentActivity.app_id)}</div>
                <div className="text-xs text-muted-foreground">since {new Date(currentActivity.session_start).toLocaleTimeString()}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No active session</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleTokenDelta(15)} disabled={isDemoMode}>+15 min</Button>
            <Button variant="outline" onClick={() => handleTokenDelta(-15)} disabled={isDemoMode}>-15 min</Button>
          </div>
        </CardContent>
      </Card>

      {/* Category policies */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Allow or limit by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CATEGORIES.map((cat) => {
            const cp = categoryPolicies[cat] || { allowed: true, daily_limit_minutes: null };
            return (
              <div key={cat} className="flex items-center gap-4">
                <div className="min-w-[140px] font-medium">{cat}</div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">{cp.allowed ? 'Allowed' : 'Blocked'}</Label>
                  <Switch checked={cp.allowed} onCheckedChange={(v) => handleCategoryToggle(cat as Cat, !!v)} />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Label htmlFor={`cat-${cat}-mins`} className="text-sm">Daily (min)</Label>
                  <Input
                    id={`cat-${cat}-mins`}
                    type="number"
                    inputMode="numeric"
                    className="w-24"
                    placeholder="mins"
                    value={cp.daily_limit_minutes ?? ''}
                    onChange={(e) => handleCategoryMinutes(cat as Cat, e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
            );
          })}
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
