import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey"
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...CORS, ...(init.headers || {}) }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { action, child_id, child_name, age, school_hours_enabled, content_categories } = await req.json();
    const nextdnsApiKey = Deno.env.get("NEXTDNS_API_KEY");

    if (!nextdnsApiKey) {
      return json({ error: "NextDNS API key not configured" }, { status: 500 });
    }

    console.log(`NextDNS Profile Manager: ${action} for child ${child_id}`);

    switch (action) {
      case "create_profile":
        return await createNextDNSProfile({ 
          child_id, 
          child_name, 
          age, 
          school_hours_enabled, 
          content_categories,
          supabase, 
          nextdnsApiKey 
        });
      
      case "update_profile":
        return await updateNextDNSProfile({ 
          child_id, 
          age, 
          school_hours_enabled, 
          content_categories,
          supabase, 
          nextdnsApiKey 
        });
      
      case "delete_profile":
        return await deleteNextDNSProfile({ child_id, supabase, nextdnsApiKey });
      
      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("NextDNS Profile Manager error:", error);
    return json({ error: error.message || "Internal error" }, { status: 500 });
  }
});

async function createNextDNSProfile({ 
  child_id, 
  child_name, 
  age, 
  school_hours_enabled, 
  content_categories,
  supabase, 
  nextdnsApiKey 
}: any) {
  try {
    // Get parent ID for anonymous naming
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Use parentUUID:childUUID format for anonymous naming
    const profileName = `${user.id}:${child_id}`;
    
    // First, create a minimal profile to get an ID
    const minimalProfile = {
      name: profileName,
      description: "Guardian AI web filter"
    };

    console.log("Creating NextDNS profile with minimal payload:", minimalProfile);

    const nextdnsResponse = await fetch("https://api.nextdns.io/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": nextdnsApiKey
      },
      body: JSON.stringify(minimalProfile)
    });

    if (!nextdnsResponse.ok) {
      const errorText = await nextdnsResponse.text();
      console.error(`NextDNS Profile Creation Error: ${nextdnsResponse.status} - ${errorText}`);
      
      // Return a graceful failure instead of throwing
      return json({
        success: false,
        error: `NextDNS API error: ${nextdnsResponse.status}`,
        details: errorText,
        fallback: true
      }, { status: 200 }); // Return 200 so the activation continues
    }

    const nextdnsProfile = await nextdnsResponse.json();
    const profileId = nextdnsProfile.data?.id || nextdnsProfile.id;

    if (!profileId) {
      console.error("No profile ID returned from NextDNS API:", nextdnsProfile);
      return json({
        success: false,
        error: "NextDNS API did not return profile ID",
        fallback: true
      }, { status: 200 });
    }

    console.log(`Created NextDNS profile ${profileId} for child ${child_id}`);

    // Store in database
    const { error: dbError } = await supabase
      .from("child_dns_profiles")
      .upsert({
        child_id,
        nextdns_config: profileId,
        school_hours_enabled: school_hours_enabled || false
      });

    if (dbError) {
      console.error("Database error storing DNS profile:", dbError);
      // Try to cleanup NextDNS profile
      await cleanupNextDNSProfile(profileId, nextdnsApiKey);
      
      return json({
        success: false,
        error: `Database error: ${dbError.message}`,
        fallback: true
      }, { status: 200 });
    }

    // Now try to apply the full settings to the profile
    try {
      const settings = getAgeAppropriateSettings(age, school_hours_enabled, content_categories);
      
      const updateResponse = await fetch(`https://api.nextdns.io/profiles/${profileId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": nextdnsApiKey
        },
        body: JSON.stringify(settings)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`NextDNS Settings Update Error: ${updateResponse.status} - ${errorText}`);
        // Profile exists but settings update failed - not critical for activation
      } else {
        console.log(`Successfully applied settings to NextDNS profile ${profileId}`);
      }
    } catch (settingsError) {
      console.error("Error applying settings to NextDNS profile:", settingsError);
      // Non-critical error - profile still exists
    }

    return json({ 
      success: true, 
      profile_id: profileId,
      message: "Web filter profile created"
    });
  } catch (error) {
    console.error("Error creating NextDNS profile:", error);
    return json({
      success: false,
      error: error.message,
      fallback: true
    }, { status: 200 }); // Continue activation even if DNS setup fails
  }
}

async function updateNextDNSProfile({ child_id, age, school_hours_enabled, content_categories, supabase, nextdnsApiKey }: any) {
  try {
    // Get existing profile
    const { data: dnsProfile, error: fetchError } = await supabase
      .from("child_dns_profiles")
      .select("nextdns_config")
      .eq("child_id", child_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Database error fetching DNS profile:", fetchError);
      return json({
        success: false,
        error: `Database error: ${fetchError.message}`,
        fallback: true
      }, { status: 200 });
    }

    if (!dnsProfile?.nextdns_config) {
      console.log("No existing DNS profile found, creating new one");
      // No existing profile, create one instead
      return await createNextDNSProfile({
        child_id,
        child_name: null, // Will be ignored in favor of UUID naming
        age,
        school_hours_enabled,
        content_categories,
        supabase,
        nextdnsApiKey
      });
    }

    const profileId = dnsProfile.nextdns_config;
    
    // Update NextDNS profile settings
    const updatedSettings = getAgeAppropriateSettings(age, school_hours_enabled, content_categories);
    
    const nextdnsResponse = await fetch(`https://api.nextdns.io/profiles/${profileId}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": nextdnsApiKey
      },
      body: JSON.stringify(updatedSettings)
    });

    if (!nextdnsResponse.ok) {
      const errorText = await nextdnsResponse.text();
      console.error(`NextDNS update error: ${nextdnsResponse.status} - ${errorText}`);
      
      return json({
        success: false,
        error: `NextDNS API error: ${nextdnsResponse.status}`,
        details: errorText,
        fallback: true
      }, { status: 200 });
    }

    // Update local database
    const { error: dbError } = await supabase
      .from("child_dns_profiles")
      .update({ 
        school_hours_enabled,
        updated_at: new Date().toISOString()
      })
      .eq("child_id", child_id);

    if (dbError) {
      console.error("Database error updating DNS profile:", dbError);
    }

    return json({ 
      success: true, 
      profile_id: profileId,
      message: "DNS profile updated" 
    });
  } catch (error) {
    console.error("Error updating NextDNS profile:", error);
    return json({
      success: false,
      error: error.message,
      fallback: true
    }, { status: 200 });
  }
}

async function deleteNextDNSProfile({ child_id, supabase, nextdnsApiKey }: any) {
  // Get existing profile
  const { data: dnsProfile, error: fetchError } = await supabase
    .from("child_dns_profiles")
    .select("nextdns_config")
    .eq("child_id", child_id)
    .single();

  if (fetchError || !dnsProfile) {
    return json({ success: true, message: "No DNS profile to delete" });
  }

  const profileId = dnsProfile.nextdns_config;
  
  // Delete from NextDNS
  await cleanupNextDNSProfile(profileId, nextdnsApiKey);

  // Delete from database
  const { error: dbError } = await supabase
    .from("child_dns_profiles")
    .delete()
    .eq("child_id", child_id);

  if (dbError) console.error("Failed to delete DNS profile from database:", dbError);

  return json({ success: true, message: "DNS profile deleted" });
}

async function cleanupNextDNSProfile(profileId: string, nextdnsApiKey: string) {
  try {
    await fetch(`https://api.nextdns.io/profiles/${profileId}`, {
      method: "DELETE",
      headers: { "X-Api-Key": nextdnsApiKey }
    });
    console.log(`Cleaned up NextDNS profile ${profileId}`);
  } catch (error) {
    console.error(`Failed to cleanup NextDNS profile ${profileId}:`, error);
  }
}

function getAgeAppropriateSettings(age: number, schoolHoursEnabled: boolean, contentCategories: any = {}) {
  const baseSettings = {
    blockPage: {
      enabled: true,
      displayName: "Guardian AI",
      message: "This content is blocked by your Guardian AI web filters."
    },
    security: {
      threatIntelligenceFeeds: true,
      aiThreatDetection: true,
      googleSafeBrowsing: true,
      cryptojacking: true,
      dnsRebinding: true,
      homographAttacks: true,
      typosquatting: true,
      dga: true,
      nrd: true
    },
    privacy: {
      blockDisguisedTrackers: true,
      allowAffiliate: false
    },
    safeSearch: {
      google: true,
      bing: true,
      youtube: true,
      duckduckgo: true,
      yandex: true
    },
    youtubeRestrictedMode: true, // Force YouTube Restricted Mode
    safeMode: true // Additional safety mode
  };

  // Automatic protections (always enabled)
  const automaticProtections = {
    categories: {
      porn: true,
      gambling: true,
      drugs: true,
      violence: true,
      weapons: true,
      hate: true,
      suicide: true,
      terrorism: true,
      malware: true,
      phishing: true,
      scam: true
    }
  };

  // Configurable content categories
  const configurableSettings = {
    categories: {
      ...automaticProtections.categories,
      social: contentCategories?.social_media || false,
      games: contentCategories?.gaming || false,
      streaming: contentCategories?.entertainment || false,
      dating: age < 16 // Age-based default
    }
  };

  // School hours restrictions (if enabled)
  const scheduleSettings = schoolHoursEnabled ? {
    schedules: [{
      name: "School Hours",
      timezone: "America/New_York",
      mon: { start: "08:00", end: "15:00" },
      tue: { start: "08:00", end: "15:00" },
      wed: { start: "08:00", end: "15:00" },
      thu: { start: "08:00", end: "15:00" },
      fri: { start: "08:00", end: "15:00" },
      categories: {
        social: true,
        games: true,
        streaming: true,
        entertainment: true
      }
    }]
  } : {};

  return { ...baseSettings, ...configurableSettings, ...scheduleSettings };
}
