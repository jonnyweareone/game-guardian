import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AvatarSelector } from './AvatarSelector';

interface AddChildDialogProps {
  onChildAdded: () => void;
}

const AddChildDialog = ({ onChildAdded }: AddChildDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your child's name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('children')
        .insert({
          name: name.trim(),
          age: age ? parseInt(age) : null,
          avatar_url: selectedAvatar,
          parent_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Child profile created",
        description: `${name} has been added to your family dashboard.`
      });

      setName('');
      setAge('');
      setSelectedAvatar(null);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-16 flex flex-col gap-2">
          <Plus className="h-5 w-5" />
          Add Child Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Child Profile
          </DialogTitle>
          <DialogDescription>
            Add a new child to your Game Guardian AI monitoring dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;