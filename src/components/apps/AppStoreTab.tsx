
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, Download, Check } from "lucide-react";
import { toast } from "sonner";

interface CatalogApp {
  id: string;
  name: string;
  description?: string;
  icon_url: string | null;
  category: string | null;
  rating_system: string | null;
  age_rating: string | null;
  has_ugc: boolean | null;
  has_chat: boolean | null;
  monetization: string | null;
  warning_level: number;
  warning_notes: string | null;
  guide_url: string | null;
  publisher?: string;
}

interface AppStoreTabProps {
  childId: string;
  deviceId?: string;
}

const CATEGORIES = ['All', 'Game', 'App', 'Social', 'Education', 'Streaming', 'Messaging', 'Browser', 'Other'];

export default function AppStoreTab({ childId, deviceId }: AppStoreTabProps) {
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [installedApps, setInstalledApps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [installingApps, setInstallingApps] = useState<Set<string>>(new Set());

  // Load app catalog
  const loadCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Map DB rows into local shape (avoids type drift until types are regenerated)
      setApps(((data as any) || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        icon_url: row.icon_url ?? null,
        category: row.category ?? null,
        rating_system: row.rating_system ?? null,
        age_rating: row.age_rating ?? null,
        has_ugc: row.has_ugc ?? null,
        has_chat: row.has_chat ?? null,
        monetization: row.monetization ?? null,
        warning_level: row.warning_level ?? 0,
        warning_notes: row.warning_notes ?? null,
        guide_url: row.guide_url ?? null,
        publisher: row.publisher ?? undefined,
      })));
    } catch (error) {
      console.error('Failed to load app catalog:', error);
      toast.error('Failed to load app catalog');
    }
  };

  // Load already installed/selected apps
  const loadInstalledApps = async () => {
    try {
      const { data, error } = await supabase
        .from('child_app_selections')
        .select('app_id')
        .eq('child_id', childId)
        .eq('selected', true);

      if (error) throw error;
      setInstalledApps(new Set((data || []).map(item => item.app_id)));
    } catch (error) {
      console.error('Failed to load installed apps:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCatalog(), loadInstalledApps()]);
      setLoading(false);
    };
    loadData();
  }, [childId]);

  // Filter apps based on search and category
  const filteredApps = apps.filter(app => {
    const matchesSearch = !searchQuery || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  const installApp = async (appId: string) => {
    setInstallingApps(prev => new Set(prev).add(appId));
    
    try {
      await queueDeviceJob('INSTALL_APP', { app_id: appId });
      setInstalledApps(prev => new Set(prev).add(appId));
    } catch (error) {
      console.error('Failed to install app:', error);
    } finally {
      setInstallingApps(prev => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
    }
  };

  const allowApp = async (appId: string) => {
    setInstallingApps(prev => new Set(prev).add(appId));
    
    try {
      await queueDeviceJob('ALLOW_APP', { app_id: appId });
      setInstalledApps(prev => new Set(prev).add(appId));
    } catch (error) {
      console.error('Failed to allow app:', error);
    } finally {
      setInstallingApps(prev => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
    }
  };

  const getWarningBadge = (app: CatalogApp) => {
    if (!app.warning_level || app.warning_level === 0) return null;
    
    const icon = app.warning_level >= 2 ? "⚠️" : "•";
    const title = [
      app.rating_system && app.age_rating ? `${app.rating_system} ${app.age_rating}` : '',
      app.warning_notes || '',
      app.guide_url ? 'Click to read our guide' : ''
    ].filter(Boolean).join(' • ');

    return (
      <span 
        className="text-amber-600 cursor-help ml-auto" 
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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const isInstalled = installedApps.has(app.id);
          const isInstalling = installingApps.has(app.id);
          
          return (
            <Card key={app.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <img
                    src={app.icon_url || '/placeholder.svg'}
                    alt={app.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate">{app.name}</CardTitle>
                      {getWarningBadge(app)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{app.category || 'App'}</span>
                      {app.rating_system && app.age_rating && (
                        <>
                          <span>•</span>
                          <span>{app.rating_system} {app.age_rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {app.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {app.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {app.has_ugc && <Badge variant="outline" className="text-xs">UGC</Badge>}
                  {app.has_chat && <Badge variant="outline" className="text-xs">Chat</Badge>}
                  {app.monetization && <Badge variant="outline" className="text-xs">{app.monetization}</Badge>}
                </div>
                
                <div className="flex gap-2">
                  {isInstalled ? (
                    <Button variant="outline" disabled className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      Installed
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => installApp(app.id)}
                        disabled={isInstalling}
                        className="flex-1"
                      >
                        {isInstalling ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Install
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => allowApp(app.id)}
                        disabled={isInstalling}
                      >
                        Allow
                      </Button>
                    </>
                  )}
                </div>
                
                {app.guide_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(app.guide_url!, '_blank')}
                    className="w-full mt-2 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Read our guide
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredApps.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No apps found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
