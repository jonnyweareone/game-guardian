import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle, Shield, User, Copy, ArrowLeft, ArrowRight, Smartphone, Settings } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";
import Auth from "@/pages/Auth";

type Props = { deviceCode: string };
type Child = { id: string; name: string };
type App = { id: string; name: string; category: string; is_essential?: boolean };

type Stage = "auth" | "bind" | "child" | "apps" | "dns" | "poll" | "posting" | "done" | "error";

export default function ActivationWizard({ deviceCode }: Props) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState<Stage>("auth");
  const [error, setError] = useState<string>("");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApps, setSelectedApps] = useState<Record<string, boolean>>({});
  const [dnsId, setDnsId] = useState<string>("");
  const [schoolHours, setSchoolHours] = useState<boolean>(false);
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

  // Bind device (parent session) → fetch children + apps
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

        // Load children
        const { data: kids, error: kidsErr } = await supabase
          .from("children").select("id,name").order("created_at", { ascending: true });
        if (kidsErr) throw kidsErr;
        setChildren(kids || []);
        setSelectedChild(kids?.[0]?.id || "");

        // Load apps
        const { data: catalog, error: appErr } = await supabase
          .from("app_catalog")
          .select("id,name,category,is_essential")
          .eq("is_active", true)
          .order("category", { ascending: true })
          .order("name", { ascending: true });
        if (appErr) throw appErr;
        
        setApps(catalog || []);
        
        // Pre-select essential apps
        const essentialApps = (catalog || []).filter(app => app.is_essential);
        const initialSelection: Record<string, boolean> = {};
        essentialApps.forEach(app => {
          initialSelection[app.id] = true;
        });
        setSelectedApps(initialSelection);
        
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
    let childId = selectedChild;
    
    // Create new child if needed
    if (newChildName.trim()) {
      if (!newChildAge) {
        toast.error("Please enter the child's age");
        return;
      }
      
      try {
        const { data: newChild, error: createError } = await supabase
          .from('children')
          .insert({ 
            name: newChildName.trim(),
            age: parseInt(newChildAge),
            parent_id: user?.id
          })
          .select()
          .single();
        
        if (createError) throw createError;
        childId = newChild.id;
        setSelectedChild(childId);
      } catch (e: any) {
        console.error("Create child error:", e);
        toast.error("Failed to create child profile");
        return;
      }
    }
    
    if (!childId) { 
      toast.error("Please select or create a child profile."); 
      return; 
    }
    setStage("apps");
  }

  function goDns() {
    setStage("dns");
  }

  async function finish() {
    try {
      setStage("poll");

      // Poll activation-status for Device JWT
      const supabaseUrl = "https://xzxjwuzwltoapifcyzww.supabase.co";
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo";
      
      let jwt = "";
      for (let i = 0; i < 12; i++) {
        const r = await fetch(`${supabaseUrl}/functions/v1/activation-status?device_id=${encodeURIComponent(deviceCode)}`, {
          headers: { 
            apikey: anonKey, 
            Authorization: `Bearer ${anonKey}` 
          },
        }).then(r => r.json()).catch(() => ({} as any));
        
        if (r?.activated && r?.device_jwt) { 
          jwt = r.device_jwt; 
          break; 
        }
        await sleep(1500);
      }
      
      if (!jwt) throw new Error("Device not activated yet. Please approve the device and retry.");
      setDeviceJwt(jwt);

      // Build postinstall payload
      const app_ids = Object.entries(selectedApps)
        .filter(([_, selected]) => selected)
        .map(([appId]) => appId);
      
      const web_filter_config = (dnsId || schoolHours) ? {
        nextdns_profile: dnsId || null,
        school_hours_enabled: !!schoolHours,
        social_media_blocked: true,
        gaming_blocked: false,
        entertainment_blocked: false,
      } : {};

      setStage("posting");

      // Call device-postinstall with Device JWT
      const { data, error } = await supabase.functions.invoke('device-postinstall', {
        body: {
          device_id: deviceCode,
          child_id: selectedChild,
          app_ids,
          web_filter_config,
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                    setSelectedChild("");
                  }}
                />
              </div>
              
              {newChildName.trim() && (
                <div className="space-y-2">
                  <Label htmlFor="newChildAge">Age *</Label>
                  <Input
                    id="newChildAge"
                    type="number"
                    min="3"
                    max="18"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(e.target.value)}
                    placeholder="Enter age..."
                    required
                  />
                </div>
              )}
            </div>
            
            <Button 
              onClick={goApps} 
              className="w-full"
              disabled={!selectedChild && !newChildName.trim()}
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Select Apps
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose apps to pre-load for this child. You can change this later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {apps.map(app => (
                <label key={app.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                  <Checkbox
                    checked={!!selectedApps[app.id]}
                    onCheckedChange={(checked) => 
                      setSelectedApps(prev => ({ ...prev, [app.id]: !!checked }))
                    }
                  />
                  <div className="flex-1">
                    <span className="font-medium">{app.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{app.category}</span>
                    {app.is_essential && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">Essential</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              DNS & Web Filter
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure web filtering and parental controls
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dnsId">NextDNS Profile ID (optional)</Label>
              <Input
                id="dnsId"
                placeholder="abcd1234"
                value={dnsId}
                onChange={(e) => setDnsId(e.target.value.trim())}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default web filtering
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schoolHours"
                checked={schoolHours}
                onCheckedChange={(checked) => setSchoolHours(!!checked)}
              />
              <Label htmlFor="schoolHours" className="text-sm font-normal">
                Enable enhanced school hours policy
              </Label>
            </div>
            
            <div className="flex justify-between pt-4">
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