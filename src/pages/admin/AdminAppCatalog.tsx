import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AppCatalogItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon_url?: string;
  website?: string;
  publisher?: string;
  version?: string;
  platform?: string;
  pegi_rating?: number;
  pegi_descriptors?: string[];
  age_min: number;
  age_max: number;
  is_essential: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categories = ["Games", "Communication", "Entertainment", "Utilities", "System", "Education", "Social"];
const platforms = ["PC", "Web", "Mobile", "System"];

export default function AdminAppCatalog() {
  const [editingApp, setEditingApp] = useState<AppCatalogItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: apps, isLoading } = useQuery({
    queryKey: ['admin-app-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as AppCatalogItem[];
    },
  });

  const createAppMutation = useMutation({
    mutationFn: async (app: Omit<AppCatalogItem, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('app_catalog')
        .insert([app])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-catalog'] });
      setIsDialogOpen(false);
      setEditingApp(null);
      toast.success('App created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create app: ' + error.message);
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: async (app: AppCatalogItem) => {
      const { data, error } = await supabase
        .from('app_catalog')
        .update(app)
        .eq('id', app.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-catalog'] });
      setIsDialogOpen(false);
      setEditingApp(null);
      toast.success('App updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update app: ' + error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const appData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string,
      icon_url: formData.get('icon_url') as string || null,
      website: formData.get('website') as string || null,
      publisher: formData.get('publisher') as string || null,
      version: formData.get('version') as string || null,
      platform: formData.get('platform') as string || null,
      pegi_rating: parseInt(formData.get('pegi_rating') as string) || null,
      pegi_descriptors: formData.get('pegi_descriptors') ? 
        (formData.get('pegi_descriptors') as string).split(',').map(s => s.trim()) : [],
      age_min: parseInt(formData.get('age_min') as string) || 0,
      age_max: parseInt(formData.get('age_max') as string) || 18,
      is_essential: formData.get('is_essential') === 'on',
      is_active: formData.get('is_active') === 'on',
    };

    if (editingApp) {
      updateAppMutation.mutate({ ...appData, created_at: editingApp.created_at, updated_at: editingApp.updated_at });
    } else {
      createAppMutation.mutate(appData);
    }
  };

  const openCreateDialog = () => {
    setEditingApp(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (app: AppCatalogItem) => {
    setEditingApp(app);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">App Catalog Management</h1>
          <p className="text-muted-foreground">Manage applications available for Guardian OS devices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add App
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingApp ? 'Edit App' : 'Add New App'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id">App ID</Label>
                  <Input
                    id="id"
                    name="id"
                    defaultValue={editingApp?.id || ''}
                    placeholder="minecraft"
                    required
                    disabled={!!editingApp}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingApp?.name || ''}
                    placeholder="Minecraft"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingApp?.description || ''}
                  placeholder="Build, explore and survive in infinite worlds"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingApp?.category || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select name="platform" defaultValue={editingApp?.platform || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    name="publisher"
                    defaultValue={editingApp?.publisher || ''}
                    placeholder="Mojang Studios"
                  />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    name="version"
                    defaultValue={editingApp?.version || ''}
                    placeholder="1.20.4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon_url">Icon URL</Label>
                  <Input
                    id="icon_url"
                    name="icon_url"
                    defaultValue={editingApp?.icon_url || ''}
                    placeholder="/lovable-uploads/minecraft-icon.png"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={editingApp?.website || ''}
                    placeholder="https://minecraft.net"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pegi_rating">PEGI Rating</Label>
                  <Input
                    id="pegi_rating"
                    name="pegi_rating"
                    type="number"
                    defaultValue={editingApp?.pegi_rating || ''}
                    placeholder="7"
                  />
                </div>
                <div>
                  <Label htmlFor="age_min">Min Age</Label>
                  <Input
                    id="age_min"
                    name="age_min"
                    type="number"
                    defaultValue={editingApp?.age_min || 0}
                    min="0"
                    max="18"
                  />
                </div>
                <div>
                  <Label htmlFor="age_max">Max Age</Label>
                  <Input
                    id="age_max"
                    name="age_max"
                    type="number"
                    defaultValue={editingApp?.age_max || 18}
                    min="0"
                    max="18"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pegi_descriptors">PEGI Descriptors (comma-separated)</Label>
                <Input
                  id="pegi_descriptors"
                  name="pegi_descriptors"
                  defaultValue={editingApp?.pegi_descriptors?.join(', ') || ''}
                  placeholder="Mild Violence, Users Interact Online"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_essential"
                    name="is_essential"
                    defaultChecked={editingApp?.is_essential || false}
                  />
                  <Label htmlFor="is_essential">Essential App</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingApp?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAppMutation.isPending || updateAppMutation.isPending}>
                  {editingApp ? 'Update' : 'Create'} App
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Catalog ({apps?.length || 0} apps)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading apps...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>PEGI</TableHead>
                  <TableHead>Age Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps?.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {app.icon_url && (
                          <img src={app.icon_url} alt={app.name} className="w-8 h-8 rounded" />
                        )}
                        <div>
                          <div>{app.name}</div>
                          <div className="text-sm text-muted-foreground">{app.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{app.category}</TableCell>
                    <TableCell>{app.publisher}</TableCell>
                    <TableCell>{app.pegi_rating}</TableCell>
                    <TableCell>{app.age_min}-{app.age_max}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {app.is_active ? (
                          <Badge variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {app.is_essential && (
                          <Badge variant="default">Essential</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(app)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}