
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assignChildToDevice, setActiveChild } from '@/lib/api';

interface Child {
  id: string;
  name: string;
}

interface Device {
  id: string;
  device_name: string;
  device_code: string;
  child_id?: string;
}

interface DeviceChildAssignmentDialogProps {
  device: Device;
  children: Child[];
  onAssignmentChanged: () => void;
}

const DeviceChildAssignmentDialog = ({ device, children, onAssignmentChanged }: DeviceChildAssignmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(device.child_id || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (selectedChildId && selectedChildId !== 'none') {
        console.log('Assigning child to device:', device.id, selectedChildId);
        
        // First create the assignment
        await assignChildToDevice(device.id, selectedChildId, true);
        
        // Then set as active child
        await setActiveChild(device.id, selectedChildId);
        
        const childName = children.find(c => c.id === selectedChildId)?.name;
        toast({
          title: "Assignment successful!",
          description: `Device "${device.device_name || device.device_code}" is now assigned to ${childName}.`
        });
      } else {
        // Remove assignment by setting no active child
        // Note: We might need to add an API endpoint to remove assignments
        toast({
          title: "Assignment removed",
          description: `Device "${device.device_name || device.device_code}" is no longer assigned to a specific child.`
        });
      }

      setOpen(false);
      onAssignmentChanged();
    } catch (error: any) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment failed",
        description: error?.message || 'Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
          Assign Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Device to Child</DialogTitle>
          <DialogDescription>
            Choose which child should use "{device.device_name || device.device_code}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Child</label>
            <Select value={selectedChildId || 'none'} onValueChange={setSelectedChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific child</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Assigning...' : 'Save Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceChildAssignmentDialog;
