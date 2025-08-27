
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Users, BookOpen, Gamepad2, Video, MessageCircle, Globe, MoreHorizontal } from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  category: string;
  icon_url?: string;
  age_min: number;
  age_max: number;
  is_essential: boolean;
}

interface AppSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedApps: string[];
  onAppToggle: (appId: string, enabled: boolean) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'education': return BookOpen;
    case 'game': return Gamepad2;
    case 'social': return Users;
    case 'streaming': return Video;
    case 'messaging': return MessageCircle;
    case 'browser': return Globe;
    default: return MoreHorizontal;
  }
};

const mockApps: AppItem[] = [
  // Education
  { id: 'khan-academy', name: 'Khan Academy', category: 'Education', age_min: 6, age_max: 18, is_essential: true },
  { id: 'duolingo', name: 'Duolingo', category: 'Education', age_min: 8, age_max: 18, is_essential: false },
  { id: 'scratch', name: 'Scratch', category: 'Education', age_min: 8, age_max: 16, is_essential: true },
  
  // Games
  { id: 'minecraft', name: 'Minecraft', category: 'Game', age_min: 7, age_max: 18, is_essential: false },
  { id: 'roblox', name: 'Roblox', category: 'Game', age_min: 9, age_max: 18, is_essential: false },
  { id: 'among-us', name: 'Among Us', category: 'Game', age_min: 10, age_max: 18, is_essential: false },
  
  // Social
  { id: 'whatsapp', name: 'WhatsApp', category: 'Social', age_min: 13, age_max: 18, is_essential: false },
  { id: 'instagram', name: 'Instagram', category: 'Social', age_min: 13, age_max: 18, is_essential: false },
  { id: 'tiktok', name: 'TikTok', category: 'Social', age_min: 13, age_max: 18, is_essential: false },
  
  // Streaming
  { id: 'youtube', name: 'YouTube', category: 'Streaming', age_min: 13, age_max: 18, is_essential: false },
  { id: 'netflix', name: 'Netflix', category: 'Streaming', age_min: 12, age_max: 18, is_essential: false },
  { id: 'disney-plus', name: 'Disney+', category: 'Streaming', age_min: 6, age_max: 18, is_essential: false },
];

export default function AppSelectionStep({ onNext, onBack, selectedApps, onAppToggle }: AppSelectionStepProps) {
  const [apps] = useState<AppItem[]>(mockApps);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(apps.map(app => app.category)))];
  const filteredApps = selectedCategory === 'all' 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);

  const groupedApps = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, AppItem[]>);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Apps for Your Child</h2>
        <p className="text-muted-foreground">
          Select which apps and services your child can access. Essential apps for education are pre-selected.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="space-y-6">
        {Object.entries(groupedApps).map(([category, categoryApps]) => {
          const IconComponent = getCategoryIcon(category);
          
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {category}
                  <Badge variant="secondary" className="ml-auto">
                    {categoryApps.length} apps
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryApps.map((app) => {
                    const isSelected = selectedApps.includes(app.id);
                    const isEssential = app.is_essential;
                    
                    return (
                      <div
                        key={app.id}
                        className={`
                          flex items-center justify-between p-4 rounded-lg border transition-colors
                          ${isSelected ? 'bg-primary/5 border-primary' : 'bg-card border-border'}
                          ${isEssential ? 'ring-2 ring-green-500/20' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {app.name}
                              {isEssential && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Essential
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ages {app.age_min}-{app.age_max}
                            </div>
                          </div>
                        </div>
                        
                        <Switch
                          checked={isSelected}
                          onCheckedChange={(checked) => onAppToggle(app.id, checked)}
                          disabled={isEssential}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <X className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next: DNS Controls
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
