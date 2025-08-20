import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { edu } from "@/lib/educationApi";
import EducationTab from "@/components/dashboard-v2/EducationTab";

type TLItem = {
  id: string;
  created_at: string;
  kind: "reading" | "learning" | "reward" | "store" | "system";
  title: string;
  detail: any;
  child_id?: string;
};

function useTimeline(childId: string) {
  const [rows, setRows] = React.useState<TLItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("parent_timeline")
          .select("*")
          .eq("child_id", childId)
          .order("created_at", { ascending: false })
          .limit(100);
        if (ok) setRows(data ?? []);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [childId]);
  
  return { rows, loading };
}

function useReading(childId: string) {
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => {
    let ok = true;
    (async () => {
      const { data } = await supabase
        .from("reading_sessions")
        .select("id,started_at,ended_at,pages_completed,coins_earned,ai_summary,ai_difficulty,book_id,books(title,author)")
        .eq("child_id", childId)
        .order("started_at", { ascending: false })
        .limit(50);
      if (ok) setRows(data ?? []);
    })();
    return () => { ok = false; };
  }, [childId]);
  return rows;
}

function useActivities(childId: string) {
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => {
    let ok = true;
    (async () => {
      const { data } = await supabase
        .from("learning_activities")
        .select("id,created_at,subject,topic,ks,duration_minutes,score,passed,coins_earned,source,meta")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (ok) setRows(data ?? []);
    })();
    return () => { ok = false; };
  }, [childId]);
  return rows;
}

function useEducationTimeline(childId: string) {
  const [timeline, setTimeline] = React.useState<any>(null);
  React.useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const data = await edu.timeline(childId);
        if (ok) setTimeline(data);
      } catch (error) {
        console.error('Error fetching education timeline:', error);
      }
    })();
    return () => { ok = false; };
  }, [childId]);
  return timeline;
}

// quick roll-up for "Books & Courses"
function aggregateBooks(reading: any[]) {
  const m = new Map<string, { title: string; author?: string; sessions: number; pages: number }>();
  for (const r of reading) {
    const key = r.book_id ?? r.id;
    const title = r.books?.title ?? "Untitled";
    const author = r.books?.author ?? "";
    const prev = m.get(key) ?? { title, author, sessions: 0, pages: 0 };
    prev.sessions += 1;
    prev.pages += r.pages_completed ?? 0;
    m.set(key, prev);
  }
  return Array.from(m.values());
}

// simple "AI Summary" without external API
function buildSummary(reading: any[], acts: any[]) {
  const pages = reading.reduce((s, r) => s + (r.pages_completed ?? 0), 0);
  const mins  = acts.reduce((s, a) => s + (a.duration_minutes ?? 0), 0);
  const diffs = reading
    .map(r => r.ai_difficulty)
    .filter(Boolean) as string[];
  const commonDiff =
    diffs.length ? [...new Set(diffs)]
      .map(d => ({ d, c: diffs.filter(x => x === d).length }))
      .sort((a,b)=>b.c-a.c)[0].d : null;

  const lastRead = reading[0]?.ai_summary;
  const lastAct  = acts[0]?.topic || acts[0]?.subject;

  return {
    pagesTotal: pages,
    minutesTotal: mins,
    typicalDifficulty: commonDiff,
    lastReadingNote: lastRead,
    lastActivity: lastAct,
  };
}

export default function ChildEducationTabs({ childId }: { childId: string }) {
  const { rows: timeline, loading: timelineLoading } = useTimeline(childId);
  const reading = useReading(childId);
  const activities = useActivities(childId);
  const educationTimeline = useEducationTimeline(childId);

  const books = aggregateBooks(reading);
  const summary = buildSummary(reading, activities);

  // Persist last selected tab per child in localStorage
  const [activeTab, setActiveTab] = React.useState(() => {
    const saved = localStorage.getItem(`edu-tab-${childId}`);
    return saved || 'profile'; // Default to profile tab
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(`edu-tab-${childId}`, value);
  };

  return (
    <div className="rounded-xl bg-card border p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Education</div>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="books">Books & Courses</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <EducationTab childId={childId} />
        </TabsContent>

        <TabsContent value="timeline">
          {timelineLoading ? (
            <div className="text-sm text-muted-foreground">Loading timeline…</div>
          ) : timeline.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <div className="space-y-2 text-sm">
              {timeline.map(t => (
                <div key={t.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="font-medium">{t.title}</div>
                  {t.detail && <div className="text-muted-foreground">{summarise(t)}</div>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(t.created_at).toLocaleString()} • {t.kind}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reading">
          {reading.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reading sessions logged.</div>
          ) : (
            <div className="space-y-2 text-sm">
              {reading.map((r:any) => (
                <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-3">
                  <div>
                    <div className="font-medium">
                      {r.books?.title ?? "Book"}{r.books?.author ? ` — ${r.books.author}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.started_at).toLocaleString()}
                      {r.pages_completed ? ` · ${r.pages_completed} pages` : ""}
                      {r.ai_difficulty ? ` · ${r.ai_difficulty}` : ""}
                      {r.ai_summary ? ` · ${r.ai_summary}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-amber-600 font-semibold">+{r.coins_earned ?? 0}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="books">
          {books.length === 0 ? (
            <div className="text-sm text-muted-foreground">No books/courses yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {books.map((b, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.title}</div>
                    {b.author && <div className="text-xs text-muted-foreground">{b.author}</div>}
                  </div>
                  <div className="text-xs text-muted-foreground">{b.sessions} session{b.sessions>1?"s":""} · {b.pages} pages</div>
                </div>
              ))}
            </div>
          )}
          {/* Nova "courses/activities" roll‑up */}
          {activities.length > 0 && (
            <div className="mt-3 space-y-2 text-sm">
              {activities.map((a:any) => (
                <div key={a.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="font-medium">{a.subject}{a.topic ? ` — ${a.topic}` : ""}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                    {a.duration_minutes ? ` · ${a.duration_minutes} min` : ""}
                    {typeof a.score === "number" ? ` · ${Math.round(a.score)}%` : ""}
                    {typeof a.passed === "boolean" ? ` · ${a.passed ? "Passed" : "Try again"}` : ""}
                    {a.ks ? ` · ${a.ks}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="font-medium mb-1">At‑a‑glance</div>
              <div className="text-sm text-muted-foreground">
                • Pages read: <b className="text-foreground">{summary.pagesTotal}</b><br/>
                • Learning time: <b className="text-foreground">{summary.minutesTotal}</b> min<br/>
                • Typical difficulty: <b className="text-foreground">{summary.typicalDifficulty ?? "—"}</b>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="font-medium mb-1">Recent highlights</div>
              <div className="text-sm text-muted-foreground">
                {summary.lastReadingNote ? <>• Reading: {summary.lastReadingNote}<br/></> : null}
                {summary.lastActivity ? <>• Activity: {summary.lastActivity}</> : <>No recent activities.</>}
              </div>
            </div>
          </div>
          
          {/* Include the existing Learning Timeline from EducationTab */}
          {educationTimeline && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <div className="font-medium mb-2">Learning Timeline Overview</div>
              <div className="text-sm grid md:grid-cols-3 gap-3">
                <div>
                  <div className="font-medium mb-1">Achievements</div>
                  <ul className="space-y-1 max-h-40 overflow-auto text-muted-foreground">
                    {(educationTimeline.achievements ?? []).map((a:any)=>(
                      <li key={a.id}>• {a.kind} — {new Date(a.created_at).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">Study Sessions</div>
                  <ul className="space-y-1 max-h-40 overflow-auto text-muted-foreground">
                    {(educationTimeline.study ?? []).map((s:any)=>(
                      <li key={s.id}>• {s.source} {s.subject?`(${s.subject})`:''} — {s.minutes}m</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">Reading</div>
                  <ul className="space-y-1 max-h-40 overflow-auto text-muted-foreground">
                    {(educationTimeline.reading ?? []).map((r:any)=>(
                      <li key={r.id}>• session {r.id.slice(0,8)}… — pages {r.pages_completed}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function summarise(t: TLItem) {
  try {
    const d = t.detail || {};
    if (t.kind === "reading") {
      return [d.book_title, d.pages && `${d.pages} pages`, d.difficulty && `Level: ${d.difficulty}`]
        .filter(Boolean).join(" · ");
    }
    if (t.kind === "learning") {
      return [d.subject, d.topic, d.duration && `${d.duration} min`].filter(Boolean).join(" · ");
    }
    if (t.kind === "reward") {
      return [d.name && `Reward: ${d.name}`, d.delta && `Coins: ${d.delta}`].filter(Boolean).join(" · ");
    }
    return JSON.stringify(d);
  } catch {
    return "";
  }
}