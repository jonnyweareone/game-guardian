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
import { bulkUpsertChildAppSelections } from '@/lib/api';

interface AddChildDialogProps {
  onChildAdded: () => void;
}

const AddChildDialog = ({ onChildAdded }: AddChildDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'basic' | 'apps'>('basic');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleNext = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your child's name.",
        variant: "destructive"
      });
      return;
    }
    setStep('apps');
  };

  const handleBack = () => {
    setStep('basic');
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
          age: age ? parseInt(age) : null,
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
          // Don't fail the whole process if app selections fail
        }
      }

      toast({
        title: "Child profile created",
        description: `${name} has been added to your family dashboard.`
      });

      // Reset form
      setName('');
      setAge('');
      setSelectedAvatar(null);
      setSelectedApps(new Set());
      setStep('basic');
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

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setStep('basic');
      setName('');
      setAge('');
      setSelectedAvatar(null);
      setSelectedApps(new Set());
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Child Profile
            {step === 'apps' && (
              <span className="text-sm font-normal text-muted-foreground">- Step 2 of 2</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'basic' 
              ? 'Add a new child to your Game Guardian AI monitoring dashboard.'
              : 'Choose which apps your child can access on their devices.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'basic' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
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
              <Label htmlFor="child-age">Age (optional)</Label>
              <Input
                id="child-age"
                type="number"
                min="3"
                max="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
              />
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AppSelectionStep
              childAge={age ? parseInt(age) : undefined}
              selectedApps={selectedApps}
              onAppToggle={handleAppToggle}
            />
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;