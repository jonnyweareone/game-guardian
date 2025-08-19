
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(res: Response) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "authorization, apikey, content-type");
  return new Response(res.body, { status: res.status, headers: h });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return cors(new Response("ok"));
  
  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    console.log(`Guardian Education: ${req.method} ${url.pathname}`);

    // GET /schools?age=7&q=Bel
    if (url.pathname.endsWith("/schools") && req.method === "GET") {
      const age = Number(url.searchParams.get("age") ?? "0");
      const q = (url.searchParams.get("q") ?? "").toLowerCase();
      let query = supabase.from("schools").select("*").limit(50);
      
      if (age) {
        query = query.gte("age_max", age).lte("age_min", age);
      }
      if (q) {
        query = query.or(`name.ilike.%${q}%,la_name.ilike.%${q}%,postcode.ilike.%${q}%`);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("Schools query error:", error);
        return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
      }
      return cors(new Response(JSON.stringify({ schools: data ?? [] }), { status: 200 }));
    }

    // GET/POST /profile?child_id=...
    if (url.pathname.endsWith("/profile")) {
      const child_id = url.searchParams.get("child_id");
      if (!child_id) return cors(new Response(JSON.stringify({ error: "child_id required" }), { status: 400 }));
      
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("education_profiles")
          .select("*")
          .eq("child_id", child_id)
          .single();
        
        if (error && error.code !== "PGRST116") {
          console.error("Profile get error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ profile: data ?? null }), { status: 200 }));
      } 
      
      if (req.method === "POST") {
        const body = await req.json();
        const updateData = { ...body, child_id, updated_at: new Date().toISOString() };
        
        const { data, error } = await supabase
          .from("education_profiles")
          .upsert(updateData, { onConflict: "child_id" })
          .select("*")
          .single();
        
        if (error) {
          console.error("Profile save error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ profile: data }), { status: 200 }));
      }
    }

    // GET/POST /interests?child_id=...
    if (url.pathname.endsWith("/interests")) {
      const child_id = url.searchParams.get("child_id");
      if (!child_id) return cors(new Response(JSON.stringify({ error: "child_id required" }), { status: 400 }));
      
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("child_interests")
          .select("*, interests(*)")
          .eq("child_id", child_id);
        
        if (error) {
          console.error("Get interests error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ interests: data ?? [] }), { status: 200 }));
      } 
      
      if (req.method === "POST") {
        const body = await req.json() as { interest_ids: string[] };
        const ids = body?.interest_ids ?? [];
        
        // Clear existing interests and insert new ones
        await supabase.from("child_interests").delete().eq("child_id", child_id);
        
        if (ids.length > 0) {
          const insertData = ids.map(id => ({ child_id, interest_id: id }));
          await supabase.from("child_interests").insert(insertData);
        }
        
        return cors(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }
    }

    // GET/POST /planner?child_id=...
    if (url.pathname.endsWith("/planner")) {
      const child_id = url.searchParams.get("child_id");
      if (!child_id) return cors(new Response(JSON.stringify({ error: "child_id required" }), { status: 400 }));
      
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("curriculum_overrides")
          .select("*")
          .eq("child_id", child_id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Get planner error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ overrides: data ?? [] }), { status: 200 }));
      } 
      
      if (req.method === "POST") {
        const body = await req.json() as { 
          term_code: string; 
          topic_id?: string; 
          subject?: string; 
          action: string; 
          note?: string; 
        };
        
        const { data, error } = await supabase
          .from("curriculum_overrides")
          .insert({ child_id, ...body })
          .select("*")
          .single();
        
        if (error) {
          console.error("Add planner override error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ override: data }), { status: 200 }));
      }
    }

    // GET /timeline?child_id=...
    if (url.pathname.endsWith("/timeline") && req.method === "GET") {
      const child_id = url.searchParams.get("child_id");
      if (!child_id) return cors(new Response(JSON.stringify({ error: "child_id required" }), { status: 400 }));
      
      // Get achievements, study sessions, and reading sessions in parallel
      const [achResult, studyResult, readingResult] = await Promise.allSettled([
        supabase.from("achievements").select("*").eq("child_id", child_id).order("created_at", { ascending: false }).limit(100),
        supabase.from("study_sessions").select("*").eq("child_id", child_id).order("started_at", { ascending: false }).limit(100),
        supabase.from("reading_sessions").select("*").eq("child_id", child_id).order("started_at", { ascending: false }).limit(100),
      ]);

      return cors(new Response(JSON.stringify({
        achievements: achResult.status === 'fulfilled' ? achResult.value.data ?? [] : [],
        study: studyResult.status === 'fulfilled' ? studyResult.value.data ?? [] : [],
        reading: readingResult.status === 'fulfilled' ? readingResult.value.data ?? [] : []
      }), { status: 200 }));
    }

    // GET/POST /homework?child_id=...
    if (url.pathname.endsWith("/homework")) {
      const child_id = url.searchParams.get("child_id");
      if (!child_id) return cors(new Response(JSON.stringify({ error: "child_id required" }), { status: 400 }));
      
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("child_homework_links")
          .select("*")
          .eq("child_id", child_id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Get homework error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ docs: data ?? [] }), { status: 200 }));
      } 
      
      if (req.method === "POST") {
        const body = await req.json() as { 
          provider: string; 
          title: string; 
          file_url?: string; 
          file_id?: string; 
        };
        
        const { data, error } = await supabase
          .from("child_homework_links")
          .insert({ child_id, ...body })
          .select("*")
          .single();
        
        if (error) {
          console.error("Add homework error:", error);
          return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
        }
        return cors(new Response(JSON.stringify({ doc: data }), { status: 200 }));
      }
    }

    // GET /interests-catalog
    if (url.pathname.endsWith("/interests-catalog") && req.method === "GET") {
      const { data, error } = await supabase
        .from("interests")
        .select("*")
        .order("category")
        .order("name");
      
      if (error) {
        console.error("Get interests catalog error:", error);
        return cors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
      }
      return cors(new Response(JSON.stringify({ interests: data ?? [] }), { status: 200 }));
    }

    return cors(new Response("Not found", { status: 404 }));
  } catch (e) {
    console.error("Guardian Education error:", e);
    return cors(new Response(JSON.stringify({ error: String(e) }), { status: 500 }));
  }
});
