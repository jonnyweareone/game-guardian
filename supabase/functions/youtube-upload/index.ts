import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase env not configured in Edge Function");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { clip_id } = await req.json().catch(() => ({ clip_id: null }));
    if (!clip_id) {
      return new Response(JSON.stringify({ error: "clip_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current user
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser?.user) {
      console.error("auth.getUser error", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = authUser.user.id;

    // Fetch clip, enforce ownership via RLS
    const { data: clip, error: clipErr } = await supabase
      .from("clips")
      .select("*")
      .eq("id", clip_id)
      .maybeSingle();

    if (clipErr) {
      console.error("Error fetching clip", clipErr);
      return new Response(JSON.stringify({ error: "Failed to load clip" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!clip) {
      return new Response(JSON.stringify({ error: "Clip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (clip.parent_id !== userId) {
      return new Response(JSON.stringify({ error: "Not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (["declined", "uploaded"].includes(clip.status)) {
      return new Response(
        JSON.stringify({ error: `Clip is ${clip.status}; cannot upload` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as uploading
    const { error: upErr1 } = await supabase
      .from("clips")
      .update({ status: "uploading" })
      .eq("id", clip_id);
    if (upErr1) {
      console.error("Failed to mark uploading", upErr1);
    }

    // Load YouTube OAuth credentials from Supabase Secrets
    const YT_CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID");
    const YT_CLIENT_SECRET = Deno.env.get("YOUTUBE_CLIENT_SECRET");
    const YT_REFRESH_TOKEN = Deno.env.get("YOUTUBE_REFRESH_TOKEN");

    if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) {
      // Not configured yet — fail gracefully and keep the clip intact
      await supabase
        .from("clips")
        .update({ status: "failed" })
        .eq("id", clip_id);

      return new Response(
        JSON.stringify({
          error: "YouTube integration not configured",
          hint: "Add YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN",
        }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Exchange refresh token for access token and upload to YouTube
    // This is a stubbed implementation to prove the secure flow end-to-end
    const stubId = `stub-${String(clip_id).slice(0, 8)}`;
    const stubUrl = `https://youtube.com/watch?v=${stubId}`;

    const { error: upErr2 } = await supabase
      .from("clips")
      .update({ status: "uploaded", youtube_video_id: stubId, youtube_url: stubUrl })
      .eq("id", clip_id);

    if (upErr2) {
      console.error("Failed to mark uploaded", upErr2);
      return new Response(JSON.stringify({ error: "Upload state update failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ youtube_video_id: stubId, youtube_url: stubUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("youtube-upload error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
