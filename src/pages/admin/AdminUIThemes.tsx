import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Palette, Star } from "lucide-react";
import { toast } from "sonner";

interface UITheme {
  id: string;
  name: string;
  description?: string;
  theme_data: any;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminUIThemes() {
  const [editingTheme, setEditingTheme] = useState<UITheme | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: themes, isLoading } = useQuery({
    queryKey: ['admin-ui-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_themes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UITheme[];
    },
  });

  const createThemeMutation = useMutation({
    mutationFn: async (theme: Omit<UITheme, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ui_themes')
        .insert([theme])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ui-themes'] });
      setIsDialogOpen(false);
      setEditingTheme(null);
      toast.success('Theme created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create theme: ' + error.message);
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: UITheme) => {
      const { data, error } = await supabase
        .from('ui_themes')
        .update(theme)
        .eq('id', theme.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ui-themes'] });
      setIsDialogOpen(false);
      setEditingTheme(null);
      toast.success('Theme updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update theme: ' + error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    let themeData;
    try {
      themeData = JSON.parse(formData.get('theme_data') as string);
    } catch (error) {
      toast.error('Invalid JSON in theme data');
      return;
    }

    const theme = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      theme_data: themeData,
      is_default: formData.get('is_default') === 'on',
      is_active: formData.get('is_active') === 'on',
    };

    if (editingTheme) {
      updateThemeMutation.mutate({ 
        ...theme, 
        id: editingTheme.id,
        created_at: editingTheme.created_at, 
        updated_at: editingTheme.updated_at 
      });
    } else {
      createThemeMutation.mutate(theme);
    }
  };

  const openCreateDialog = () => {
    setEditingTheme(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (theme: UITheme) => {
    setEditingTheme(theme);
    setIsDialogOpen(true);
  };

  const defaultThemeData = {
    colors: {
      primary: "210 40% 98%",
      background: "224 71% 4%",
      accent: "216 34% 17%",
      foreground: "210 40% 98%",
      muted: "215 32% 27%",
      border: "216 34% 17%"
    },
    layout: {
      appRailPosition: "left",
      maxAppsPerRow: 4,
      showAppNames: true,
      iconSize: "medium"
    },
    fonts: {
      primary: "Inter",
      headings: "Inter"
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">UI Theme Management</h1>
          <p className="text-muted-foreground">Manage visual themes for Guardian OS devices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTheme ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingTheme?.name || ''}
                  placeholder="Dark Gaming Theme"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingTheme?.description || ''}
                  placeholder="High contrast theme optimized for gaming"
                />
              </div>

              <div>
                <Label htmlFor="theme_data">Theme Data (JSON)</Label>
                <Textarea
                  id="theme_data"
                  name="theme_data"
                  defaultValue={editingTheme ? JSON.stringify(editingTheme.theme_data, null, 2) : JSON.stringify(defaultThemeData, null, 2)}
                  placeholder="Theme configuration in JSON format"
                  className="font-mono text-sm min-h-[400px]"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Configure colors, layout, fonts, and other visual elements
                </p>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    name="is_default"
                    defaultChecked={editingTheme?.is_default || false}
                  />
                  <Label htmlFor="is_default">Default Theme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingTheme?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createThemeMutation.isPending || updateThemeMutation.isPending}>
                  {editingTheme ? 'Update' : 'Create'} Theme
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            UI Themes ({themes?.length || 0} themes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading themes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes?.map((theme) => (
                  <TableRow key={theme.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ 
                            backgroundColor: theme.theme_data?.colors?.primary ? 
                              `hsl(${theme.theme_data.colors.primary})` : 
                              '#000' 
                          }}
                        />
                        {theme.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {theme.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {theme.is_default && (
                          <Badge variant="default">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {theme.is_active ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(theme.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(theme)}
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

      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes?.filter(t => t.is_active).map((theme) => (
              <div key={theme.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{theme.name}</h4>
                  {theme.is_default && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {Object.entries(theme.theme_data?.colors || {}).slice(0, 4).map(([key, value]) => (
                    <div
                      key={key}
                      className="h-6 rounded border"
                      style={{ backgroundColor: `hsl(${value})` }}
                      title={`${key}: ${value}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {theme.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}