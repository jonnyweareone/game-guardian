// Supabase Edge Function: identity-verify
// Handles starting identity verification flows (ID + likeness) with a provider
// Currently a scaffold that requires provider secrets (e.g., Yoti) to be set

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseClient(req);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    // Check for provider secrets (Yoti as example)
    const yotiSdkId = Deno.env.get("YOTI_SDK_ID");
    const yotiPrivateKey = Deno.env.get("YOTI_PRIVATE_KEY_PEM");
    const yotiEnv = Deno.env.get("YOTI_ENV");

    if (action === "start") {
      // If provider not configured, return helpful message
      if (!yotiSdkId || !yotiPrivateKey || !yotiEnv) {
        return new Response(
          JSON.stringify({
            ok: false,
            message:
              "Identity provider not configured. Please add YOTI_SDK_ID, YOTI_PRIVATE_KEY_PEM, and YOTI_ENV as Edge Function secrets.",
            next_steps: "Set secrets then re-run. We'll generate a session for ID + likeness checks.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Placeholder: Here we would create a Yoti session and return the client token/URL
      console.log("[identity-verify] Start requested by", user.id);
      return new Response(
        JSON.stringify({ ok: true, message: "Identity flow ready (stub). Configure provider to enable." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reset_flags") {
      // Reset local verification flags (used when address changes)
      const { error } = await supabase
        .from("identity_verifications")
        .update({
          status: "pending",
          id_check_completed: false,
          likeness_check_completed: false,
          verified_at: null,
        })
        .eq("user_id", user.id);

      if (error) {
        return new Response(
          JSON.stringify({ ok: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unsupported action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[identity-verify] Error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", detail: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
