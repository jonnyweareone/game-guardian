
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Settings, Check, X } from 'lucide-react';
import { getAppCatalogWithIcons } from '@/lib/dashboardV2Api';

interface App {
  id: string;
  name: string;
  category: string;
  icon_url?: string;
  description?: string;
}

interface AppChooserProps {
  selectedApps: string[];
  onSelectionChange: (appIds: string[]) => void;
  children: React.ReactNode;
}

const categories = ['All', 'Game', 'App', 'Social', 'Education', 'Streaming', 'Messaging', 'Browser', 'Other'];

export default function AppChooser({ selectedApps, onSelectionChange, children }: AppChooserProps) {
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSelection, setLocalSelection] = useState<string[]>(selectedApps);

  useEffect(() => {
    if (open) {
      loadApps();
      setLocalSelection(selectedApps);
    }
  }, [open, selectedApps]);

  useEffect(() => {
    let filtered = apps;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredApps(filtered);
  }, [apps, selectedCategory, searchQuery]);

  const loadApps = async () => {
    try {
      const appsData = await getAppCatalogWithIcons();
      setApps(appsData);
    } catch (error) {
      console.error('Failed to load apps:', error);
    }
  };

  const toggleApp = (appId: string) => {
    setLocalSelection(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSave = () => {
    onSelectionChange(localSelection);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalSelection(selectedApps);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Choose Apps to Allow
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <ScrollArea className="h-[400px] mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                {filteredApps.map((app) => {
                  const isSelected = localSelection.includes(app.id);
                  
                  return (
                    <div
                      key={app.id}
                      className={`relative p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                      onClick={() => toggleApp(app.id)}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      
                      {/* App icon */}
                      <div className="flex items-center justify-center mb-2">
                        <img
                          src={app.icon_url || '/placeholder.svg'}
                          alt={app.name}
                          className="w-8 h-8 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      {/* App info */}
                      <div className="text-center">
                        <h3 className="font-medium text-sm truncate">{app.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {app.category}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {localSelection.length} apps selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
