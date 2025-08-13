import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Gamepad2, GraduationCap, MessageCircle, Play, Globe, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getChildAppSelections, upsertChildAppSelection } from '@/lib/api';

interface AppSelection {
  id: string;
  app_id: string;
  app_name: string;
  app_description: string;
  app_category: string;
  app_is_essential: boolean;
  app_age_rating: number;
  selected: boolean;
}

interface ChildAppManagementProps {
  childId: string;
  childName: string;
  isDemoMode?: boolean;
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

export function ChildAppManagement({ childId, childName, isDemoMode = false }: ChildAppManagementProps) {
  const [appSelections, setAppSelections] = useState<AppSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!childId) return;

    if (isDemoMode) {
      // Load demo data
      const demoSelections: AppSelection[] = [
        { id: '1', app_id: 'settings', app_name: 'Settings', app_description: 'System settings', app_category: 'App', app_is_essential: true, app_age_rating: 3, selected: true },
        { id: '2', app_id: 'browser', app_name: 'Browser', app_description: 'Web browsing', app_category: 'Browser', app_is_essential: true, app_age_rating: 8, selected: true },
        { id: '3', app_id: 'scratch-jr', app_name: 'ScratchJr', app_description: 'Learn programming basics', app_category: 'Education', app_is_essential: false, app_age_rating: 5, selected: true },
        { id: '4', app_id: 'minecraft', app_name: 'Minecraft', app_description: 'Creative building game', app_category: 'Game', app_is_essential: false, app_age_rating: 7, selected: true },
        { id: '5', app_id: 'roblox', app_name: 'Roblox', app_description: 'Online gaming platform', app_category: 'Game', app_is_essential: false, app_age_rating: 9, selected: false },
        { id: '6', app_id: 'youtube-kids', app_name: 'YouTube Kids', app_description: 'Safe video content for children', app_category: 'Streaming', app_is_essential: false, app_age_rating: 4, selected: true },
      ];
      setAppSelections(demoSelections);
      setLoading(false);
      return;
    }

    setLoading(true);
    getChildAppSelections(childId)
      .then(data => {
        setAppSelections(data || []);
      })
      .catch(error => {
        console.error('Failed to load app selections:', error);
        toast({
          title: 'Failed to load apps',
          description: error.message,
          variant: 'destructive'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [childId, isDemoMode, toast]);

  const handleAppToggle = async (appId: string, selected: boolean) => {
    if (isDemoMode) {
      // Update demo state
      setAppSelections(prev => 
        prev.map(app => 
          app.app_id === appId ? { ...app, selected } : app
        )
      );
      toast({
        title: 'Demo mode',
        description: `${selected ? 'Enabled' : 'Disabled'} app (not saved)`
      });
      return;
    }

    try {
      await upsertChildAppSelection(childId, appId, selected);
      setAppSelections(prev => 
        prev.map(app => 
          app.app_id === appId ? { ...app, selected } : app
        )
      );
      const appName = appSelections.find(app => app.app_id === appId)?.app_name || appId;
      toast({
        title: 'Updated',
        description: `${appName} ${selected ? 'enabled' : 'disabled'} for ${childName}`
      });
    } catch (error: any) {
      console.error('Failed to update app selection:', error);
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading apps...
        </CardContent>
      </Card>
    );
  }

  if (appSelections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No apps configured yet. Add some apps when setting up your child's profile.
        </CardContent>
      </Card>
    );
  }

  const categories = Array.from(new Set(appSelections.map(app => app.app_category)));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">App Access for {childName}</h3>
        <p className="text-sm text-muted-foreground">
          Control which apps {childName} can access. Essential apps are always enabled.
        </p>
      </div>

      {categories.map(category => {
        const categoryApps = appSelections.filter(app => app.app_category === category);
        const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Smartphone;

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <IconComponent className="h-4 w-4" />
                {category}
              </CardTitle>
              <CardDescription className="text-sm">
                {categoryApps.length} app{categoryApps.length !== 1 ? 's' : ''} in this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryApps.map(app => (
                <div key={app.app_id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.app_name}</span>
                        {app.app_is_essential && (
                          <Badge variant="secondary" className="text-xs">
                            Essential
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {app.app_age_rating}+
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.app_description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor={`app-${app.app_id}`} 
                      className="text-sm font-normal"
                    >
                      {app.app_is_essential || app.selected ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id={`app-${app.app_id}`}
                      checked={app.app_is_essential || app.selected}
                      disabled={app.app_is_essential}
                      onCheckedChange={(checked) => handleAppToggle(app.app_id, checked)}
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