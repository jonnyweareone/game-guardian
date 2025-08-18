
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, { status: 405 });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { token, platform, device_info } = await req.json();

    if (!token || !platform) {
      return json({ error: "token and platform required" }, { status: 400 });
    }

    // Verify token exists and is not expired
    const { data: pairToken, error: tokenError } = await supabase
      .from("device_pair_tokens")
      .select("*")
      .eq("token", token)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !pairToken) {
      return json({ error: "invalid_or_expired_token" }, { status: 400 });
    }

    // Create new mobile device
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .insert({
        parent_id: (await supabase.from("children").select("parent_id").eq("id", pairToken.child_id).single()).data?.parent_id,
        child_id: pairToken.child_id,
        kind: "mobile",
        platform: platform,
        device_code: `MOB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        is_active: true,
        status: "enrolled",
        paired_at: new Date().toISOString(),
        ...device_info
      })
      .select()
      .single();

    if (deviceError) {
      console.error("Device creation failed:", deviceError);
      return json({ error: "create_device_failed" }, { status: 500 });
    }

    // Mark token as used
    await supabase
      .from("device_pair_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", pairToken.id);

    return json({
      device_id: device.id,
      device_code: device.device_code,
      child_id: pairToken.child_id,
      status: "enrolled"
    });

  } catch (error) {
    console.error("Mobile device registration error:", error);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
