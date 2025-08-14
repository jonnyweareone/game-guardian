
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AvatarSelector } from './AvatarSelector';
import { AppSelectionStep } from './AppSelectionStep';
import { WebFiltersStep } from './WebFiltersStep';
import { bulkUpsertChildAppSelections } from '@/lib/api';

interface WebFilterConfig {
  schoolHoursEnabled: boolean;
  socialMediaBlocked: boolean;
  gamingBlocked: boolean;
  entertainmentBlocked: boolean;
}

interface AddChildDialogProps {
  onChildAdded: () => void;
}

const AddChildDialog = ({ onChildAdded }: AddChildDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'basic' | 'apps' | 'webfilters'>('basic');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [webFilterConfig, setWebFilterConfig] = useState<WebFilterConfig>({
    schoolHoursEnabled: false,
    socialMediaBlocked: true, // Default to blocking social media for safety
    gamingBlocked: false,
    entertainmentBlocked: false
  });
  const { toast } = useToast();

  const childAge = age ? parseInt(age) : undefined;

  const handleNext = () => {
    if (step === 'basic') {
      if (!name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your child's name.",
          variant: "destructive"
        });
        return;
      }
      if (!age) {
        toast({
          title: "Age required",
          description: "Please enter your child's age to show appropriate apps.",
          variant: "destructive"
        });
        return;
      }
      setStep('apps');
    } else if (step === 'apps') {
      setStep('webfilters');
    }
  };

  const handleBack = () => {
    if (step === 'apps') {
      setStep('basic');
    } else if (step === 'webfilters') {
      setStep('apps');
    }
  };

  const handleAppToggle = (appId: string, selected: boolean) => {
    setSelectedApps(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(appId);
      } else {
        newSet.delete(appId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Create child profile
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          name: name.trim(),
          age: childAge,
          avatar_url: selectedAvatar,
          parent_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (childError) throw childError;

      // Save app selections
      if (selectedApps.size > 0) {
        const selections = Array.from(selectedApps).map(appId => ({
          app_id: appId,
          selected: true
        }));
        
        try {
          await bulkUpsertChildAppSelections(childData.id, selections);
        } catch (appError) {
          console.warn('Failed to save app selections:', appError);
        }
      }

      // Create web filter profile automatically
      try {
        const { error: webFilterError } = await supabase.functions.invoke('nextdns-profile-manager', {
          body: {
            action: 'create_profile',
            child_id: childData.id,
            child_name: name.trim(),
            age: childAge,
            school_hours_enabled: webFilterConfig.schoolHoursEnabled,
            content_categories: {
              social_media: webFilterConfig.socialMediaBlocked,
              gaming: webFilterConfig.gamingBlocked,
              entertainment: webFilterConfig.entertainmentBlocked
            }
          }
        });

        if (webFilterError) {
          console.warn('Failed to create web filter profile:', webFilterError);
          toast({
            title: "Web Filter Setup Warning",
            description: "Child profile created but web filtering could not be configured automatically. You can set this up manually later.",
            variant: "destructive"
          });
        } else {
          console.log('Web filter profile created successfully');
        }
      } catch (webFilterError) {
        console.warn('Failed to create web filter profile:', webFilterError);
      }

      toast({
        title: "Child profile created",
        description: `${name} has been added to your family dashboard with age-appropriate app selections and web filtering.`
      });

      // Reset form
      resetForm();
      setOpen(false);
      onChildAdded();
    } catch (error: any) {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('basic');
    setName('');
    setAge('');
    setSelectedAvatar(null);
    setSelectedApps(new Set());
    setWebFilterConfig({
      schoolHoursEnabled: false,
      socialMediaBlocked: true,
      gamingBlocked: false,
      entertainmentBlocked: false
    });
  };

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'basic': return 'Basic Information';
      case 'apps': return 'App Selection';
      case 'webfilters': return 'Web Filters';
      default: return 'Add Child Profile';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'basic': return 'Set up your child\'s profile with basic information and avatar.';
      case 'apps': return `Choose age-appropriate apps for ${name} (Age ${age}).`;
      case 'webfilters': return `Configure web filtering and parental controls for ${name}.`;
      default: return 'Add a new child to your Game Guardian AI monitoring dashboard.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="h-16 flex flex-col gap-2">
          <Plus className="h-5 w-5" />
          Add Child Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getStepTitle()}
            <span className="text-sm font-normal text-muted-foreground">- Step {step === 'basic' ? 1 : step === 'apps' ? 2 : 3} of 3</span>
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[500px]">
          {step === 'basic' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="child-name">Child's Name *</Label>
                <Input
                  id="child-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your child's name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="child-age">Age *</Label>
                <Input
                  id="child-age"
                  type="number"
                  min="3"
                  max="18"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter age (used for app recommendations)"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Age is used to show appropriate apps and configure DNS filtering
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Choose Avatar</Label>
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next: Choose Apps
                </Button>
              </div>
            </form>
          ) : step === 'apps' ? (
            <div className="space-y-4">
              <AppSelectionStep
                childAge={childAge}
                selectedApps={selectedApps}
                onAppToggle={handleAppToggle}
              />
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next: Web Filters
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <WebFiltersStep
                webFilterConfig={webFilterConfig}
                onWebFilterConfigChange={setWebFilterConfig}
                childName={name}
                childAge={childAge}
              />
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Profile & Web Filters...' : 'Create Profile'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;
