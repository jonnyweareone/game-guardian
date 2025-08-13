import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { mintDeviceJWT } from "../_shared/jwt.ts";

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", "Access-Control-Allow-Origin":"*" }
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
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }});
  
  try {
    const { device_code, refresh_secret } = await req.json();
    if (!device_code || !refresh_secret) return json({ error: "bad_request" }, { status: 400 });

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(url, key, { auth: { persistSession: false }});

    const { data: dev, error } = await svc.from("devices")
      .select("id, refresh_secret_hash")
      .eq("device_code", device_code)
      .single();
    if (error || !dev) return json({ error: "not_found" }, { status: 404 });

    const hash = await sha256b64url(refresh_secret);
    if (!dev.refresh_secret_hash || hash !== dev.refresh_secret_hash) {
      return json({ error: "unauthorized" }, { status: 401 });
    }

    const jwt = await mintDeviceJWT(device_code, 15);
    await svc.from("devices")
      .update({ 
        last_token_issued_at: new Date().toISOString(), 
        last_refresh_ip: (req.headers.get("x-forwarded-for") || "").split(",")[0] 
      })
      .eq("id", dev.id);

    return json({ ok: true, device_jwt: jwt });
  } catch (e) {
    return json({ error: String(e?.message || e) }, { status: 500 });
  }
});