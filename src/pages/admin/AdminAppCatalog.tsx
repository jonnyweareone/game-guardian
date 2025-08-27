import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

const categories = ['Education', 'Game', 'Social', 'Streaming', 'Productivity', 'Browser', 'Messaging', 'Entertainment', 'Utility'];
const platforms = ['web', 'android', 'ios', 'desktop', 'all'];

export default function AdminAppCatalog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppCatalogItem | null>(null);
  const queryClient = useQueryClient();

  // Fetch app catalog
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['admin-app-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as AppCatalogItem[];
    }
  });

  // Create app mutation
  const createAppMutation = useMutation({
    mutationFn: async (appData: any) => {
      const { data, error } = await supabase
        .from('app_catalog')
        .insert(appData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-catalog'] });
      toast.success('App created successfully');
      setIsDialogOpen(false);
      setEditingApp(null);
    },
    onError: (error) => {
      toast.error(`Failed to create app: ${error.message}`);
    }
  });

  // Update app mutation
  const updateAppMutation = useMutation({
    mutationFn: async (appData: any) => {
      const { data, error } = await supabase
        .from('app_catalog')
        .update(appData)
        .eq('id', appData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-catalog'] });
      toast.success('App updated successfully');
      setIsDialogOpen(false);
      setEditingApp(null);
    },
    onError: (error) => {
      toast.error(`Failed to update app: ${error.message}`);
    }
  });

  // Delete app mutation
  const deleteAppMutation = useMutation({
    mutationFn: async (appId: string) => {
      const { error } = await supabase
        .from('app_catalog')
        .delete()
        .eq('id', appId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-catalog'] });
      toast.success('App deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete app: ${error.message}`);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const appData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      icon_url: formData.get('icon_url') as string,
      website: formData.get('website') as string,
      publisher: formData.get('publisher') as string,
      platform: formData.get('platform') as string,
      age_min: parseInt(formData.get('age_min') as string),
      age_max: parseInt(formData.get('age_max') as string),
      is_essential: formData.get('is_essential') === 'on',
      is_active: formData.get('is_active') === 'on',
      pegi_rating: formData.get('pegi_rating') ? parseInt(formData.get('pegi_rating') as string) : undefined,
    };

    if (editingApp) {
      updateAppMutation.mutate({ ...appData, id: editingApp.id });
    } else {
      createAppMutation.mutate(appData);
    }
  };

  const openAddDialog = () => {
    setEditingApp(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (app: AppCatalogItem) => {
    setEditingApp(app);
    setIsDialogOpen(true);
  };

  const handleDelete = (appId: string) => {
    if (confirm('Are you sure you want to delete this app?')) {
      deleteAppMutation.mutate(appId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">App Catalog Management</h1>
          <p className="text-muted-foreground">Manage applications available in the Guardian AI app store</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add App
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingApp ? 'Edit App' : 'Add New App'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    defaultValue={editingApp?.name} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={editingApp?.category} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingApp?.description} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon_url">Icon URL</Label>
                  <Input 
                    id="icon_url" 
                    name="icon_url" 
                    type="url"
                    defaultValue={editingApp?.icon_url} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    type="url"
                    defaultValue={editingApp?.website} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input 
                    id="publisher" 
                    name="publisher" 
                    defaultValue={editingApp?.publisher} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select name="platform" defaultValue={editingApp?.platform}>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_min">Min Age *</Label>
                  <Input 
                    id="age_min" 
                    name="age_min" 
                    type="number" 
                    min="0" 
                    max="18" 
                    required
                    defaultValue={editingApp?.age_min} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age_max">Max Age *</Label>
                  <Input 
                    id="age_max" 
                    name="age_max" 
                    type="number" 
                    min="0" 
                    max="18" 
                    required
                    defaultValue={editingApp?.age_max} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pegi_rating">PEGI Rating</Label>
                  <Input 
                    id="pegi_rating" 
                    name="pegi_rating" 
                    type="number"
                    defaultValue={editingApp?.pegi_rating} 
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_essential" 
                    name="is_essential"
                    defaultChecked={editingApp?.is_essential ?? false}
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAppMutation.isPending || updateAppMutation.isPending}
                >
                  {editingApp ? 'Update' : 'Create'} App
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apps ({apps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading apps...</div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No apps found</p>
              <Button onClick={openAddDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add First App
              </Button>
            </div>
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
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {app.icon_url && (
                          <img src={app.icon_url} alt={app.name} className="w-6 h-6" />
                        )}
                        <span className="font-medium">{app.name}</span>
                        {app.is_essential && (
                          <Badge variant="outline" className="text-xs">Essential</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app.category}</TableCell>
                    <TableCell>{app.publisher || '-'}</TableCell>
                    <TableCell>{app.pegi_rating || '-'}</TableCell>
                    <TableCell>{app.age_min}-{app.age_max}</TableCell>
                    <TableCell>
                      <Badge variant={app.is_active ? 'default' : 'secondary'}>
                        {app.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(app)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(app.id)}
                          disabled={deleteAppMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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