
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Smartphone, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface App {
  id: string;
  name: string;
  type: string;
  package: string;
  category?: string;
}

interface Child {
  id: string;
  name: string;
}

interface ActivationWizardProps {
  deviceId: string;
  deviceCode: string;
  isOpen: boolean;
  onClose: () => void;
}

const ActivationWizard = ({ deviceId, deviceCode, isOpen, onClose }: ActivationWizardProps) => {
  const [step, setStep] = useState(1);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [newChildName, setNewChildName] = useState('');
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadChildren();
      loadApps();
    }
  }, [isOpen]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setChildren(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading children',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('id, name, type, package, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      setApps(data || []);
      
      // Pre-select essential apps (you can modify this logic as needed)
      const essentialApps = (data || []).filter(app => 
        ['Firefox', 'Chrome', 'Educational Games'].includes(app.name)
      );
      setSelectedApps(essentialApps.map(app => app.id));
    } catch (error: any) {
      toast({
        title: 'Error loading apps',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const createChild = async () => {
    if (!newChildName.trim()) return null;
    
    try {
      const { data, error } = await supabase
        .from('children')
        .insert({ name: newChildName.trim() })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    } catch (error: any) {
      toast({
        title: 'Error creating child',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      let childId = selectedChild;
      
      if (newChildName.trim()) {
        childId = await createChild();
        if (!childId) return;
      }
      
      if (!childId) {
        toast({
          title: 'Please select a child',
          description: 'You must select an existing child or create a new one.',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedChild(childId);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('device-postinstall', {
        body: {
          device_id: deviceId,
          child_id: selectedChild,
          app_ids: selectedApps
        }
      });
      
      if (error || !data?.ok) {
        throw new Error(error?.message || data?.error || 'Post-install failed');
      }
      
      toast({
        title: 'Device activated successfully!',
        description: 'Your device is being configured and will be ready shortly.'
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: 'Activation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const selectedChildName = children.find(c => c.id === selectedChild)?.name || newChildName;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Activation - Step {step} of 3
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">Select or Create Child Profile</h3>
            
            {children.length > 0 && (
              <div className="space-y-2">
                <Label>Select existing child:</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newChild">Create new child:</Label>
              <Input
                id="newChild"
                placeholder="Enter child's name..."
                value={newChildName}
                onChange={(e) => {
                  setNewChildName(e.target.value);
                  setSelectedChild('');
                }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Select Apps for {selectedChildName}</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {apps.map(app => (
                <div key={app.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={app.id}
                    checked={selectedApps.includes(app.id)}
                    onCheckedChange={() => toggleApp(app.id)}
                  />
                  <Label htmlFor={app.id} className="flex-1 cursor-pointer">
                    {app.name}
                    {app.category && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({app.category})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedApps.length} apps selected
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirm Activation
            </h3>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Setup Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device:</span>
                  <span>{deviceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Child:</span>
                  <span>{selectedChildName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Apps:</span>
                  <span>{selectedApps.length} selected</span>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              Click "Activate Device" to begin the setup process. Your device will install the selected apps and reboot automatically.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <div className="ml-auto">
            {step < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleConfirm} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Activate Device
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivationWizard;
