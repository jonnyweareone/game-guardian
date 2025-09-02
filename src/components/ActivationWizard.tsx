import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Shield, User, Copy, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";
import Auth from "@/pages/Auth";
import AppSelectionStep from "@/components/AppSelectionStep";
import { DNSControlsStep } from "@/components/DNSControlsStep";

type Props = { deviceCode: string };
type Child = { id: string; name: string; dob?: string };

type Stage = "auth" | "bind" | "child" | "apps" | "dns" | "poll" | "posting" | "done" | "error";

interface DNSConfig {
  schoolHoursEnabled: boolean;
  nextDnsConfig: string;
  socialMediaBlocked: boolean;
  gamingBlocked: boolean;
  entertainmentBlocked: boolean;
}

// Helper function to calculate age from DOB
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper function to format age display
function formatAgeDisplay(dob: string): string {
  const age = calculateAge(dob);
  return `(age ${age})`;
}

export default function ActivationWizard({ deviceCode }: Props) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState<Stage>("auth");
  const [error, setError] = useState<string>("");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [newChildName, setNewChildName] = useState("");
  const [newChildDob, setNewChildDob] = useState("");
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [dnsConfig, setDnsConfig] = useState<DNSConfig>({
    schoolHoursEnabled: false,
    nextDnsConfig: "",
    socialMediaBlocked: true,
    gamingBlocked: true,
    entertainmentBlocked: true,
  });
  const [deviceJwt, setDeviceJwt] = useState<string>("");

  // Auth wall
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setStage("auth");
    } else {
      setStage("bind");
    }
  }, [user, authLoading]);

  // Bind device (parent session) → fetch children
  useEffect(() => {
    (async () => {
      if (stage !== "bind") return;
      
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) { 
          setStage("auth"); 
          return; 
        }

        // bind-device uses parent JWT
        const { data: bindRes, error: bindError } = await supabase.functions.invoke('bind-device', {
          body: { device_code: deviceCode },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (bindError) throw bindError;
        if (!bindRes?.ok) throw new Error(bindRes?.error || "Failed to bind device");

        // Load children with DOB data instead of age
        const { data: kids, error: kidsErr } = await supabase
          .from("children").select("id,name,dob").order("created_at", { ascending: true });
        if (kidsErr) throw kidsErr;
        setChildren(kids || []);
        setSelectedChildId(kids?.[0]?.id || "");
        
        setStage("child");
      } catch (e: any) {
        console.error("Bind device error:", e);
        setError(e.message || String(e));
        setStage("error");
      }
    })();
  }, [stage, deviceCode]);

  // Continue buttons
  async function goApps() {
    let childId = selectedChildId;
    let childAge = 8; // default age
    
    // Create new child if needed
    if (newChildName.trim()) {
      if (!newChildDob) {
        toast.error("Please enter the child's date of birth");
        return;
      }
      
      try {
        const { data: newChild, error: createError } = await supabase
          .from('children')
          .insert({ 
            name: newChildName.trim(),
            dob: newChildDob,
            parent_id: user?.id
          })
          .select("id,name,dob")
          .single();
        
        if (createError) throw createError;
        childId = newChild.id;
        setSelectedChildId(childId);
        childAge = calculateAge(newChild.dob);
      } catch (e: any) {
        console.error("Create child error:", e);
        toast.error("Failed to create child profile");
        return;
      }
    } else {
      // Use existing child - calculate age from their DOB
      const selectedChild = children.find(c => c.id === selectedChildId);
      if (selectedChild?.dob) {
        childAge = calculateAge(selectedChild.dob);
      }
    }
    
    if (!childId) { 
      toast.error("Please select or create a child profile."); 
      return; 
    }
    
    // Store child age for the apps step
    setStage("apps");
  }

  function goDns() {
    setStage("dns");
  }

  async function finish() {
    try {
      setStage("poll");

      // Poll activation-status for Device JWT with fallback
      const supabaseUrl = "https://xzxjwuzwltoapifcyzww.supabase.co";
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo";
      
      let jwt = "";
      console.log("Starting device activation polling for:", deviceCode);
      
      // Provision NextDNS during activation
      try {
        const { data: nextdnsResult } = await supabase.functions.invoke('provision-nextdns', {
          body: {
            device_id: deviceCode,
            household_id: user?.id
          }
        });

        if (nextdnsResult?.ok && nextdnsResult?.configId) {
          console.log('NextDNS provisioned:', nextdnsResult.configId);
          
          // Update DNS config with the provisioned config ID
          setDnsConfig(prev => ({
            ...prev,
            nextDnsConfig: nextdnsResult.configId
          }));

          // Ensure child profiles for all children
          if (children.length > 0) {
            await supabase.functions.invoke('ensure-child-profiles', {
              body: {
                configId: nextdnsResult.configId,
                children: children.map(child => ({
                  id: child.id,
                  name: child.name
                }))
              }
            });
          }
        }
      } catch (nextdnsError) {
        console.warn('NextDNS provisioning failed:', nextdnsError);
      }
      
      // Primary polling: activation-status endpoint
      for (let i = 0; i < 20; i++) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/activation-status?device_id=${encodeURIComponent(deviceCode)}`, {
            headers: { 
              apikey: anonKey, 
              Authorization: `Bearer ${anonKey}` 
            },
          });
          
          if (response.ok) {
            const r = await response.json();
            console.log(`Poll ${i + 1}: activation-status response:`, r);
            
            if (r?.activated && r?.device_jwt) { 
              jwt = r.device_jwt; 
              console.log("Device JWT obtained from activation-status");
              break; 
            }
          } else {
            console.warn(`activation-status returned ${response.status}, trying fallback`);
            
            // Fallback to device-status endpoint
            const fallbackResponse = await fetch(`${supabaseUrl}/functions/v1/device-status?device_id=${encodeURIComponent(deviceCode)}`, {
              headers: { 
                apikey: anonKey, 
                Authorization: `Bearer ${anonKey}` 
              },
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log(`Poll ${i + 1}: device-status fallback response:`, fallbackData);
              
              if (fallbackData?.activated && fallbackData?.device_jwt) {
                jwt = fallbackData.device_jwt;
                console.log("Device JWT obtained from device-status fallback");
                break;
              }
            }
          }
        } catch (fetchError) {
          console.warn(`Poll ${i + 1} failed:`, fetchError);
        }
        
        await sleep(1500);
      }
      
      if (!jwt) {
        console.error("Failed to obtain device JWT after polling");
        throw new Error("Device not activated yet. Please approve the device and retry.");
      }
      
      setDeviceJwt(jwt);

      // Build postinstall payload
      const app_ids = Array.from(selectedApps);
      
      const web_filter_config = {
        nextdns_profile: dnsConfig.nextDnsConfig || null,
        school_hours_enabled: dnsConfig.schoolHoursEnabled,
        social_media_blocked: dnsConfig.socialMediaBlocked,
        gaming_blocked: dnsConfig.gamingBlocked,
        entertainment_blocked: dnsConfig.entertainmentBlocked,
      };

      setStage("posting");
      console.log('Making device-postinstall call with:', {
        deviceCode,
        selectedChildId,
        selectedAppIds: app_ids,
        filterConfig: web_filter_config
      });

      const response = await fetch(`https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-postinstall`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
          'x-device-id': deviceCode,           // redundant header
          'x-child-id': selectedChildId        // redundant header
        },
        body: JSON.stringify({
          device_id: deviceCode,
          deviceCode,                          // alternate name
          child_id: selectedChildId,
          selectedChildId,                     // alternate name
          app_ids,
          web_filter_config,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('device-postinstall error:', response.status, errorText);
        throw new Error(`Device activation failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.error) {
        console.error("device-postinstall data error:", data.error);
        throw new Error(data.error);
      }

      console.log("Device activation completed successfully");
      setStage("done");
      setTimeout(() => navigate("/devices"), 4000);
    } catch (e: any) {
      console.error("Finish activation error:", e);
      setError(e.message || String(e));
      setStage("error");
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Device token copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const mask = (t: string) => {
    if (!t) return "";
    if (t.length <= 10) return t;
    return t.slice(0, 6) + "•".repeat(t.length - 10) + t.slice(-4);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  function Spinner({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <CardTitle>{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </CardHeader>
        </Card>
      </div>
    );
  }

  // UI States
  if (authLoading) {
    return <Spinner title="Loading..." />;
  }

  if (stage === "auth") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Activate Device</CardTitle>
            <p className="text-sm text-muted-foreground">
              Device: <span className="font-mono">{deviceCode}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to begin device activation
            </p>
          </CardHeader>
          <CardContent>
            <Auth />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "child") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Child Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Device: <span className="font-mono">{deviceCode}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No child profiles found. Create one below to continue.
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Choose existing child</Label>
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.dob ? formatAgeDisplay(c.dob) : '(no DOB)'}
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
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newChildName">Create new child</Label>
                <Input
                  id="newChildName"
                  placeholder="Enter child's name..."
                  value={newChildName}
                  onChange={(e) => {
                    setNewChildName(e.target.value);
                    setSelectedChildId("");
                  }}
                />
              </div>
              
              {newChildName.trim() && (
                <div className="space-y-2">
                  <Label htmlFor="newChildDob">Date of Birth *</Label>
                  <Input
                    id="newChildDob"
                    type="date"
                    value={newChildDob}
                    onChange={(e) => setNewChildDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // Can't be in the future
                    required
                  />
                </div>
              )}
            </div>
            
            <Button 
              onClick={goApps} 
              className="w-full"
              disabled={!selectedChildId && !newChildName.trim()}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "apps") {
    const selectedChild = children.find(c => c.id === selectedChildId);
    const childAge = selectedChild?.dob ? calculateAge(selectedChild.dob) : 8; // fallback to 8 if no DOB
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader>
            <CardTitle>Select Apps for {selectedChild?.name || 'this child'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto">
              <AppSelectionStep
                onNext={goDns}
                onBack={() => setStage("child")}
                selectedApps={Array.from(selectedApps)}
                onAppToggle={(appId, selected) => {
                  const newSelection = new Set(selectedApps);
                  if (selected) {
                    newSelection.add(appId);
                  } else {
                    newSelection.delete(appId);
                  }
                  setSelectedApps(newSelection);
                }}
                childAge={childAge}
              />
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStage("child")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={goDns}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "dns") {
    const selectedChild = children.find(c => c.id === selectedChildId);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <CardHeader>
            <CardTitle>Web Filters & Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto">
              <DNSControlsStep
                dnsConfig={dnsConfig}
                onDnsConfigChange={(config) => setDnsConfig(config)}
                childName={selectedChild?.name || 'this child'}
              />
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStage("apps")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={finish}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finish & Sync
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "poll") {
    return <Spinner title="Finishing sync…" subtitle={`Device ${deviceCode}`} />;
  }

  if (stage === "posting") {
    return <Spinner title="Applying settings…" subtitle="Installing apps and policies" />;
  }

  if (stage === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Confetti numberOfPieces={120} recycle={false} />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Device Activated! 🎉</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your device has been successfully configured
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Device:</span>
                  <span className="font-mono">{deviceCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Token:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{mask(deviceJwt)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(deviceJwt)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button onClick={() => navigate("/devices")} className="w-full">
                Go to Devices
              </Button>
              <Button variant="outline" onClick={() => navigate("/account")} className="w-full">
                Verify Account
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Redirecting to devices in 4 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Activation Issue</CardTitle>
            <p className="text-sm text-muted-foreground">
              Device: <span className="font-mono">{deviceCode}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Spinner title="Binding device…" subtitle={`Code ${deviceCode}`} />;
}
