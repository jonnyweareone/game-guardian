
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";

interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  age_min: number | null;
  age_max: number | null;
  is_essential: boolean;
  icon_url: string | null;
}

interface AppSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedApps: string[];
  onAppToggle: (appId: string, selected: boolean) => void;
  childAge: number;
}

export default function AppSelectionStep({ 
  onNext, 
  onBack, 
  selectedApps, 
  onAppToggle,
  childAge 
}: AppSelectionStepProps) {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadApps();
  }, [childAge]);

  const loadApps = async () => {
    try {
      setLoading(true);
      
      // Filter apps based on child's age - simplified query to avoid type issues
      let query = supabase
        .from('app_catalog')
        .select('*')
        .eq('active', true)
        .order('name');

      const { data, error } = await query;

      if (error) throw error;

      // Filter by age in JavaScript to avoid complex SQL type issues
      const ageFilteredApps = (data || []).filter(app => {
        const ageMin = app.age_min;
        const ageMax = app.age_max;
        
        // If no age restrictions, include the app
        if (ageMin === null && ageMax === null) return true;
        
        // Check if child's age falls within the app's age range
        const meetsMinAge = ageMin === null || childAge >= ageMin;
        const meetsMaxAge = ageMax === null || childAge <= ageMax;
        
        return meetsMinAge && meetsMaxAge;
      });

      setApps(ageFilteredApps);

      // Pre-select essential apps
      const essentialApps = ageFilteredApps.filter(app => app.is_essential);
      essentialApps.forEach(app => {
        if (!selectedApps.includes(app.id)) {
          onAppToggle(app.id, true);
        }
      });

    } catch (error) {
      console.error('Error loading apps:', error);
      toast.error('Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(apps.map(app => app.category)));
  const filteredApps = selectedCategory === "all" 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);

  const handleAppToggle = (app: App, checked: boolean) => {
    if (app.is_essential && !checked) {
      toast.error(`${app.name} is essential and cannot be deselected`);
      return;
    }
    onAppToggle(app.id, checked);
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
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Apps</h3>
        <p className="text-sm text-muted-foreground">
          Apps filtered for age {childAge}. Essential apps are pre-selected.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All Categories
        </Button>
        {categories.map(category => (
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

      {/* Apps Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const isSelected = selectedApps.includes(app.id);
            
            return (
              <div
                key={app.id}
                className={`p-4 border rounded-lg transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAppToggle(app, checked as boolean)}
                    disabled={app.is_essential && isSelected}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      {app.icon_url && (
                        <img 
                          src={app.icon_url} 
                          alt={app.name}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{app.name}</h4>
                        {app.is_essential && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Essential
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {app.description}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {app.category}
                      </Badge>
                      {(app.age_min !== null || app.age_max !== null) && (
                        <Badge variant="outline" className="text-xs">
                          Ages {app.age_min || 0}–{app.age_max || '∞'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground">
        {selectedApps.length} apps selected
      </div>
    </div>
  );
}
