
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Apps, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ActivationWizardProps {
  deviceId: string;
  deviceCode: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Child {
  id: string;
  name: string;
  age?: number;
}

interface App {
  id: string;
  name: string;
  category?: string;
  essential: boolean;
  type: string;
  source?: string;
  package: string;
}

const ActivationWizard = ({ deviceId, deviceCode, isOpen, onClose }: ActivationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load children and apps on mount
  useEffect(() => {
    if (isOpen && user) {
      loadChildren();
      loadApps();
    }
  }, [isOpen, user]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, age')
        .eq('parent_id', user?.id)
        .order('name');

      if (error) throw error;
      setChildren(data || []);
    } catch (error: any) {
      console.error('Error loading children:', error);
      setError('Failed to load children');
    }
  };

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('id, name, category, essential, type, source, package')
        .order('essential', { ascending: false })
        .order('name');

      if (error) throw error;
      
      const appData = data || [];
      setApps(appData);
      
      // Pre-select essential apps
      const essentialApps = appData.filter(app => app.essential).map(app => app.id);
      setSelectedApps(essentialApps);
    } catch (error: any) {
      console.error('Error loading apps:', error);
      setError('Failed to load app catalog');
    }
  };

  const handleCreateChild = async () => {
    if (!newChildName.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .insert([{
          parent_id: user?.id,
          name: newChildName.trim(),
          age: newChildAge ? parseInt(newChildAge) : null
        }])
        .select()
        .single();

      if (error) throw error;

      setChildren([...children, data]);
      setSelectedChild(data.id);
      setNewChildName('');
      setNewChildAge('');
      setShowCreateChild(false);
      
      toast({
        title: "Child profile created",
        description: `${data.name} has been added to your family.`
      });
    } catch (error: any) {
      console.error('Error creating child:', error);
      setError('Failed to create child profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppToggle = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleComplete = async () => {
    if (!selectedChild) {
      setError('Please select or create a child profile');
      return;
    }

    setIsLoading(true);
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
        title: "Device setup complete!",
        description: "Your Guardian AI device is now configured and protecting your child."
      });

      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error completing setup:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedChild) {
      setError('Please select or create a child profile');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle>Guardian AI Setup Wizard</DialogTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Device: {deviceCode}</span>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Child Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Select Child Profile</h3>
            </div>

            {children.length > 0 && !showCreateChild && (
              <div className="space-y-2">
                <Label>Choose which child will use this device:</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name} {child.age && `(${child.age} years old)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(children.length === 0 || showCreateChild) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Child Profile
                  </CardTitle>
                  <CardDescription>
                    Add a new child to your Guardian AI family protection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-name">Child's Name *</Label>
                    <Input
                      id="child-name"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      placeholder="Enter child's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-age">Age (optional)</Label>
                    <Input
                      id="child-age"
                      type="number"
                      min="1"
                      max="18"
                      value={newChildAge}
                      onChange={(e) => setNewChildAge(e.target.value)}
                      placeholder="Age in years"
                    />
                  </div>
                  <Button onClick={handleCreateChild} disabled={isLoading || !newChildName.trim()}>
                    Create Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {children.length > 0 && !showCreateChild && (
              <Button variant="outline" onClick={() => setShowCreateChild(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Child Profile
              </Button>
            )}
          </div>
        )}

        {/* Step 2: App Selection */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Apps className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Select Apps to Install</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Choose which apps to install on the device. Essential apps are pre-selected for safety.
            </p>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {apps.map((app) => (
                <Card key={app.id} className={`p-3 ${app.essential ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`app-${app.id}`}
                      checked={selectedApps.includes(app.id)}
                      onCheckedChange={() => handleAppToggle(app.id)}
                      disabled={app.essential}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`app-${app.id}`} className="font-medium">
                          {app.name}
                        </Label>
                        {app.essential && (
                          <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                            Essential
                          </span>
                        )}
                      </div>
                      {app.category && (
                        <p className="text-sm text-muted-foreground">{app.category}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Selected {selectedApps.length} apps for installation
            </p>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Confirm Setup</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Setup Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Device:</Label>
                  <p className="text-sm text-muted-foreground">{deviceCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Child:</Label>
                  <p className="text-sm text-muted-foreground">
                    {children.find(c => c.id === selectedChild)?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Apps to Install:</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedApps.length} apps selected
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your device will automatically install the selected apps and configure parental controls. 
                This process may take a few minutes and will require a reboot.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
          >
            Previous
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={nextStep} disabled={isLoading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivationWizard;
