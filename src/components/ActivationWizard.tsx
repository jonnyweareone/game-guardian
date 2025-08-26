import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Shield, User, Copy } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";
import Auth from "@/pages/Auth";

type Props = { deviceCode: string };

export default function ActivationWizard({ deviceCode }: Props) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState<"auth"|"bind"|"child"|"posting"|"poll"|"done"|"error">("auth");
  const [error, setError] = useState<string>("");
  const [children, setChildren] = useState<Array<{id:string;name:string}>>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [deviceJwt, setDeviceJwt] = useState<string>("");

  // 0) require auth
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setStage("auth");
    } else {
      setStage("bind");
    }
  }, [user, authLoading]);

  // 1) bind-device immediately after auth
  useEffect(() => {
    (async () => {
      if (stage !== "bind") return;
      
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) { 
          setStage("auth"); 
          return; 
        }

        const { data, error } = await supabase.functions.invoke('bind-device', {
          body: { device_code: deviceCode },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (error) throw error;
        if (!data?.ok) throw new Error(data?.error || "Failed to bind device");

        // next: fetch children
        const { data: kids, error: kidsErr } = await supabase
          .from("children").select("id,name").order("created_at", { ascending: true });
        if (kidsErr) throw kidsErr;
        
        setChildren(kids || []);
        setSelectedChild((kids?.[0]?.id) || "");
        setStage("child");
      } catch (e: any) {
        console.error("Bind device error:", e);
        setError(e.message || String(e));
        setStage("error");
      }
    })();
  }, [stage, deviceCode]);

  // 2) runs after user clicks Continue on child picker
  async function handlePostinstall() {
    try {
      let childId = selectedChild;
      
      // Create new child if needed
      if (newChildName.trim()) {
        if (!newChildAge) {
          toast.error("Please enter the child's age");
          return;
        }
        
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
      }
      
      if (!childId) throw new Error("Please select or create a child profile.");
      
      setStage("poll");

      // Poll activation-status until we get a device_jwt
      const supabaseUrl = "https://xzxjwuzwltoapifcyzww.supabase.co";
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo";
      
      let jwt = "";
      for (let i = 0; i < 10; i++) {
        const r = await fetch(`${supabaseUrl}/functions/v1/activation-status?device_id=${encodeURIComponent(deviceCode)}`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        }).then(r => r.json()).catch(() => ({}));
        
        if (r?.activated && r?.device_jwt) { 
          jwt = r.device_jwt; 
          break; 
        }
        await new Promise(res => setTimeout(res, 1500));
      }
      
      if (!jwt) throw new Error("Device not activated yet. Please approve activation on your device and retry.");

      // Call postinstall using Device JWT
      const { data, error } = await supabase.functions.invoke('device-postinstall', {
        body: { 
          device_id: deviceCode, 
          child_id: childId 
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setDeviceJwt(jwt);
      setStage("done");
      setTimeout(() => navigate("/devices"), 4000);
    } catch (e: any) {
      console.error("Postinstall error:", e);
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

  // UI
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="container max-w-lg text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-medium">Loading...</h1>
        </div>
      </div>
    );
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
              Sign in to continue with device activation
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
              Link a Child Profile
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
              onClick={handlePostinstall} 
              className="w-full"
              disabled={!selectedChild && !newChildName.trim()}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "poll") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <CardTitle>Finishing Setup...</CardTitle>
            <p className="text-sm text-muted-foreground">
              We're preparing your device. This may take a moment.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
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
            <CardTitle className="text-green-600">Device Activated!</CardTitle>
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
                Go to Settings
              </Button>
            </div>
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
            <CardTitle className="text-destructive">Activation Failed</CardTitle>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <CardTitle>Binding Device...</CardTitle>
          <p className="text-sm text-muted-foreground">
            Device: <span className="font-mono">{deviceCode}</span>
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}