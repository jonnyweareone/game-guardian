import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Users, ArrowLeft, ArrowRight, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AvatarSelector } from './AvatarSelector';

import { WebFiltersStep } from './WebFiltersStep';
import { bulkUpsertChildAppSelections } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WebFilterConfig {
  schoolHoursEnabled: boolean;
  socialMediaBlocked: boolean;
  gamingBlocked: boolean;
  entertainmentBlocked: boolean;
}

interface AddChildDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingChild?: any;
  onChildAdded: () => void;
}

const AddChildDialog = ({ open: controlledOpen, onOpenChange: controlledOnOpenChange, editingChild, onChildAdded }: AddChildDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'basic' | 'webfilters'>('basic');
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [webFilterConfig, setWebFilterConfig] = useState<WebFilterConfig>({
    schoolHoursEnabled: false,
    socialMediaBlocked: true, // Default to blocking social media for safety
    gamingBlocked: false,
    entertainmentBlocked: false
  });
  const { toast } = useToast();

  // Calculate age from DOB
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const childAge = dob ? calculateAge(dob) : undefined;

  // Initialize form with editing child data
  useEffect(() => {
    if (editingChild) {
      setName(editingChild.name || '');
      setDob(editingChild.dob ? new Date(editingChild.dob) : undefined);
      setSelectedAvatar(editingChild.avatar_url || null);
    } else {
      resetForm();
    }
  }, [editingChild]);

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
      if (!dob) {
        toast({
          title: "Date of birth required",
          description: "Please select your child's date of birth to show appropriate web filtering.",
          variant: "destructive"
        });
        return;
      }
      // If editing, skip to final step (basic info only)
      if (editingChild) {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
        return;
      }
      setStep('webfilters');
    }
  };

  const handleBack = () => {
    if (step === 'webfilters') {
      setStep('basic');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let childData;
      
      if (editingChild) {
        // Update existing child profile
        const { data: updatedChild, error: childError } = await supabase
          .from('children')
          .update({
            name: name.trim(),
            dob: dob?.toISOString().split('T')[0], // Save as YYYY-MM-DD
            age: childAge,
            avatar_url: selectedAvatar,
          })
          .eq('id', editingChild.id)
          .select()
          .single();

        if (childError) throw childError;
        childData = updatedChild;
      } else {
        // Create new child profile
        const { data: newChild, error: childError } = await supabase
          .from('children')
          .insert({
            name: name.trim(),
            dob: dob?.toISOString().split('T')[0], // Save as YYYY-MM-DD
            age: childAge,
            avatar_url: selectedAvatar,
            parent_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (childError) throw childError;
        childData = newChild;
      }

      // App selections are now handled automatically by devices
      // No need to save app selections during profile creation

      // Create NextDNS profile automatically (only for new children)
      if (!editingChild) {
        try {
          // Get or create household NextDNS config first
          const { data: householdConfig } = await supabase
            .from('household_dns_configs')
            .select('nextdns_config_id')
            .single();

          let configId = householdConfig?.nextdns_config_id;

          if (!configId) {
            // Provision NextDNS config for this household
            const { data: provisionResult, error: provisionError } = await supabase.functions.invoke('provision-nextdns', {
              body: {
                household_id: (await supabase.auth.getUser()).data.user?.id
              }
            });

            if (provisionError || !provisionResult?.ok) {
              throw new Error(provisionResult?.error || 'Failed to provision NextDNS config');
            }

            configId = provisionResult.configId;
          }

          // Ensure child has a NextDNS profile
          if (configId) {
            const { error: profileError } = await supabase.functions.invoke('ensure-child-profiles', {
              body: {
                configId,
                children: [{
                  id: childData.id,
                  name: name.trim()
                }]
              }
            });

            if (profileError) {
              console.warn('Failed to create NextDNS profile:', profileError);
              toast({
                title: "NextDNS Setup Warning",
                description: "Child profile created but NextDNS filtering could not be configured automatically. You can set this up manually later.",
                variant: "destructive"
              });
            }
          }
        } catch (nextdnsError) {
          console.warn('Failed to setup NextDNS:', nextdnsError);
        }
      }

      toast({
        title: editingChild ? "Child profile updated" : "Child profile created",
        description: editingChild 
          ? `${name}'s profile has been updated successfully.`
          : `${name} has been added to your family dashboard with web filtering configured.`
      });

      // Reset form
      resetForm();
      setOpen(false);
      onChildAdded();
    } catch (error: any) {
      toast({
        title: editingChild ? "Error updating profile" : "Error creating profile",
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
    setDob(undefined);
    setSelectedAvatar(null);
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
      case 'basic': return editingChild ? 'Edit Basic Information' : 'Basic Information';
      case 'webfilters': return 'Web Filters';
      default: return editingChild ? 'Edit Child Profile' : 'Add Child Profile';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'basic': return editingChild ? 'Update your child\'s profile information and avatar.' : 'Set up your child\'s profile with basic information and avatar.';
      case 'webfilters': return `Configure web filtering and parental controls for ${name}.`;
      default: return editingChild ? 'Edit your child\'s profile information.' : 'Add a new child to your Game Guardian AI monitoring dashboard.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button className="h-16 flex flex-col gap-2">
            <Plus className="h-5 w-5" />
            Add Child Profile
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getStepTitle()}
            <span className="text-sm font-normal text-muted-foreground">- Step {step === 'basic' ? 1 : 2} of 2</span>
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
                <Label htmlFor="child-dob">Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      disabled={(date) => 
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {dob && (
                  <p className="text-xs text-muted-foreground">
                    Age: {childAge} years old (used for app recommendations and DNS filtering)
                  </p>
                )}
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
                  {editingChild ? (
                    loading ? 'Updating Profile...' : 'Update Profile'
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next: Web Filters
                    </>
                  )}
                </Button>
              </div>
            </form>
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
                  {loading 
                    ? (editingChild ? 'Updating Profile...' : 'Creating Profile & Web Filters...') 
                    : (editingChild ? 'Update Profile' : 'Create Profile')
                  }
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
