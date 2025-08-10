import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface IdentityVerificationRow {
  id: string;
  user_id: string;
  status: string;
  id_check_completed: boolean;
  likeness_check_completed: boolean;
  verified_address_line1?: string | null;
  verified_address_line2?: string | null;
  verified_city?: string | null;
  verified_state?: string | null;
  verified_postal_code?: string | null;
  verified_country?: string | null;
  verified_at?: string | null;
}

interface DeviceLite { id: string; device_name?: string | null; device_code?: string | null }

const VerificationSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verification, setVerification] = useState<IdentityVerificationRow | null>(null);
  const [devices, setDevices] = useState<DeviceLite[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [locationResult, setLocationResult] = useState<{ matched: boolean; distance_meters: number } | null>(null);

  const [addressOpen, setAddressOpen] = useState(false);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: "",
  });

  const addressSummary = useMemo(() => {
    const parts = [address.line1, address.line2, address.city, address.state, address.postal, address.country].filter(Boolean);
    return parts.join(", ");
  }, [address]);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch latest verification row
        const { data: iv, error: ivErr } = await supabase
          .from("identity_verifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (ivErr) throw ivErr;
        if (iv) {
          setVerification(iv as IdentityVerificationRow);
          setAddress({
            line1: iv.verified_address_line1 || "",
            line2: iv.verified_address_line2 || "",
            city: iv.verified_city || "",
            state: iv.verified_state || "",
            postal: iv.verified_postal_code || "",
            country: iv.verified_country || "",
          });
        }

        // Fetch user's devices
        const { data: devs, error: devErr } = await supabase
          .from("devices")
          .select("id, device_name, device_code")
          .order("created_at", { ascending: false });
        if (devErr) throw devErr;
        setDevices(devs || []);
        setSelectedDeviceId(devs?.[0]?.id);
      } catch (e: any) {
        console.error("Failed to load verification data", e);
        toast({ title: "Load failed", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleStartVerification = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("identity-verify", {
        body: { action: "start" },
      });
      if (error) throw error;
      toast({ title: "Verification", description: data?.message || "Flow started." });
    } catch (e: any) {
      toast({ title: "Verification error", description: e.message || "Unable to start.", variant: "destructive" });
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (verification) {
        const { error } = await supabase
          .from("identity_verifications")
          .update({
            verified_address_line1: address.line1 || null,
            verified_address_line2: address.line2 || null,
            verified_city: address.city || null,
            verified_state: address.state || null,
            verified_postal_code: address.postal || null,
            verified_country: address.country || null,
            status: "pending",
            id_check_completed: false,
            likeness_check_completed: false,
            verified_at: null,
          })
          .eq("id", verification.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("identity_verifications")
          .insert({
            user_id: user.id,
            verified_address_line1: address.line1 || null,
            verified_address_line2: address.line2 || null,
            verified_city: address.city || null,
            verified_state: address.state || null,
            verified_postal_code: address.postal || null,
            verified_country: address.country || null,
            status: "pending",
          });
        if (error) throw error;
      }

      // Also reset flags via function (optional, keeps logic centralized)
      await supabase.functions.invoke("identity-verify", { body: { action: "reset_flags" } }).catch(() => undefined);

      toast({ title: "Address updated", description: "Verification will need to be completed again." });
      setAddressOpen(false);
      // Refresh state
      const { data: iv } = await supabase
        .from("identity_verifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (iv) setVerification(iv as IdentityVerificationRow);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleValidateLocation = async () => {
    if (!selectedDeviceId) return;
    try {
      const { data, error } = await supabase.functions.invoke("location-verify", {
        body: { device_id: selectedDeviceId },
      });
      if (error) throw error;
      setLocationResult({ matched: !!data?.matched, distance_meters: Number(data?.distance_meters) || 0 });
      toast({ title: data?.matched ? "Location matches" : "Location mismatch", description: `Distance: ${data?.distance_meters}m` });
    } catch (e: any) {
      setLocationResult(null);
      toast({ title: "Validation error", description: e.message, variant: "destructive" });
    }
  };

  const idDone = !!verification?.id_check_completed;
  const likenessDone = !!verification?.likeness_check_completed;
  const addressDone = !!(
    (verification?.verified_address_line1 || verification?.verified_city || verification?.verified_country) &&
    verification?.verified_at
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Verification</CardTitle>
          <CardDescription>Loading your verification status…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Verification</CardTitle>
          <CardDescription>Complete ID + likeness checks and verify your address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <span className="font-medium">ID Check</span>
                <Badge variant={idDone ? "secondary" : "outline"}>{idDone ? "Complete" : "Incomplete"}</Badge>
              </div>
              {!idDone && (
                <Button className="mt-3 w-full" onClick={handleStartVerification}>Start Verification</Button>
              )}
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <span className="font-medium">Likeness Check</span>
                <Badge variant={likenessDone ? "secondary" : "outline"}>{likenessDone ? "Complete" : "Incomplete"}</Badge>
              </div>
              {!likenessDone && (
                <Button className="mt-3 w-full" onClick={handleStartVerification}>Continue</Button>
              )}
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <span className="font-medium">Verified Address</span>
                <Badge variant={addressDone ? "secondary" : "outline"}>{addressDone ? "Verified" : "Unverified"}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-2 min-h-[20px]">
                {verification?.verified_address_line1 ? (
                  <>
                    <div>{verification.verified_address_line1}</div>
                    {verification.verified_address_line2 && <div>{verification.verified_address_line2}</div>}
                    <div>{[verification.verified_city, verification.verified_state, verification.verified_postal_code].filter(Boolean).join(", ")}</div>
                    <div>{verification.verified_country}</div>
                  </>
                ) : (
                  <span>No address on file.</span>
                )}
              </div>
              <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-3 w-full">Update Address</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Verified Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="line1">Address line 1</Label>
                      <Input id="line1" value={address.line1} onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="line2">Address line 2</Label>
                      <Input id="line2" value={address.line2} onChange={(e) => setAddress((p) => ({ ...p, line2: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Region</Label>
                        <Input id="state" value={address.state} onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))} />
                      </div>
                      <div>
                        <Label htmlFor="postal">Postal code</Label>
                        <Input id="postal" value={address.postal} onChange={(e) => setAddress((p) => ({ ...p, postal: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={address.country} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))} />
                    </div>
                    <div className="text-sm text-muted-foreground">Saving will mark verification as pending and require you to verify again.</div>
                    <Button onClick={handleSaveAddress} disabled={saving} className="w-full">{saving ? "Saving…" : "Save & Reset Verification"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validate Device Location</CardTitle>
          <CardDescription>Checks if the device's last location (via IP) matches your verified address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.length === 0 ? (
            <div className="text-sm text-muted-foreground">No devices found.</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
              <div className="md:min-w-[260px]">
                <Select value={selectedDeviceId} onValueChange={(v) => setSelectedDeviceId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.device_name || d.device_code || d.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleValidateLocation}>Validate</Button>
              {locationResult && (
                <Badge variant={locationResult.matched ? "secondary" : "destructive"}>
                  {locationResult.matched ? "Match" : "Mismatch"} · {locationResult.distance_meters}m
                </Badge>
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground">Note: Geocoding requires a Mapbox token set in Edge Function secrets; IP geolocation uses a public API.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationSection;
