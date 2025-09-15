import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";

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
  
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecret || !whSecret) {
      console.error("Stripe credentials not configured");
      return json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return json({ error: "Missing stripe signature" }, { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, whSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const tier = session.metadata?.tier === "family_plus" ? "family_plus" : "family";
      const parentId = session.metadata?.parent_id;

      if (parentId) {
        const features = tier === "family_plus" 
          ? { l7_controls: true, vpn_detection: true, kill_switch: true }
          : { dns_filtering: true };

        // Upsert entitlement
        const { error } = await supabase
          .from("entitlements")
          .upsert({
            parent_id: parentId,
            tier,
            features
          }, {
            onConflict: "parent_id"
          });

        if (error) {
          console.error("Error updating entitlements:", error);
          return json({ error: "Failed to update entitlements" }, { status: 500 });
        }

        console.log(`Entitlement updated for parent ${parentId}: ${tier}`);
      } else {
        console.warn("No parent_id in session metadata");
      }
    }

    return json({ received: true });

  } catch (e) {
    console.error("Stripe webhook error:", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});