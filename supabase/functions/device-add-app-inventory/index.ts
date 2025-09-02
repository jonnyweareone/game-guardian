import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { app_id, device_id, name, source = "manual" } = await req.json();

    if (!app_id || !device_id || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: app_id, device_id, name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert the app into device inventory
    const { error: inventoryError } = await supabase
      .from("device_app_inventory")
      .upsert({
        device_id,
        app_id,
        name,
        version: "unknown",
        source,
        installed_by: "manual",
        first_seen: new Date().toISOString(),
        seen_at: new Date().toISOString(),
      }, {
        onConflict: "device_id,app_id"
      });

    if (inventoryError) {
      console.error("Error adding to inventory:", inventoryError);
      return new Response(
        JSON.stringify({ error: "Failed to add app to inventory" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create an approved policy for the app
    const { error: policyError } = await supabase
      .from("device_app_policy")
      .upsert({
        device_id,
        app_id,
        approved: true,
        hidden: false,
        approved_at: new Date().toISOString(),
      }, {
        onConflict: "device_id,app_id"
      });

    if (policyError) {
      console.error("Error creating policy:", policyError);
      // Continue anyway, policy creation is not critical
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in device-add-app-inventory:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});