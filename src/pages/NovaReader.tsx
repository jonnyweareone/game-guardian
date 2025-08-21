
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookRenderer } from '@/components/nova/BookRenderer';
import { NovaCoach } from '@/components/nova/NovaCoach';
import RealtimeVoiceInterface from '@/components/nova/RealtimeVoiceInterface';
import { WordHunt } from '@/components/nova/games/WordHunt';
import { CoinsDisplay } from '@/components/nova/CoinsDisplay';
import { useNovaSignals } from '@/hooks/useNovaSignals';
import { Loader2 } from 'lucide-react';

export default function NovaReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('child') || '';
  const token = searchParams.get('token');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPageContent, setCurrentPageContent] = useState<string>('');
  
  // Token mode: uses different hooks and edge functions
  const isTokenMode = !!token;
  
  // Initialize AI listening for this reading session
  const { startListening, stopListening } = useNovaSignals(childId, isTokenMode);
  
  // Create session using token-based edge function in token mode
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
    },
    onError: (error) => {
      console.error('Failed to create token session:', error);
    },
  });
  
  // Start listening and create session when component mounts
  useEffect(() => {
    if (bookId && childId) {
      if (isTokenMode) {
        // In token mode, create session via edge function
        createTokenSessionMutation.mutate();
      } else {
        // In normal mode, start listening via direct DB access
        startListening(bookId);
      }
    }
    
    // Cleanup: stop listening when component unmounts
    return () => {
      if (childId && !isTokenMode) {
        stopListening();
      }
    };
  }, [bookId, childId, isTokenMode]);

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
            onProgressUpdate={(page, percent) => {
              console.log(`Reading progress: page ${page + 1}, ${percent.toFixed(1)}%`);
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
