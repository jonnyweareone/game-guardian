import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { queueInstall } from '@/lib/osAppsApi';
import type { AppCatalogItem } from '@/types/os-apps';

interface AppStoreTabProps {
  childId: string;
  selectedDeviceId: string | null;
}

const AppStoreTab: React.FC<AppStoreTabProps> = ({
  childId,
  selectedDeviceId
}) => {
  const [apps, setApps] = useState<AppCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('id, name, method, source, icon_url, tags, category, description, age_min, age_max, pegi_rating, enabled, verified')
        .eq('enabled', true)
        .eq('verified', true)
        .order('name');

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedData: AppCatalogItem[] = (data || []).map(item => ({
        app_id: item.id,
        name: item.name,
        method: item.method as 'flatpak' | 'apt' | 'snap' | 'web',
        source: item.source,
        category: item.category,
        icon_url: item.icon_url,
        tags: item.tags,
        enabled: item.enabled,
        verified: item.verified,
        description: item.description,
        age_min: item.age_min,
        age_max: item.age_max,
        pegi_rating: item.pegi_rating
      }));
      
      setApps(mappedData);
    } catch (error) {
      console.error('Error loading apps:', error);
      toast.error('Failed to load app catalog');
    } finally {
      setLoading(false);
    }
  };

  const installApp = async (app: AppCatalogItem) => {
    if (!selectedDeviceId) {
      toast.error('Please select a device first');
      return;
    }

    setInstalling(prev => [...prev, app.app_id]);
    
    try {
      await queueInstall(selectedDeviceId, app);
      toast.success(`${app.name} installation queued`);
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error(`Failed to install ${app.name}`);
    } finally {
      setInstalling(prev => prev.filter(id => id !== app.app_id));
    }
  };

  const categories = Array.from(new Set(apps.map(app => app.category).filter(Boolean)));
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-sm text-muted-foreground">
        Install new apps from the Guardian App Store
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* App Grid */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Apps Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <Card key={app.app_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {app.icon_url ? (
                        <img 
                          src={app.icon_url} 
                          alt={app.name}
                          className="w-8 h-8 rounded"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {app.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{app.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {app.method}
                        </Badge>
                        {app.category && (
                          <Badge variant="secondary" className="text-xs">
                            {app.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {app.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {app.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {app.age_min && app.age_max && (
                      <span>Ages {app.age_min}-{app.age_max}</span>
                    )}
                    {app.pegi_rating && (
                      <Badge variant="outline" className="text-xs">
                        PEGI {app.pegi_rating}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => installApp(app)}
                    disabled={installing.includes(app.app_id) || !selectedDeviceId}
                  >
                    {installing.includes(app.app_id) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Install
                  </Button>
                </div>

                {app.tags && app.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {app.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {app.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{app.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppStoreTab;