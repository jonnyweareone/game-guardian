
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

interface InstalledApp {
  app_id: string;
  name: string;
  icon_url: string | null;
  category: string | null;
  warning_level: number;
  warning_notes: string | null;
  rating_system: string | null;
  age_rating: string | null;
  guide_url: string | null;
  has_ugc: boolean | null;
  has_chat: boolean | null;
  monetization: string | null;
  selected: boolean;
}

interface AppControlTabProps {
  childId: string;
  deviceId?: string;
}

export default function AppControlTab({ childId, deviceId }: AppControlTabProps) {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingApps, setSavingApps] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Load installed/selected apps for this child
  const loadInstalledApps = async () => {
    try {
      const { data, error } = await supabase
        .from('child_app_selections')
        .select(`
          app_id,
          selected,
          app_catalog:app_id (
            id,
            name,
            icon_url,
            category,
            rating_system,
            age_rating,
            has_ugc,
            has_chat,
            monetization,
            warning_level,
            warning_notes,
            guide_url
          )
        `)
        .eq('child_id', childId)
        .eq('selected', true);

      if (error) throw error;

      const installedApps: InstalledApp[] = (data || [])
        .filter((row: any) => !!row.app_catalog)
        .map((row: any) => {
          const c = row.app_catalog || {};
          return {
            app_id: row.app_id,
            selected: row.selected,
            name: c.name ?? row.app_id,
            icon_url: c.icon_url ?? null,
            category: c.category ?? null,
            rating_system: c.rating_system ?? null,
            age_rating: c.age_rating ?? null,
            has_ugc: c.has_ugc ?? null,
            has_chat: c.has_chat ?? null,
            monetization: c.monetization ?? null,
            warning_level: c.warning_level ?? 0,
            warning_notes: c.warning_notes ?? null,
            guide_url: c.guide_url ?? null,
          };
        });

      setApps(installedApps);
    } catch (error) {
      console.error('Failed to load installed apps:', error);
      toast.error('Failed to load installed apps');
    }
  };

  // Load usage data from device events (graceful fallback)
  const loadUsageData = async () => {
    if (!deviceId) return;

    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Get device_code for telemetry lookup
      const { data: dev } = await supabase
        .from("devices")
        .select("device_code")
        .eq("id", deviceId)
        .maybeSingle();
      if (!dev) return;

      // Cast to any to avoid type issues until schema is regenerated
      const { data: events, error } = await supabase
        .from('device_events' as any)
        .select('ts, payload')
        .eq('device_code', dev.device_code)
        .gte('ts', since)
        .eq('type', 'app_foreground')
        .order('ts', { ascending: true })
        .limit(2000) as any;

      if (error || !events) return;

      // Simple sessionization: calculate minutes per app
      const counts: Record<string, number> = {};
      let lastApp: string | null = null;
      let lastTs: number | null = null;

      for (const event of events) {
        const now = new Date(event.ts).getTime();
        const app = event.payload?.app_id || event.payload?.app_name || null;
        
        if (lastApp && lastTs) {
          const minutes = Math.max(0, Math.round((now - lastTs) / 60000));
          counts[lastApp] = (counts[lastApp] || 0) + Math.min(minutes, 10); // Cap at 10min per session
        }
        
        lastApp = app;
        lastTs = now;
      }

      setUsage(counts);
    } catch (error) {
      // Graceful fallback - device_events table might not exist yet
      console.log('Usage data not available:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadInstalledApps(), loadUsageData()]);
      setLoading(false);
    };
    loadData();
  }, [childId, deviceId]);

  // Queue device job
  const queueDeviceJob = async (type: string, payload: any) => {
    if (!deviceId) {
      toast.error('No device selected');
      return;
    }

    try {
      const { error } = await supabase
        .from('device_jobs')
        .insert({
          device_id: deviceId,
          type,
          status: 'queued',
          payload
        });

      if (error) throw error;
      toast.success('Command queued for device');
    } catch (error) {
      console.error('Failed to queue device job:', error);
      toast.error('Failed to queue command');
    }
  };

  const toggleAppAllowed = async (app: InstalledApp) => {
    setSavingApps(prev => new Set(prev).add(app.app_id));
    
    try {
      const newAllowed = !app.selected;
      const jobType = newAllowed ? 'ALLOW_APP' : 'BLOCK_APP';
      
      await queueDeviceJob(jobType, { app_id: app.app_id });
      
      // Update local state
      setApps(prev => prev.map(a => 
        a.app_id === app.app_id ? { ...a, selected: newAllowed } : a
      ));
    } catch (error) {
      console.error('Failed to toggle app:', error);
    } finally {
      setSavingApps(prev => {
        const next = new Set(prev);
        next.delete(app.app_id);
        return next;
      });
    }
  };

  const setTimeLimit = async (app: InstalledApp, minutes: number) => {
    setSavingApps(prev => new Set(prev).add(app.app_id));
    
    try {
      await queueDeviceJob('APPLY_POLICY', {
        app_id: app.app_id,
        time_rules: { daily: minutes }
      });
      
      toast.success(`Set ${minutes}min daily limit for ${app.name}`);
    } catch (error) {
      console.error('Failed to set time limit:', error);
    } finally {
      setSavingApps(prev => {
        const next = new Set(prev);
        next.delete(app.app_id);
        return next;
      });
    }
  };

  const getWarningBadge = (app: InstalledApp) => {
    if (!app.warning_level || app.warning_level === 0) return null;
    
    const icon = app.warning_level >= 2 ? "⚠️" : "•";
    const title = [
      app.rating_system && app.age_rating ? `${app.rating_system} ${app.age_rating}` : '',
      app.warning_notes || '',
      app.guide_url ? 'Click to read our guide' : ''
    ].filter(Boolean).join(' • ');

    return (
      <span 
        className="text-amber-600 cursor-help" 
        title={title}
        onClick={() => app.guide_url && window.open(app.guide_url, '_blank')}
      >
        {icon}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No apps installed yet</p>
          <Button onClick={() => navigate(`/children/${childId}/apps/store`)}>
            Browse App Store
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Installed Apps ({apps.length})</h3>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/children/${childId}/apps/store`)}
        >
          + Add Apps
        </Button>
      </div>

      <div className="space-y-3">
        {apps.map((app) => {
          const appUsage = usage[app.name] || usage[app.app_id] || 0;
          const isSaving = savingApps.has(app.app_id);
          
          return (
            <Card key={app.app_id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={app.icon_url || '/placeholder.svg'}
                    alt={app.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{app.name}</h4>
                      {getWarningBadge(app)}
                      {app.guide_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(app.guide_url!, '_blank')}
                          className="h-auto p-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{app.category || 'App'}</span>
                      {app.rating_system && app.age_rating && (
                        <span>{app.rating_system} {app.age_rating}</span>
                      )}
                      <span>{appUsage} min (7d)</span>
                      {app.has_ugc && <Badge variant="outline" className="text-xs">UGC</Badge>}
                      {app.has_chat && <Badge variant="outline" className="text-xs">Chat</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{app.selected ? 'Allowed' : 'Blocked'}</span>
                      <Switch
                        checked={app.selected}
                        onCheckedChange={() => toggleAppAllowed(app)}
                        disabled={isSaving}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimeLimit(app, 60)}
                      disabled={isSaving}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      1h/day
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
