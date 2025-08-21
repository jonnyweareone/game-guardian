import { supabase } from '@/integrations/supabase/client';

export type NovaSessionIDs = { childId: string; bookId: string; sessionId: string };

export async function startNovaSession(childId: string, bookId: string): Promise<NovaSessionIDs> {
  // Create child reading session (existing table)
  const { data, error } = await supabase
    .from('child_reading_sessions')
    .insert({ child_id: childId, book_id: bookId })
    .select('id')
    .single();
  if (error) throw error;

  // Ensure bookshelf shows "reading" (your triggers award/log from here)
  await supabase
    .from('child_bookshelf')
    .upsert({ child_id: childId, book_id: bookId, status: 'reading', progress: 0 })
    .then(() => {}, () => {});

  return { childId, bookId, sessionId: data.id };
}

/** Called on each page turn to update timeline, rewards triggers, and AI insights */
export async function recordPageTurn(
  ids: NovaSessionIDs,
  pageIndex: number,
  pageText: string
) {
  // Child timeline (your parent mirror trigger handles propagation)
  await supabase
    .from('child_reading_timeline')
    .insert({ 
      child_id: ids.childId, 
      book_id: ids.bookId, 
      event_type: 'progress',
      session_id: ids.sessionId
    })
    .then(() => {}, () => {});

  // Trigger chunk insight → writes to nova_insights + problem words
  await supabase.functions
    .invoke('nova-generate-insights', {
      body: {
        session_id: ids.sessionId,
        child_id: ids.childId,
        book_id: ids.bookId,
        text_content: pageText,
      },
    })
    .catch(() => {});
}

/** Called when reader closes or finishes */
export async function stopNovaSession(ids: NovaSessionIDs, finalProgressPct: number) {
  // Summarize session & finalize rewards
  await supabase.functions
    .invoke('nova-end-session', { body: { session_id: ids.sessionId, total_seconds: null } })
    .catch(() => {});

  // Finish bookshelf (your triggers will award coins & log finished)
  const progress = Math.max(0, Math.min(100, Math.round(finalProgressPct)));
  await supabase
    .from('child_bookshelf')
    .upsert({
      child_id: ids.childId,
      book_id: ids.bookId,
      status: progress >= 99 ? 'finished' : 'reading',
      progress,
    })
    .then(() => {}, () => {});
}