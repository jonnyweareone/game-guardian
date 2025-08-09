// Supabase Edge Function: auth-2fa
// Handles TOTP setup/verification and recovery codes
// Routes via JSON body action: 'totp_setup' | 'totp_verify' | 'recovery_rotate'

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { authenticator } from "npm:otplib";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Json = Record<string, unknown>;

function json(body: Json, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}), ...corsHeaders },
  });
}

function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    // Format like XXXX-XXXX-XXXX
    const code = `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`.toUpperCase();
    codes.push(code);
  }
  return codes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, { status: 401 });
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const action = (body?.action as string) || "";

    // Fetch or prepare security row
    const { data: secRow, error: secErr } = await supabase
      .from("user_security")
      .select("id, user_id, totp_secret, totp_enabled, recovery_codes")
      .eq("user_id", user.id)
      .maybeSingle();

    if (secErr) return json({ error: secErr.message }, { status: 400 });

    if (action === "totp_setup") {
      if (secRow?.totp_enabled) {
        return json({ error: "TOTP already enabled" }, { status: 409 });
      }

      let secret = secRow?.totp_secret as string | null;
      if (!secret) {
        secret = authenticator.generateSecret();
        const upsert = {
          user_id: user.id,
          totp_secret: secret,
        } as Record<string, unknown>;
        if (!secRow) {
          const { error } = await supabase.from("user_security").insert(upsert);
          if (error) return json({ error: error.message }, { status: 400 });
        } else {
          const { error } = await supabase.from("user_security").update(upsert).eq("id", secRow.id);
          if (error) return json({ error: error.message }, { status: 400 });
        }
      }

      const email = user.email ?? "user";
      const issuer = "Game Guardian AI";
      const otpauthUrl = authenticator.keyuri(email, issuer, secret!);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
      return json({ otpauth_url: otpauthUrl, qr_url: qrUrl });
    }

    if (action === "totp_verify") {
      const code = String(body?.code ?? "").replace(/\s+/g, "");
      if (!code) return json({ error: "Missing code" }, { status: 400 });

      const secret = (secRow?.totp_secret as string) || "";
      if (!secret) return json({ error: "TOTP not initialized" }, { status: 400 });

      const valid = authenticator.verify({ token: code, secret });
      if (!valid) return json({ error: "Invalid code" }, { status: 400 });

      const newCodes = generateRecoveryCodes();
      const { error } = await supabase
        .from("user_security")
        .update({ totp_enabled: true, recovery_codes: newCodes, has_2fa: true })
        .eq("user_id", user.id);
      if (error) return json({ error: error.message }, { status: 400 });

      return json({ verified: true, recovery_codes: newCodes });
    }

    if (action === "recovery_rotate") {
      if (!secRow?.totp_enabled) return json({ error: "TOTP not enabled" }, { status: 400 });
      const newCodes = generateRecoveryCodes();
      const { error } = await supabase
        .from("user_security")
        .update({ recovery_codes: newCodes })
        .eq("user_id", user.id);
      if (error) return json({ error: error.message }, { status: 400 });
      return json({ recovery_codes: newCodes });
    }

    return json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("auth-2fa error", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
