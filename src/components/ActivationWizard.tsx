
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Smartphone, CheckCircle, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AvatarSelector } from './AvatarSelector';
import { AppSelectionStep } from './AppSelectionStep';
import { WebFiltersStep } from './WebFiltersStep';
import { invokeEdgeFunction } from '@/lib/supabase-functions';

interface App {
  id: string;
  name: string;
  category: string;
  package?: string;
}

interface Child {
  id: string;
  name: string;
}

interface WebFilterConfig {
  schoolHoursEnabled: boolean;
  socialMediaBlocked: boolean;
  gamingBlocked: boolean;
  entertainmentBlocked: boolean;
}

interface ActivationWizardProps {
  deviceId: string;
  deviceCode: string;
  isOpen: boolean;
  onClose: () => void;
}

const ActivationWizard = ({ deviceId, deviceCode, isOpen, onClose }: ActivationWizardProps) => {
  console.log('ActivationWizard props:', { deviceId, deviceCode, isOpen });
  
  const [step, setStep] = useState(1);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [webFilterConfig, setWebFilterConfig] = useState<WebFilterConfig>({
    schoolHoursEnabled: false,
    socialMediaBlocked: true,
    gamingBlocked: false,
    entertainmentBlocked: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const childAge = newChildAge ? parseInt(newChildAge) : undefined;

  useEffect(() => {
    console.log('ActivationWizard isOpen changed:', isOpen);
    if (isOpen) {
      console.log('ActivationWizard opening, loading data...');
      loadChildren();
      loadApps();
      // Reset state when opening
      setStep(1);
      setSelectedChild('');
      setNewChildName('');
      setNewChildAge('');
      setSelectedAvatar(null);
      setSelectedApps(new Set());
      setWebFilterConfig({
        schoolHoursEnabled: false,
        socialMediaBlocked: true,
        gamingBlocked: false,
        entertainmentBlocked: false
      });
    }
  }, [isOpen]);

  const loadChildren = async () => {
    try {
      console.log('Loading children...');
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      console.log('Children loaded:', data);
      setChildren(data || []);
    } catch (error: any) {
      console.error('Error loading children:', error);
      toast({
        title: 'Error loading children',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const loadApps = async () => {
    try {
      console.log('Loading apps...');
      const { data, error } = await supabase
        .from('app_catalog')
        .select('id, name, category, is_essential')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      console.log('Apps loaded:', data);
      setApps(data || []);
      
      // Pre-select essential apps
      if (data && data.length > 0) {
        const essentialApps = data.filter(app => app.is_essential);
        setSelectedApps(new Set(essentialApps.map(app => app.id)));
      }
    } catch (error: any) {
      console.error('Error loading apps:', error);
      toast({
        title: 'Error loading apps',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const createChild = async () => {
    if (!newChildName.trim() || !user?.id) return null;
    
    try {
      console.log('Creating child:', { name: newChildName, age: childAge });
      const { data, error } = await supabase
        .from('children')
        .insert({ 
          name: newChildName.trim(),
          age: childAge,
          avatar_url: selectedAvatar,
          parent_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      console.log('Child created:', data);
      return data.id;
    } catch (error: any) {
      console.error('Error creating child:', error);
      toast({
        title: 'Error creating child',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleNext = async () => {
    console.log('handleNext - current step:', step);
    if (step === 1) {
      let childId = selectedChild;
      
      if (newChildName.trim()) {
        if (!newChildAge) {
          toast({
            title: 'Age required',
            description: 'Please enter your child\'s age to show appropriate apps.',
            variant: 'destructive'
          });
          return;
        }
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
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = async () => {
    console.log('handleConfirm - activating device...');
    setLoading(true);
    
    try {
      // Create NextDNS profile first
      try {
        const { error: dnsError } = await supabase.functions.invoke('nextdns-profile-manager', {
          body: {
            action: 'create_profile',
            child_id: selectedChild,
            child_name: selectedChildName,
            age: childAge,
            school_hours_enabled: webFilterConfig.schoolHoursEnabled,
            content_categories: {
              social_media: webFilterConfig.socialMediaBlocked,
              gaming: webFilterConfig.gamingBlocked,
              entertainment: webFilterConfig.entertainmentBlocked
            }
          }
        });

        if (dnsError) {
          console.warn('Failed to create web filter profile:', dnsError);
          toast({
            title: "Web Filter Setup Warning",
            description: "Device will be activated but web filtering may need manual setup later.",
            variant: "destructive"
          });
        } else {
          console.log('Web filter profile created successfully');
        }
      } catch (dnsError) {
        console.warn('Failed to create web filter profile:', dnsError);
      }

      // Call device post-install using the helper
      const { data, error } = await invokeEdgeFunction('device-postinstall', {
        device_id: deviceId,
        child_id: selectedChild,
        app_ids: Array.from(selectedApps),
        web_filter_config: webFilterConfig
      });
      
      if (error || !data?.ok) {
        throw new Error(error?.message || data?.error || 'Post-install failed');
      }
      
      console.log('Device activated successfully');
      toast({
        title: 'Device activated successfully!',
        description: 'Your device is being configured and will be ready shortly.'
      });
      
      onClose();
    } catch (error: any) {
      console.error('Activation failed:', error);
      toast({
        title: 'Activation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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

  const selectedChildName = children.find(c => c.id === selectedChild)?.name || newChildName;

  // Don't render anything if not open
  if (!isOpen) {
    console.log('ActivationWizard not rendering - isOpen is false');
    return null;
  }

  console.log('ActivationWizard rendering dialog...');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Activation - Step {step} of 4
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[500px]">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Select or Create Child Profile</h3>
              
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
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newChild">Create new child - Name *</Label>
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

                {newChildName.trim() && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="child-age">Age *</Label>
                      <Input
                        id="child-age"
                        type="number"
                        min="3"
                        max="18"
                        value={newChildAge}
                        onChange={(e) => setNewChildAge(e.target.value)}
                        placeholder="Enter age (used for app recommendations)"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Age is used to show appropriate apps and configure web filtering
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Choose Avatar</Label>
                      <AvatarSelector
                        selectedAvatar={selectedAvatar}
                        onAvatarSelect={setSelectedAvatar}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Select Apps for {selectedChildName}</h3>
              <AppSelectionStep
                childAge={childAge}
                selectedApps={selectedApps}
                onAppToggle={handleAppToggle}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <WebFiltersStep
                webFilterConfig={webFilterConfig}
                onWebFilterConfigChange={setWebFilterConfig}
                childName={selectedChildName}
                childAge={childAge}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Confirm Activation
              </h3>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Setup Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                    <span>{selectedApps.size} selected</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Web Protection Applied:</span>
                    </div>
                    <div className="text-sm text-muted-foreground ml-6 space-y-1">
                      <div>• Automatic blocking: Adult content, violence, drugs, terrorism</div>
                      <div>• Safe Search enabled on all search engines</div>
                      {webFilterConfig.socialMediaBlocked && <div>• Social media platforms blocked</div>}
                      {webFilterConfig.gamingBlocked && <div>• Gaming platforms filtered</div>}
                      {webFilterConfig.entertainmentBlocked && <div>• Entertainment content filtered</div>}
                      {webFilterConfig.schoolHoursEnabled && <div>• Enhanced school hours protection active</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground">
                Click "Activate Device" to begin the setup process. Your device will install the selected apps, configure web filters, and reboot automatically.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="ml-auto">
            {step < 4 ? (
              <Button onClick={handleNext}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Next
              </Button>
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
