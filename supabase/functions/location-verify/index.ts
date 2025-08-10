// Supabase Edge Function: location-verify
// Validates whether a device's last known IP geolocation matches the user's verified address

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

function toRadians(deg: number) { return (deg * Math.PI) / 180; }
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
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
    const device_id = body?.device_id as string | undefined;
    const threshold_meters = Math.max(0, Number(body?.threshold_meters) || 1000);

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: "device_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get latest verified address for user
    const { data: iv, error: ivErr } = await supabase
      .from("identity_verifications")
      .select("verified_address_line1, verified_address_line2, verified_city, verified_state, verified_postal_code, verified_country")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ivErr) throw ivErr;
    const addressParts = [
      iv?.verified_address_line1,
      iv?.verified_address_line2,
      iv?.verified_city,
      iv?.verified_state,
      iv?.verified_postal_code,
      iv?.verified_country,
    ].filter(Boolean);

    if (!addressParts.length) {
      return new Response(
        JSON.stringify({ error: "No verified address found. Please add and verify your address first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullAddress = addressParts.join(", ");

    // Get last heartbeat for device
    const { data: hb, error: hbErr } = await supabase
      .from("device_heartbeats")
      .select("id, ip_address, created_at")
      .eq("device_id", device_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (hbErr) throw hbErr;
    if (!hb?.ip_address) {
      return new Response(
        JSON.stringify({ error: "No recent heartbeat with IP address found for device" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Geocode address (Mapbox)
    const mapboxToken = Deno.env.get("MAPBOX_ACCESS_TOKEN");
    if (!mapboxToken) {
      return new Response(
        JSON.stringify({ error: "MAPBOX_ACCESS_TOKEN not set. Add it to Edge Function secrets to enable geocoding." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?limit=1&access_token=${mapboxToken}`;
    const geoRes = await fetch(geocodeUrl);
    if (!geoRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to geocode address" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geoJson: any = await geoRes.json();
    const feature = geoJson?.features?.[0];
    if (!feature?.center) {
      return new Response(
        JSON.stringify({ error: "Address not found by geocoder" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const [addrLng, addrLat] = feature.center as [number, number];

    // IP geolocation (using ip-api.com, no key required)
    const ip = hb.ip_address;
    const ipRes = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,lat,lon`);
    const ipJson: any = await ipRes.json();
    if (ipJson?.status !== "success") {
      return new Response(
        JSON.stringify({ error: `IP geolocation failed: ${ipJson?.message || "unknown"}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ipLat = Number(ipJson.lat);
    const ipLng = Number(ipJson.lon);
    const distance = haversineMeters(addrLat, addrLng, ipLat, ipLng);
    const matched = distance <= threshold_meters;

    // Log result
    await supabase.from("location_match_results").insert({
      user_id: user.id,
      device_id,
      matched,
      distance_meters: distance,
      details: {
        ip,
        address: fullAddress,
        address_coords: { lat: addrLat, lng: addrLng },
        ip_coords: { lat: ipLat, lng: ipLng },
      },
    });

    return new Response(
      JSON.stringify({ ok: true, matched, distance_meters: distance, threshold_meters }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[location-verify] Error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", detail: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
