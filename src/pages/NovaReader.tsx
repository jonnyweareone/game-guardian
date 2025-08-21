
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookRenderer } from '@/components/nova/BookRenderer';
import { NovaCoach } from '@/components/nova/NovaCoach';
import { CoinsDisplay } from '@/components/nova/CoinsDisplay';
import { SessionOverlay } from '@/components/nova/SessionOverlay';
import { useNovaSignals } from '@/hooks/useNovaSignals';
import StartReadingOverlay from '@/components/nova/StartReadingOverlay';
import { SafeBoundary } from '@/components/common/SafeBoundary';
import { Loader2 } from 'lucide-react';

type NovaSession = { id: string; childId: string; bookId: string };

export default function NovaReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const childId = searchParams.get('child') || '';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [overlayState, setOverlayState] = useState<'start' | 'paused' | 'ending' | null>('start');
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  // Token mode (if present)
  const urlToken = searchParams.get('token');
  const effectiveToken = urlToken || sessionStorage.getItem('nova_token');
  const isTokenMode = !!effectiveToken;

  // Signals (unconditional hook call — safe)
  const { startListening, stopListening } = useNovaSignals(childId, isTokenMode);
  
  // Book details (unchanged)
  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      const { data, error } = await supabase.from('books').select('*').eq('id', bookId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });

  // Start session — only on click
  const handleStartSession = async () => {
    if (!childId || !bookId) return;
    setIsSessionLoading(true);

    if (isTokenMode) {
      const { data, error } = await supabase.functions
        .invoke('nova-start-session-token', { body: { token: effectiveToken, bookId, childId } });
      if (!error && data?.sessionId) {
        setSessionId(data.sessionId);
        setHasStarted(true);
        setOverlayState(null);
        setIsSessionLoading(false);
      } else {
        console.error('Failed to start (token):', error);
        setIsSessionLoading(false);
      }
    } else {
      const { data, error } = await supabase
        .from('child_reading_sessions')
        .insert({ child_id: childId, book_id: bookId })
        .select('id').single();
      if (!error && data) {
        setSessionId(data.id);
        setHasStarted(true);
        setOverlayState(null);
        setIsSessionLoading(false);
        await supabase.from('child_bookshelf')
          .upsert({ child_id: childId, book_id: bookId, status: 'reading', progress: 0 });
      } else {
        console.error('Failed to start session:', error);
        setIsSessionLoading(false);
      }
    }

    // Mic/listening only after start
    try { await startListening(bookId); } catch {}
  };

  const handlePauseSession = async () => {
    setIsSessionLoading(true);
    if (isTokenMode && sessionId) {
      await supabase.functions.invoke('nova-pause-session-token', { body: { token: effectiveToken, sessionId } });
    }
    await stopListening();
    setOverlayState('paused');
    setIsSessionLoading(false);
  };

  const handleResumeSession = async () => {
    setIsSessionLoading(true);
    if (isTokenMode && sessionId) {
      await supabase.functions.invoke('nova-resume-session-token', { body: { token: effectiveToken, sessionId } });
    }
    await startListening(bookId!);
    setOverlayState(null);
    setIsSessionLoading(false);
  };

  const handleEndSession = async () => {
    setIsSessionLoading(true);
    try {
      if (isTokenMode && sessionId) {
        await supabase.functions.invoke('nova-end-session-token', { body: { token: effectiveToken, sessionId } });
      } else if (sessionId) {
        await supabase.functions.invoke('nova-end-session', { body: { session_id: sessionId } });
        await supabase.from('child_bookshelf')
          .upsert({ child_id: childId, book_id: bookId, status: 'finished', progress: 100 });
      }
    } finally {
      await stopListening();
      setOverlayState('ending');
      setHasStarted(false);
      setSessionId(null);
      setIsSessionLoading(false);
    }
  };

  if (!bookId) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Overlay controller */}
      {overlayState && (
        <SessionOverlay
          state={overlayState}
          onStart={handleStartSession}
          onResume={handleResumeSession}
          onPause={handlePauseSession}
          onEnd={handleEndSession}
          bookTitle={book?.title}
          isLoading={isSessionLoading}
        />
      )}

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</> : (book?.title || 'Reader')}
              </h1>
              <p className="text-xs text-muted-foreground">{book?.author}</p>
            </div>
            <CoinsDisplay childId={childId} />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="container mx-auto p-4 grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <SafeBoundary>
            {/* Mount the heavy subtree only AFTER start */}
            {hasStarted && sessionId && (
              <BookRenderer
                bookId={bookId}
                childId={childId}
                sessionId={sessionId}
                onPageChange={(content, pageIndex) => {
                  // Page turn → insights + timeline handled inside BookRenderer already
                }}
                onProgressUpdate={() => {}}
                onCoinsAwarded={() => {}}
              />
            )}
          </SafeBoundary>
        </div>

        <aside className="space-y-6">
          <NovaCoach sessionId={sessionId || ''} childId={childId} />
        </aside>
      </div>

      {/* Don't allow anything to mount until start */}
      {!hasStarted && <StartReadingOverlay onStart={handleStartSession} />}
    </div>
  );
}
