import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Gamepad2, GraduationCap, MessageCircle, Play, Globe, MoreHorizontal } from 'lucide-react';

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
  const [apps, setApps] = useState<AppCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load app catalog - for now using mock data
    const mockApps: AppCatalogItem[] = [
      // Essential apps (always enabled)
      { id: 'settings', name: 'Settings', description: 'System settings', category: 'App', is_essential: true, age_rating: 3 },
      { id: 'browser', name: 'Browser', description: 'Web browsing', category: 'Browser', is_essential: true, age_rating: 8 },
      
      // Educational apps
      { id: 'scratch-jr', name: 'ScratchJr', description: 'Learn programming basics', category: 'Education', is_essential: false, age_rating: 5 },
      { id: 'khan-academy', name: 'Khan Academy Kids', description: 'Educational videos and exercises', category: 'Education', is_essential: false, age_rating: 4 },
      { id: 'duolingo', name: 'Duolingo', description: 'Language learning', category: 'Education', is_essential: false, age_rating: 6 },
      
      // Games
      { id: 'minecraft', name: 'Minecraft', description: 'Creative building game', category: 'Game', is_essential: false, age_rating: 7 },
      { id: 'roblox', name: 'Roblox', description: 'Online gaming platform', category: 'Game', is_essential: false, age_rating: 9 },
      { id: 'pokemon-go', name: 'Pokémon GO', description: 'Augmented reality game', category: 'Game', is_essential: false, age_rating: 9 },
      
      // Social/Communication
      { id: 'messenger-kids', name: 'Messenger Kids', description: 'Safe messaging for kids', category: 'Social', is_essential: false, age_rating: 6 },
      { id: 'discord', name: 'Discord', description: 'Voice and text chat', category: 'Social', is_essential: false, age_rating: 13 },
      
      // Streaming
      { id: 'youtube-kids', name: 'YouTube Kids', description: 'Safe video content for children', category: 'Streaming', is_essential: false, age_rating: 4 },
      { id: 'netflix', name: 'Netflix', description: 'Video streaming service', category: 'Streaming', is_essential: false, age_rating: 13 },
    ];

    // Filter by age appropriateness
    const ageAppropriate = mockApps.filter(app => app.age_rating <= childAge);
    setApps(ageAppropriate);
    setLoading(false);
  }, [childAge]);

  const categories = Array.from(new Set(apps.map(app => app.category)));

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
        const categoryApps = apps.filter(app => app.category === category);
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
                {category === 'Game' && 'Entertainment and gaming'}
                {category === 'Social' && 'Communication and social platforms'}
                {category === 'Streaming' && 'Video and media content'}
                {category === 'App' && 'Utility and productivity apps'}
                {category === 'Browser' && 'Web browsing and internet access'}
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