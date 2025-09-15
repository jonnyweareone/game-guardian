import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PolicyProfile {
  id: string;
  name: string;
  category_blocks: string[];
  safe_search: boolean;
  study_mode: boolean;
  bedtime: any; // Json type from database
  l7_enabled: boolean;
  vpn_detection: boolean;
  kill_switch_mode: string;
  created_at: string;
}

const CATEGORY_OPTIONS = [
  { id: 'advertising', label: 'Advertising & Tracking' },
  { id: 'adult-content', label: 'Adult Content' },
  { id: 'gambling', label: 'Gambling' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'streaming', label: 'Video Streaming' },
  { id: 'news', label: 'News & Media' },
  { id: 'shopping', label: 'Shopping' },
];

const AGE_PRESETS = [
  {
    name: 'Early Years (3-5)',
    categories: ['adult-content', 'gambling', 'social-media', 'advertising'],
    safeSearch: true,
    studyMode: false
  },
  {
    name: 'Primary (6-11)', 
    categories: ['adult-content', 'gambling', 'advertising'],
    safeSearch: true,
    studyMode: false
  },
  {
    name: 'Secondary (12-16)',
    categories: ['adult-content', 'gambling'],
    safeSearch: true,
    studyMode: false
  },
  {
    name: 'Study Time',
    categories: ['social-media', 'gaming', 'streaming', 'news'],
    safeSearch: true,
    studyMode: true
  }
];

export const PolicyProfiles = () => {
  const [profiles, setProfiles] = useState<PolicyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PolicyProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_blocks: [] as string[],
    safe_search: true,
    study_mode: false,
    l7_enabled: false,
    vpn_detection: true,
    kill_switch_mode: 'pause'
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cpe_policy_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load policy profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = {
        ...formData,
        parent_id: user.id
      };

      if (editingProfile) {
        const { error } = await supabase
          .from('cpe_policy_profiles')
          .update(profileData)
          .eq('id', editingProfile.id);

        if (error) throw error;
        toast.success('Profile updated successfully');
      } else {
        const { error } = await supabase
          .from('cpe_policy_profiles')
          .insert([profileData]);

        if (error) throw error;
        toast.success('Profile created successfully');
      }

      setDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      fetchProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const { error } = await supabase
        .from('cpe_policy_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success('Profile deleted successfully');
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const handleApplyPreset = (preset: typeof AGE_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      category_blocks: preset.categories,
      safe_search: preset.safeSearch,
      study_mode: preset.studyMode
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_blocks: [],
      safe_search: true,
      study_mode: false,
      l7_enabled: false,
      vpn_detection: true,
      kill_switch_mode: 'pause'
    });
  };

  const openEditDialog = (profile: PolicyProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      category_blocks: profile.category_blocks,
      safe_search: profile.safe_search,
      study_mode: profile.study_mode,
      l7_enabled: profile.l7_enabled,
      vpn_detection: profile.vpn_detection,
      kill_switch_mode: profile.kill_switch_mode
    });
    setDialogOpen(true);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category_blocks: checked 
        ? [...prev.category_blocks, categoryId]
        : prev.category_blocks.filter(id => id !== categoryId)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Network Policy Profiles</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Profile' : 'Create New Profile'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Age Presets */}
              <div>
                <Label className="text-sm font-medium">Quick Start Presets</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AGE_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Profile Name */}
              <div>
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Kids Safe Browsing"
                />
              </div>

              {/* Category Blocks */}
              <div>
                <Label>Content Categories to Block</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={formData.category_blocks.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                      />
                      <Label htmlFor={category.id} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="safe_search">Safe Search</Label>
                  <Switch
                    id="safe_search"
                    checked={formData.safe_search}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, safe_search: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="study_mode">Study Mode</Label>
                  <Switch
                    id="study_mode"
                    checked={formData.study_mode}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, study_mode: checked }))}
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Advanced Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="l7_enabled">Layer 7 Inspection</Label>
                    <Switch
                      id="l7_enabled"
                      checked={formData.l7_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, l7_enabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vpn_detection">VPN Detection</Label>
                    <Switch
                      id="vpn_detection"
                      checked={formData.vpn_detection}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vpn_detection: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={!formData.name.trim()}>
                  {editingProfile ? 'Update' : 'Create'} Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {profile.name}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(profile)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.category_blocks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Blocked Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.category_blocks.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {CATEGORY_OPTIONS.find(opt => opt.id === category)?.label || category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Safe Search:</span>
                    <Badge variant={profile.safe_search ? "default" : "secondary"}>
                      {profile.safe_search ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Study Mode:</span>
                    <Badge variant={profile.study_mode ? "default" : "secondary"}>
                      {profile.study_mode ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">L7 Inspection:</span>
                    <Badge variant={profile.l7_enabled ? "default" : "secondary"}>
                      {profile.l7_enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Kill Switch:</span>
                    <Badge variant="outline">{profile.kill_switch_mode}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {profiles.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Policy Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create your first network policy profile to manage content filtering and safety settings.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};