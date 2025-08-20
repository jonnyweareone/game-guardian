// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(r: Response) {
  const h = new Headers(r.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Headers", "authorization, content-type, apikey");
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  return new Response(r.body, { ...r, headers: h });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return cors(new Response("ok"));
  const url = new URL(req.url);
  const path = url.pathname.split("/").slice(2).join("/");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // helper
  async function uid() {
    return (await supabase.auth.getUser()).data.user?.id!;
  }

  try {
    // BOOKS
    if (path === "books" && req.method === "GET") {
      const { searchParams } = url;
      const ks = searchParams.get("ks");
      let q = supabase.from("books").select("*").order("created_at",{ascending:false});
      if (ks) q = q.eq("ks", ks);
      const { data, error } = await q;
      if (error) throw error;
      return cors(new Response(JSON.stringify({ ok:true, items:data }), { headers: { "Content-Type":"application/json" }}));
    }

    // READING start
    if (path === "reading/start" && req.method === "POST") {
      const body = await req.json(); // { child_id, book_id?, pages_target? }
      const row = {
        child_id: body.child_id,
        book_id: body.book_id ?? null,
        pages_target: body.pages_target ?? null,
      };
      const { data, error } = await supabase.from("reading_sessions").insert(row).select("*").single();
      if (error) throw error;
      return cors(new Response(JSON.stringify({ ok:true, session:data }), { headers: { "Content-Type":"application/json" }}));
    }

    // READING stop + award
    if (path === "reading/stop" && req.method === "POST") {
      const body = await req.json();
      // body: { session_id, pages_completed, transcript_ms, ai_difficulty, ai_summary, ai_flags }
      const coins = Math.max(5, Math.round((body.pages_completed ?? 0) * 2)); // simple rule
      const { data: sess, error: uerr } = await supabase.from("reading_sessions")
        .update({
          ended_at: new Date().toISOString(),
          pages_completed: body.pages_completed ?? 0,
          transcript_ms: body.transcript_ms ?? null,
          ai_difficulty: body.ai_difficulty ?? null,
          ai_summary: body.ai_summary ?? null,
          ai_flags: body.ai_flags ?? {},
          coins_earned: coins
        }).eq("id", body.session_id).select("id, child_id, book_id").single();
      if (uerr) throw uerr;

      // wallet
      await supabase.rpc("ensure_wallet", { p_child: sess.child_id });
      const { data: wallet } = await supabase.from("wallets").select("coins").eq("child_id", sess.child_id).maybeSingle();
      const currentCoins = wallet?.coins ?? 0;
      await supabase.from("wallets").update({ 
        coins: currentCoins + coins, 
        updated_at: new Date().toISOString() 
      }).eq("child_id", sess.child_id);

      // timeline
      const parentRow = await supabase.from("children").select("parent_id").eq("id", sess.child_id).single();
      await supabase.from("parent_timeline").insert({
        parent_user_id: parentRow.data?.parent_id,
        child_id: sess.child_id,
        kind: "reading",
        title: "Reading session completed",
        detail: { session_id: body.session_id, pages_completed: body.pages_completed, coins }
      });

      return cors(new Response(JSON.stringify({ ok:true, coins_awarded: coins }), { headers: { "Content-Type":"application/json" }}));
    }

    // LEARNING record
    if (path === "learning/record" && req.method === "POST") {
      const body = await req.json(); // { child_id, subject, topic, ks, source, duration_minutes, score, passed, evidence_url, meta }
      const coins = Math.max(5, Math.round((body.duration_minutes ?? 0) / 5) * 5);
      const { data: act, error } = await supabase.from("learning_activities").insert({
        child_id: body.child_id,
        subject: body.subject,
        topic: body.topic ?? null,
        ks: body.ks ?? null,
        source: body.source ?? "web-app",
        duration_minutes: body.duration_minutes ?? 0,
        score: body.score ?? null,
        passed: body.passed ?? null,
        evidence_url: body.evidence_url ?? null,
        coins_earned: coins,
        meta: body.meta ?? {}
      }).select("id, child_id").single();
      if (error) throw error;

      await supabase.rpc("ensure_wallet", { p_child: act.child_id });
      const { data: wallet } = await supabase.from("wallets").select("coins").eq("child_id", act.child_id).maybeSingle();
      const currentCoins = wallet?.coins ?? 0;
      await supabase.from("wallets").update({ 
        coins: currentCoins + coins, 
        updated_at: new Date().toISOString() 
      }).eq("child_id", act.child_id);

      const parentRow = await supabase.from("children").select("parent_id").eq("id", act.child_id).single();
      await supabase.from("parent_timeline").insert({
        parent_user_id: parentRow.data?.parent_id,
        child_id: act.child_id,
        kind: "learning",
        title: "Learning activity recorded",
        detail: { subject: body.subject, topic: body.topic, coins }
      });

      return cors(new Response(JSON.stringify({ ok:true, coins_awarded: coins }), { headers: { "Content-Type":"application/json" }}));
    }

    // TIMELINE
    if (path === "timeline" && req.method === "GET") {
      const my = await uid();
      const { data, error } = await supabase.from("parent_timeline").select("*").eq("parent_user_id", my).order("created_at",{ascending:false}).limit(100);
      if (error) throw error;
      return cors(new Response(JSON.stringify({ ok:true, items:data }), { headers: { "Content-Type":"application/json" }}));
    }

    return cors(new Response("Not found", { status: 404 }));
  } catch (e: any) {
    return cors(new Response(JSON.stringify({ ok:false, error: e.message ?? String(e) }), { status: 400, headers: { "Content-Type":"application/json" }}));
  }
});