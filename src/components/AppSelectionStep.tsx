import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface AppSelectionStepProps {
  childAge?: number;
  selectedApps: Set<string>;
  onAppToggle: (appId: string, selected: boolean) => void;
}

export function AppSelectionStep({ childAge = 8, selectedApps, onAppToggle }: AppSelectionStepProps) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const result = await supabase
          .from('app_catalog')
          .select('id, name, description, category, icon_url, is_essential, age_min, age_max, pegi_rating')
          .eq('enabled', true)
          .order('name');
        
        if (result.error) throw result.error;
        
        const filteredApps = (result.data || []).filter((app: any) => {
          if (!app.pegi_rating) return true;
          return app.pegi_rating <= childAge;
        });
        
        setApps(filteredApps);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [childAge]);

  useEffect(() => {
    const essentialApps = apps.filter((app: any) => app.is_essential);
    essentialApps.forEach((app: any) => {
      if (!selectedApps.has(app.id)) {
        onAppToggle(app.id, true);
      }
    });
  }, [apps, selectedApps, onAppToggle]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Loading age-appropriate apps...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Age-Appropriate Apps</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Showing apps suitable for age {childAge} (PEGI {childAge} and below)</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Essential apps are automatically selected. Icons will appear once apps are installed.
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No age-appropriate apps found for age {childAge}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(new Set(apps.map((app: any) => app.category))).map(category => {
            const categoryApps = apps.filter((app: any) => app.category === category);
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-3 h-3 border border-muted-foreground/50 rounded-sm flex items-center justify-center">
                      <div className="w-2 h-0.5 bg-muted-foreground/50"></div>
                    </div>
                    <span className="font-medium">{category.toLowerCase()}</span>
                    <span className="text-xs">{categoryApps.length} apps</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {categoryApps.map((app: any) => {
                    const isSelected = selectedApps.has(app.id);
                    const isEssential = app.is_essential;
                    
                    return (
                      <div key={app.id} className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 flex-shrink-0">
                            {app.icon_url ? (
                              <img 
                                src={app.icon_url} 
                                alt={`${app.name} icon`}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-primary/20 rounded"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{app.name}</span>
                              {app.pegi_rating && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  PEGI {app.pegi_rating}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                Ages {app.age_min}-{app.age_max}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {app.description || 'No description available'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {isEssential ? 'Enabled' : isSelected ? 'Enabled' : 'Disabled'}
                          </span>
                          <Switch
                            checked={isEssential || isSelected}
                            disabled={isEssential}
                            onCheckedChange={(checked) => onAppToggle(app.id, checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}