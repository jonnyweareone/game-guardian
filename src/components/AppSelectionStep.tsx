
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Gamepad2, GraduationCap, MessageCircle, Play, Globe, MoreHorizontal, Info } from 'lucide-react';
import { getAppsForAge } from "@/lib/appCatalog";
import { useQuery } from "@tanstack/react-query";

interface AppCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url?: string;
  is_essential: boolean;
  age_min: number;
  age_max: number;
  pegi_rating?: number;
}

interface AppSelectionStepProps {
  childAge?: number;
  selectedApps: Set<string>;
  onAppToggle: (appId: string, selected: boolean) => void;
}

const CATEGORY_ICONS = {
  Education: GraduationCap,
  Game: Gamepad2,
  Social: MessageCircle,
  Streaming: Play,
  App: Smartphone,
  Browser: Globe,
  Other: MoreHorizontal,
} as const;

export function AppSelectionStep({ childAge = 8, selectedApps, onAppToggle }: AppSelectionStepProps) {
  // Use React Query to fetch apps appropriate for the child's age
  const { data: apps = [], isLoading: loading } = useQuery({
    queryKey: ['apps-for-age', childAge],
    queryFn: () => getAppsForAge(childAge),
  });

  // Filter apps by PEGI rating and age appropriateness
  const ageAppropriateApps = apps.filter(app => {
    // Include if no PEGI rating set (assume appropriate)
    if (!app.pegi_rating) return true;
    
    // Include if PEGI rating is appropriate for age
    return app.pegi_rating <= childAge;
  });

  // Group apps by category
  const categories = Array.from(new Set(ageAppropriateApps.map(app => app.category)));

  // Pre-select essential apps
  useState(() => {
    const essentialApps = ageAppropriateApps.filter(app => app.is_essential);
    essentialApps.forEach(app => {
      if (!selectedApps.has(app.id)) {
        onAppToggle(app.id, true);
      }
    });
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Loading age-appropriate apps...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Age-Appropriate Apps</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Showing apps suitable for age {childAge} (PEGI {childAge} and below)</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Essential apps are automatically selected. Icons will appear once apps are installed.
        </p>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No age-appropriate apps found for age {childAge}. 
              You may need to adjust the age or add apps to the catalog.
            </p>
          </CardContent>
        </Card>
      ) : (
        categories.map(category => {
          const categoryApps = ageAppropriateApps.filter(app => app.category === category);
          const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Smartphone;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconComponent className="h-4 w-4" />
                  {category}
                  <Badge variant="outline" className="ml-auto">
                    {categoryApps.length} apps
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  {category === 'Education' && 'Learning and educational content'}
                  {category === 'Game' && 'Entertainment and gaming applications'}
                  {category === 'Social' && 'Communication and social platforms'}
                  {category === 'Streaming' && 'Video and media content'}
                  {category === 'App' && 'Utility and productivity applications'}
                  {category === 'Browser' && 'Web browsers and internet access'}
                  {category === 'Other' && 'Other applications and tools'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryApps.map(app => {
                  const isSelected = selectedApps.has(app.id);
                  
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden border">
                          {app.icon_url ? (
                            <img 
                              src={app.icon_url} 
                              alt={`${app.name} icon`}
                              className="w-full h-full object-contain rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = parent.querySelector('.fallback-icon') as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center fallback-icon ${app.icon_url ? 'hidden' : ''}`}>
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{app.name}</span>
                            {app.is_essential && (
                              <Badge variant="secondary" className="text-xs">
                                Essential
                              </Badge>
                            )}
                            {app.pegi_rating && (
                              <Badge variant="outline" className="text-xs">
                                PEGI {app.pegi_rating}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Ages {app.age_min}-{app.age_max}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {app.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label 
                          htmlFor={`app-${app.id}`} 
                          className="text-sm font-normal"
                        >
                          {app.is_essential ? 'Required' : isSelected ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`app-${app.id}`}
                          checked={app.is_essential || isSelected}
                          disabled={app.is_essential}
                          onCheckedChange={(checked) => onAppToggle(app.id, checked)}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}

      <div className="text-center text-sm text-muted-foreground">
        {selectedApps.size} apps selected • Age restrictions and DNS filtering help keep your child safe online
      </div>
    </div>
  );
}
