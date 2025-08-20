import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Challenge = {
  id: string;
  title: string;
  subject: "Maths"|"English"|"Computing"|"Art"|"Science"|"Geography"|"Reading";
  description: string;
  points: number;
  done: boolean;
  ctaHref: string;
};

export default function DailyChallengesBanner() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('nova-challenges-today');
        if (error) throw error;
        setItems(data?.challenges || []);
      } catch (error) {
        console.error('Error loading daily challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  if (loading) return null;
  if (!items.length) return null;

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">🌟 Daily Challenges</h3>
          <p className="text-sm text-muted-foreground">Complete today's goals to earn stars & badges.</p>
        </div>
        <a 
          href="/rewards" 
          className="rounded-xl px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
        >
          View Rewards
        </a>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {items.map((c) => (
          <a
            key={c.id}
            href={c.ctaHref}
            className={cn(
              "min-w-[260px] rounded-xl p-3 border bg-card hover:bg-card/80 transition-all",
              c.done ? "opacity-60 ring-1 ring-success/50" : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="text-sm font-medium text-foreground">{iconFor(c.subject)} {c.title}</div>
              <div className="text-xs text-muted-foreground">{c.points} XP</div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
            <div className="mt-3 h-2 w-full rounded bg-muted">
              <div 
                className={cn(
                  "h-2 rounded transition-all duration-300", 
                  c.done ? "w-full bg-success" : "w-1/5 bg-primary"
                )} 
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function iconFor(subj: Challenge["subject"]) {
  const icons: Record<string, string> = {
    Maths: "➕", 
    English: "📚", 
    Computing: "💻", 
    Art: "🎨", 
    Science: "🔬", 
    Geography: "🗺️", 
    Reading: "📖"
  };
  return icons[subj] ?? "⭐";
}