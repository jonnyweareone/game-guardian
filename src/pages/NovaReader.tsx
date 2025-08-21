
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookRenderer } from '@/components/nova/BookRenderer';
import { NovaCoach } from '@/components/nova/NovaCoach';
import RealtimeVoiceInterface from '@/components/nova/RealtimeVoiceInterface';
import { WordHunt } from '@/components/nova/games/WordHunt';
import { CoinsDisplay } from '@/components/nova/CoinsDisplay';
import { SessionOverlay } from '@/components/nova/SessionOverlay';
import { useNovaSignals } from '@/hooks/useNovaSignals';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NovaReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const childId = searchParams.get('child') || '';
  const token = searchParams.get('token');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPageContent, setCurrentPageContent] = useState<string>('');
  const [overlayState, setOverlayState] = useState<'start' | 'paused' | 'ending' | null>('start');
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  
  // Token mode: uses different hooks and edge functions
  const isTokenMode = !!token;
  
  // Initialize AI listening for this reading session
  const { startListening, stopListening } = useNovaSignals(childId, isTokenMode);
  
  // Session management mutations
  const createTokenSessionMutation = useMutation({
    mutationFn: async () => {
      if (!token || !bookId) throw new Error('Token and bookId required');
      
      const { data, error } = await supabase.functions.invoke('nova-start-session-token', {
        body: { token, bookId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Token session created:', data.session_id);
      setSessionId(data.session_id);
      setOverlayState(null);
    },
    onError: (error) => {
      console.error('Failed to create token session:', error);
      setIsSessionLoading(false);
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: async () => {
      if (!token || !sessionId) throw new Error('Token and sessionId required');
      
      const { data, error } = await supabase.functions.invoke('nova-pause-session-token', {
        body: { token, sessionId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setOverlayState('paused');
      setIsSessionLoading(false);
    },
    onError: (error) => {
      console.error('Failed to pause session:', error);
      setIsSessionLoading(false);
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!token || !sessionId) throw new Error('Token and sessionId required');
      
      const { data, error } = await supabase.functions.invoke('nova-resume-session-token', {
        body: { token, sessionId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setOverlayState(null);
      setIsSessionLoading(false);
    },
    onError: (error) => {
      console.error('Failed to resume session:', error);
      setIsSessionLoading(false);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!token || !sessionId) throw new Error('Token and sessionId required');
      
      const { data, error } = await supabase.functions.invoke('nova-end-session-token', {
        body: { token, sessionId, progress: currentProgress }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      navigate('/nova-learning');
    },
    onError: (error) => {
      console.error('Failed to end session:', error);
      setIsSessionLoading(false);
    },
  });

  // Session control handlers
  const handleStartSession = () => {
    setIsSessionLoading(true);
    if (isTokenMode) {
      createTokenSessionMutation.mutate();
    } else {
      startListening(bookId);
      setOverlayState(null);
      setIsSessionLoading(false);
    }
  };

  const handlePauseSession = () => {
    setIsSessionLoading(true);
    if (isTokenMode) {
      pauseSessionMutation.mutate();
    } else {
      // For normal mode, just show overlay
      setOverlayState('paused');
      setIsSessionLoading(false);
    }
  };

  const handleResumeSession = () => {
    setIsSessionLoading(true);
    if (isTokenMode) {
      resumeSessionMutation.mutate();
    } else {
      setOverlayState(null);
      setIsSessionLoading(false);
    }
  };

  const handleEndSession = () => {
    setIsSessionLoading(true);
    if (isTokenMode) {
      endSessionMutation.mutate();
    } else {
      stopListening();
      navigate('/nova-learning');
    }
  };

  // Load book to show title in header
  const { data: book, isLoading } = useQuery({
    queryKey: ['book-header', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      const { data, error } = await supabase
        .from('books')
        .select('title, author')
        .eq('id', bookId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });

  if (!bookId || !childId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Reader URL</h1>
          <p className="text-muted-foreground">Book ID and child ID are required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Session Overlay */}
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
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  book?.title || 'Nova Reader'
                )}
              </h1>
              {book?.author && (
                <p className="text-sm text-muted-foreground">by {book.author}</p>
              )}
            </div>
            {sessionId && !overlayState && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePauseSession}
                disabled={isSessionLoading}
              >
                Pause Session
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex">
        <main className="flex-1 container mx-auto px-4 py-6">
          <BookRenderer
            bookId={bookId}
            childId={childId}
            token={token}
            sessionId={sessionId}
            paused={!!overlayState}
            onProgressUpdate={(page, percent) => {
              console.log(`Reading progress: page ${page + 1}, ${percent.toFixed(1)}%`);
              setCurrentProgress(percent);
            }}
            onCoinsAwarded={(coins) => {
              console.log(`Awarded ${coins} coins for reading`);
            }}
            onSessionCreated={(newSessionId) => {
              setSessionId(newSessionId);
            }}
            onPageChange={(content) => {
              setCurrentPageContent(content);
            }}
          />
        </main>
        
        {/* AI Sidebar */}
        <aside className="w-80 border-l bg-muted/20 p-4 space-y-4">
          <CoinsDisplay childId={childId} />
          <RealtimeVoiceInterface
            sessionId={sessionId}
            childId={childId}
            bookId={bookId}
            onSpeakingChange={(speaking) => {
              console.log('AI speaking:', speaking);
            }}
            onTranscriptUpdate={(transcript) => {
              console.log('AI transcript:', transcript);
            }}
          />
          <WordHunt
            pageText={currentPageContent}
            childId={childId}
            bookId={bookId}
          />
          <NovaCoach
            sessionId={sessionId || ''}
            childId={childId}
          />
        </aside>
      </div>
    </div>
  );
}
