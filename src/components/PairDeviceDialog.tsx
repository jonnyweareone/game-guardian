import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Child {
  id: string;
  name: string;
}

interface PairDeviceDialogProps {
  children: Child[];
  onDevicePaired: () => void;
}

const PairDeviceDialog = ({ children, onDevicePaired }: PairDeviceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceCode.trim()) {
      toast({
        title: "Device code required",
        description: "Please enter the device code from your Guardian AI box.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if device code exists and is not already paired
      const { data: existingDevice, error: checkError } = await supabase
        .from('devices')
        .select('*')
        .eq('device_code', deviceCode.toUpperCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingDevice && existingDevice.is_active) {
        throw new Error('This device is already paired to another account.');
      }

      // Create or update device record
      const deviceData = {
        device_code: deviceCode.toUpperCase(),
        device_name: deviceName.trim() || `Guardian AI Device ${deviceCode.slice(-4)}`,
        child_id: selectedChildId || null,
        parent_id: (await supabase.auth.getUser()).data.user?.id,
        is_active: true,
        paired_at: new Date().toISOString()
      };

      const { error } = existingDevice
        ? await supabase
            .from('devices')
            .update(deviceData)
            .eq('id', existingDevice.id)
        : await supabase
            .from('devices')
            .insert(deviceData);

      if (error) throw error;

      toast({
        title: "Device paired successfully!",
        description: `Your Guardian AI device is now protecting ${selectedChildId ? children.find(c => c.id === selectedChildId)?.name : 'your family'}.`
      });

      setDeviceCode('');
      setDeviceName('');
      setSelectedChildId('');
      setOpen(false);
      onDevicePaired();
    } catch (error: any) {
      toast({
        title: "Pairing failed",
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
        <Button variant="outline" className="h-16 flex flex-col gap-2">
          <Shield className="h-5 w-5" />
          Pair New Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Pair Guardian AI Device
          </DialogTitle>
          <DialogDescription>
            Enter the device code displayed on your Guardian AI box to connect it to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-code">Device Code *</Label>
            <Input
              id="device-code"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
              placeholder="GG-XXXX-XXXX"
              pattern="[A-Z0-9-]+"
              maxLength={20}
              required
            />
            <p className="text-xs text-muted-foreground">
              Find this code on your Guardian AI device screen
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-name">Device Name (optional)</Label>
            <Input
              id="device-name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., Gaming PC, PlayStation, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="child-assignment">Assign to Child (optional)</Label>
            <Select value={selectedChildId || 'none'} onValueChange={(v) => setSelectedChildId(v === 'none' ? '' : v)}>
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
              {loading ? 'Pairing...' : 'Pair Device'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PairDeviceDialog;