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
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return json({ error: "Email and password required" }, { status: 400 });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await serviceClient.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error || !data?.session) {
      return json({ error: error?.message || "Unauthorized" }, { status: 401 });
    }

    return json({
      parent_access_token: data.session.access_token,
      expires_in: data.session.expires_in
    });

  } catch (e) {
    console.error("auth-login error:", e);
    return json({ error: String(e) }, { status: 500 });
  }
});