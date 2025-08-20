
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Loader2, BookOpen } from 'lucide-react';
import { PageContent } from './PageContent';
import ReadToMeDock from './ReadToMeDock';
import { useNovaSignals } from '@/hooks/useNovaSignals';

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
  const [currentTokenIndex, setCurrentTokenIndex] = useState<number | undefined>();
  const [showFrontMatter, setShowFrontMatter] = useState(false);
  const queryClient = useQueryClient();
  
  const { isListening, startListening, stopListening } = useNovaSignals(childId);

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

  // Load book pages (filter front matter by default)
  const { data: allPages, isLoading: pagesLoading, refetch: refetchPages } = useQuery({
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
    refetchInterval: book && !book.ingested ? 5000 : false,
  });

  // Filter pages based on front matter setting
  const pages = allPages?.filter(page => showFrontMatter || !page.is_front_matter) || [];

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

  // Update session on page change
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

  // Handle reader mount/unmount for listening state
  useEffect(() => {
    if (bookId && childId) {
      startListening(bookId);
      
      return () => {
        stopListening();
      };
    }
  }, [bookId, childId]);

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

  const handlePageChange = useCallback((newPage: number) => {
    if (pages && newPage >= 0 && newPage < pages.length) {
      setCurrentPage(newPage);
      setCurrentTokenIndex(undefined); // Reset token highlighting
      onProgressUpdate?.(newPage, ((newPage + 1) / pages.length) * 100);
    }
  }, [pages, onProgressUpdate]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    setCurrentPage(0);
    setIsPlaying(false);
    setCurrentTokenIndex(undefined);
  }, []);

  // Show loading state
  if (bookLoading || pagesLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading book...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if book not ingested yet
  if (book && !book.ingested) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
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
      </div>
    );
  }

  // Show message if no pages available yet
  if (!pages || pages.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
            </div>
            {allPages?.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No pages available yet</h3>
                <p className="text-muted-foreground mb-4">
                  This book is still being processed. Please try again in a few moments.
                </p>
                <Button variant="outline" onClick={() => refetchPages()}>
                  Refresh
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Only front matter available</h3>
                <p className="text-muted-foreground mb-4">
                  This book contains only introductory content. Would you like to view it?
                </p>
                <Button variant="outline" onClick={() => setShowFrontMatter(true)}>
                  Show Front Matter
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPageData = pages[currentPage];
  const hasChapters = allPages?.some(p => p.chapter_index !== null);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Sticky top navigation bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b p-4">
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
            
            <span className="text-sm font-medium">
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

            {currentPageData?.chapter_title && (
              <span className="text-sm text-muted-foreground">
                • {currentPageData.chapter_title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasChapters && (
              <Button variant="outline" size="sm">
                📑 Chapters
              </Button>
            )}
            
            {allPages?.some(p => p.is_front_matter) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFrontMatter(!showFrontMatter)}
              >
                {showFrontMatter ? 'Hide' : 'Show'} Front Matter
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area - remove card wrapper for cleaner look */}
      <div className="px-4">
        <PageContent
          content={currentPageData?.content || ''}
          tokens={currentPageData?.tokens || []}
          illustration_url={currentPageData?.illustration_url}
          illustration_caption={currentPageData?.illustration_caption}
          illustration_inline_at={currentPageData?.illustration_inline_at}
          currentTokenIndex={currentTokenIndex}
          className="mx-auto"
        />
      </div>

      {/* Progress indicator */}
      <div className="w-full bg-muted rounded-full h-1 mx-4">
        <div
          className="bg-primary h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
        />
      </div>

      {/* Read to Me dock - always rendered at bottom */}
      <ReadToMeDock
        bookTitle={book?.title}
        isPlaying={isPlaying}
        onPlay={handlePlayPause}
        onPause={handlePlayPause}
        onStop={() => setIsPlaying(false)}
        progress={currentPage}
        duration={pages.length - 1}
        onSeek={(position) => handlePageChange(Math.round(position))}
      />
    </div>
  );
}
