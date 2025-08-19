
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;

function withCors(res: Response) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "authorization, apikey, content-type");
  return new Response(res.body, { status: res.status, headers: h });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return withCors(new Response("ok"));

  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    // GET /next-challenges?child_id=...
    if (url.pathname.endsWith("/next-challenges") && req.method === "GET") {
      const child_id = url.searchParams.get("child_id");
      if (!child_id) return withCors(new Response(JSON.stringify({ error: "child_id required" }), { status: 400 }));
      const { data, error } = await supabase.rpc("get_candidate_templates", { p_child: child_id, p_limit: 8 });
      if (error) return withCors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
      return withCors(new Response(JSON.stringify({ templates: data ?? [] }), { status: 200 }));
    }

    // POST /assign
    if (url.pathname.endsWith("/assign") && req.method === "POST") {
      const body = await req.json() as {
        child_id: string, template_id: string, jurisdiction: string, locality?: string,
        year_band?: string, seed_json?: Json
      };
      if (!body?.child_id || !body?.template_id || !body?.jurisdiction)
        return withCors(new Response(JSON.stringify({ error: "child_id, template_id, jurisdiction required" }), { status: 400 }));

      const { data, error } = await supabase.rpc("assign_challenge", {
        p_child: body.child_id,
        p_template: body.template_id,
        p_jurisdiction: body.jurisdiction,
        p_locality: body.locality ?? null,
        p_year_band: body.year_band ?? "Y3-Y4",
        p_seed: body.seed_json ?? {}
      });
      if (error) return withCors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
      return withCors(new Response(JSON.stringify({ rendered_id: data }), { status: 200 }));
    }

    // POST /complete
    if (url.pathname.endsWith("/complete") && req.method === "POST") {
      const body = await req.json() as { rendered_id: string };
      if (!body?.rendered_id) return withCors(new Response(JSON.stringify({ error: "rendered_id required" }), { status: 400 }));
      const { data, error } = await supabase.rpc("award_challenge_completion", { p_rendered_id: body.rendered_id });
      if (error) return withCors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
      return withCors(new Response(JSON.stringify({ awarded: data }), { status: 200 }));
    }

    // POST /match-school (stub)
    if (url.pathname.endsWith("/match-school") && req.method === "POST") {
      const { data, error } = await supabase.from("schools").select("*").limit(1);
      if (error) return withCors(new Response(JSON.stringify({ error: error.message }), { status: 400 }));
      return withCors(new Response(JSON.stringify({ school: data?.[0] ?? null }), { status: 200 }));
    }

    return withCors(new Response("Not found", { status: 404 }));
  } catch (e) {
    return withCors(new Response(JSON.stringify({ error: String(e) }), { status: 500 }));
  }
});
