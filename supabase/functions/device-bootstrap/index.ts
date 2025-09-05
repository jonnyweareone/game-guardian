/**
 * Supabase Edge Function: device-bootstrap
 * - Public endpoint for devices to set refresh_secret before activation
 * - Enables perpetual JWT rotation without parent token dependency
 * - Only works for unowned devices (security measure)
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

function b64url(buf: Uint8Array) {
  return btoa(String.fromCharCode(...buf)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}

async function sha256b64url(data: string) {
  const enc = new TextEncoder().encode(data);
  const d = await crypto.subtle.digest("SHA-256", enc);
  return b64url(new Uint8Array(d));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, { status: 405 });

  try {
    const { device_code, refresh_secret } = await req.json();
    
    if (!device_code || !refresh_secret) {
      return json({ error: "device_code and refresh_secret required" }, { status: 400 });
    }

    const deviceCodeUpper = device_code.toUpperCase();

    // Service role client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Security check: only allow bootstrap for unowned devices
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id, parent_id, device_code")
      .eq("device_code", deviceCodeUpper)
      .maybeSingle();

    if (deviceError) {
      console.error("device-bootstrap device lookup error:", deviceError);
      return json({ error: "Device lookup failed" }, { status: 400 });
    }

    // If device exists and has a parent, reject
    if (device && device.parent_id) {
      console.log("device-bootstrap: Attempt to bootstrap owned device", deviceCodeUpper);
      return json({ error: "Device already owned" }, { status: 403 });
    }

    // Hash the refresh secret
    const refresh_secret_hash = await sha256b64url(refresh_secret);

    // Store the bootstrap secret
    const { error: insertError } = await supabase
      .from("device_bootstrap_secrets")
      .upsert({
        device_code: deviceCodeUpper,
        refresh_secret_hash,
      }, { onConflict: "device_code" });

    if (insertError) {
      console.error("device-bootstrap insert error:", insertError);
      return json({ error: "Failed to store bootstrap secret" }, { status: 500 });
    }

    console.log("device-bootstrap: Success for", deviceCodeUpper);

    return json({ ok: true });
  } catch (e) {
    console.error("device-bootstrap error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});