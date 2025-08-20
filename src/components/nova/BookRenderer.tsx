
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { TextToSpeechPlayer } from './TextToSpeechPlayer';

interface BookRendererProps {
  bookId: string;
  childId: string;
  onProgressUpdate?: (page: number, readPercent: number) => void;
  onCoinsAwarded?: (coins: number) => void;
}

export function BookRenderer({ bookId, childId, onProgressUpdate, onCoinsAwarded }: BookRendererProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitedChapters, setVisitedChapters] = useState(new Set<number>());
  const queryClient = useQueryClient();

  // Load book details
  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Load book pages
  const { data: pages, isLoading: pagesLoading, refetch: refetchPages } = useQuery({
    queryKey: ['book-pages', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', bookId)
        .order('page_index');
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: book && !book.ingested ? 5000 : false, // Poll if not ingested
  });

  // Load book chapters
  const { data: chapters } = useQuery({
    queryKey: ['book-chapters', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!bookId,
  });

  // Create reading session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('child_reading_sessions')
        .insert({
          child_id: childId,
          book_id: bookId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      setSessionId(session.id);
      console.log('Reading session created:', session.id);
    },
  });

  // Update session on unmount or page change
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, currentLocator, totalSeconds }: {
      sessionId: string;
      currentLocator?: string;
      totalSeconds?: number;
    }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (currentLocator !== undefined) updates.current_locator = currentLocator;
      if (totalSeconds !== undefined) updates.total_seconds = totalSeconds;

      const { error } = await supabase
        .from('child_reading_sessions')
        .update(updates)
        .eq('id', sessionId);
      
      if (error) throw error;
    },
  });

  // Ensure slot 2 generation mutation
  const ensureSlot2Mutation = useMutation({
    mutationFn: async ({ bookId, chapterIndex }: { bookId: string; chapterIndex: number }) => {
      const { data, error } = await supabase.functions.invoke('nova-illustrations-ensure-slot2', {
        body: { book_id: bookId, chapter_index: chapterIndex }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Slot 2 generation queued:', data);
    },
  });

  // Create session on component mount
  useEffect(() => {
    if (bookId && childId && !sessionId) {
      createSessionMutation.mutate();
    }
  }, [bookId, childId]);

  // Update session when page changes
  useEffect(() => {
    if (sessionId && pages && pages.length > 0) {
      updateSessionMutation.mutate({
        sessionId,
        currentLocator: `page-${currentPage}`,
      });
    }
  }, [sessionId, currentPage]);

  // Trigger slot 2 generation when entering a new chapter
  useEffect(() => {
    if (chapters && pages && currentPage < pages.length) {
      // Find which chapter this page belongs to
      const currentChapter = chapters.find(ch => 
        currentPage >= (ch.first_page_index || 0) && 
        currentPage <= (ch.last_page_index || pages.length - 1)
      );

      if (currentChapter && !visitedChapters.has(currentChapter.chapter_index)) {
        setVisitedChapters(prev => new Set([...prev, currentChapter.chapter_index]));
        
        // Queue slot 2 generation for this chapter
        ensureSlot2Mutation.mutate({
          bookId,
          chapterIndex: currentChapter.chapter_index
        });
      }
    }
  }, [currentPage, chapters, pages, bookId]);

  const handlePageChange = useCallback((newPage: number) => {
    if (pages && newPage >= 0 && newPage < pages.length) {
      setCurrentPage(newPage);
      onProgressUpdate?.(newPage, ((newPage + 1) / pages.length) * 100);
    }
  }, [pages, onProgressUpdate]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    setCurrentPage(0);
    setIsPlaying(false);
  }, []);

  // Show loading state
  if (bookLoading || pagesLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading book...</p>
        </CardContent>
      </Card>
    );
  }

  // Show message if book not ingested yet
  if (book && !book.ingested) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Preparing your book...</h3>
          <p className="text-muted-foreground">
            We're getting "{book.title}" ready for you. This usually takes just a minute or two.
          </p>
          <Button 
            variant="outline" 
            onClick={() => refetchPages()} 
            className="mt-4"
          >
            Check Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show message if no pages available yet
  if (!pages || pages.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              📚
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No pages available yet</h3>
          <p className="text-muted-foreground mb-4">
            This book is still being processed. Please try again in a few moments.
          </p>
          <Button variant="outline" onClick={() => refetchPages()}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pages.length}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pages.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Card>
        <CardContent className="p-8">
          {/* Show illustration if available */}
          {currentPageData?.illustration_url && (
            <div className="mb-6 text-center">
              <img 
                src={currentPageData.illustration_url} 
                alt={currentPageData.illustration_prompt || "Chapter illustration"}
                className="max-w-full h-auto rounded-lg shadow-md mx-auto max-h-64"
              />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none">
            {currentPageData?.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Text-to-speech player */}
      {currentPageData && book && (
        <TextToSpeechPlayer
          bookId={bookId}
          bookTitle={book.title}
          bookContent={currentPageData.content}
          onProgressUpdate={onProgressUpdate ? (progress) => onProgressUpdate(currentPage, progress) : undefined}
        />
      )}

      {/* Progress indicator */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
