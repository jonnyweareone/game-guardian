import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Gamepad2, GraduationCap, MessageCircle, Play, Globe, MoreHorizontal } from 'lucide-react';
import { getAppsForAge, getAppCategories } from "@/lib/appCatalog";
import { useQuery } from "@tanstack/react-query";

interface AppCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url?: string;
  is_essential: boolean;
  age_rating: number;
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
  // Use React Query to fetch apps from the database
  const { data: apps = [], isLoading: loading } = useQuery({
    queryKey: ['apps-for-age', childAge],
    queryFn: () => getAppsForAge(childAge),
  });

  // Map database fields to component interface
  const mappedApps = apps.map(app => ({
    id: app.id,
    name: app.name,
    description: app.description || '',
    category: app.category,
    icon_url: app.icon_url,
    is_essential: app.is_essential,
    age_rating: app.age_min, // Use age_min as the rating display
  }));

  const categories = Array.from(new Set(mappedApps.map(app => app.category)));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Loading apps...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Apps</h3>
        <p className="text-sm text-muted-foreground">
          Select which apps your child can access. Essential apps are always enabled.
        </p>
      </div>

      {categories.map(category => {
        const categoryApps = mappedApps.filter(app => app.category === category);
        const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Smartphone;

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <IconComponent className="h-4 w-4" />
                {category}
              </CardTitle>
              <CardDescription className="text-sm">
                {category === 'Education' && 'Learning and educational content'}
                {category === 'Games' && 'Entertainment and gaming'}
                {category === 'Communication' && 'Communication and social platforms'}
                {category === 'Entertainment' && 'Video and media content'}
                {category === 'Utilities' && 'Utility and productivity apps'}
                {category === 'System' && 'System and essential apps'}
                {category === 'Other' && 'Other applications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryApps.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.name}</span>
                        {app.is_essential && (
                          <Badge variant="secondary" className="text-xs">
                            Essential
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {app.age_rating}+
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor={`app-${app.id}`} 
                      className="text-sm font-normal"
                    >
                      {app.is_essential || selectedApps.has(app.id) ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id={`app-${app.id}`}
                      checked={app.is_essential || selectedApps.has(app.id)}
                      disabled={app.is_essential}
                      onCheckedChange={(checked) => onAppToggle(app.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}