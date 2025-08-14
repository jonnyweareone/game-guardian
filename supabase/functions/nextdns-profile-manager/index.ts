
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

    const { action, child_id, child_name, age, school_hours_enabled } = await req.json();
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
          supabase, 
          nextdnsApiKey 
        });
      
      case "update_profile":
        return await updateNextDNSProfile({ 
          child_id, 
          age, 
          school_hours_enabled, 
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
  supabase, 
  nextdnsApiKey 
}: any) {
  // Create NextDNS profile
  const profileData = {
    name: `Guardian AI - ${child_name}`,
    description: `Age-appropriate filtering for ${child_name} (Age ${age})`,
    settings: getAgeAppropriateSettings(age, school_hours_enabled)
  };

  const nextdnsResponse = await fetch("https://api.nextdns.io/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": nextdnsApiKey
    },
    body: JSON.stringify(profileData)
  });

  if (!nextdnsResponse.ok) {
    const error = await nextdnsResponse.text();
    console.error("NextDNS API error:", error);
    throw new Error(`Failed to create NextDNS profile: ${error}`);
  }

  const nextdnsProfile = await nextdnsResponse.json();
  const profileId = nextdnsProfile.data.id;

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
    console.error("Database error:", dbError);
    // Try to cleanup NextDNS profile
    await cleanupNextDNSProfile(profileId, nextdnsApiKey);
    throw new Error(`Failed to save DNS profile: ${dbError.message}`);
  }

  return json({ 
    success: true, 
    profile_id: profileId,
    message: `NextDNS profile created for ${child_name}`
  });
}

async function updateNextDNSProfile({ child_id, age, school_hours_enabled, supabase, nextdnsApiKey }: any) {
  // Get existing profile
  const { data: dnsProfile, error: fetchError } = await supabase
    .from("child_dns_profiles")
    .select("nextdns_config")
    .eq("child_id", child_id)
    .single();

  if (fetchError || !dnsProfile) {
    return json({ error: "DNS profile not found" }, { status: 404 });
  }

  const profileId = dnsProfile.nextdns_config;
  
  // Update NextDNS profile settings
  const updatedSettings = getAgeAppropriateSettings(age, school_hours_enabled);
  
  const nextdnsResponse = await fetch(`https://api.nextdns.io/profiles/${profileId}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": nextdnsApiKey
    },
    body: JSON.stringify(updatedSettings)
  });

  if (!nextdnsResponse.ok) {
    const error = await nextdnsResponse.text();
    console.error("NextDNS update error:", error);
    throw new Error(`Failed to update NextDNS profile: ${error}`);
  }

  // Update local database
  const { error: dbError } = await supabase
    .from("child_dns_profiles")
    .update({ school_hours_enabled })
    .eq("child_id", child_id);

  if (dbError) throw new Error(`Failed to update DNS profile: ${dbError.message}`);

  return json({ success: true, message: "DNS profile updated" });
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

function getAgeAppropriateSettings(age: number, schoolHoursEnabled: boolean) {
  const baseSettings = {
    blockPage: {
      enabled: true,
      displayName: "Guardian AI",
      message: "This content is blocked by your Guardian AI parental controls."
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
    }
  };

  // Age-appropriate content filtering
  const contentSettings = {
    categories: {
      porn: true,
      gambling: true,
      dating: age < 16,
      piracy: true,
      drugs: true,
      violence: age < 13,
      weapons: age < 13,
      hate: true,
      suicide: true,
      malware: true,
      phishing: true,
      scam: true
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

  return { ...baseSettings, ...contentSettings, ...scheduleSettings };
}
