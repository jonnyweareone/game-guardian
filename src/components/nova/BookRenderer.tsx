
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BookPage {
  id: string;
  book_id: string;
  page_index: number;
  content: string;
  tokens: Array<{
    word: string;
    start: number;
    end: number;
    tricky?: boolean;
  }> | null;
  image_url?: string;
}

interface BookRendererProps {
  bookId: string;
  childId: string;
  onProgressUpdate?: (page: number, readPercent: number) => void;
  onCoinsAwarded?: (coins: number) => void;
}

export const BookRenderer: React.FC<BookRendererProps> = ({
  bookId,
  childId,
  onProgressUpdate,
  onCoinsAwarded
}) => {
  const { toast } = useToast();
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load book pages using edge function
  useEffect(() => {
    const loadPages = async () => {
      try {
        // First try the edge function
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-book-pages', {
          body: { book_id: bookId }
        });

        if (edgeError) {
          console.error('Error loading pages via edge function:', edgeError);
        }

        if (edgeData?.data && Array.isArray(edgeData.data)) {
        setPages(edgeData.data.map(page => ({
          ...page,
          tokens: page.tokens as Array<{word: string; start: number; end: number; tricky?: boolean}> | null
        })));
          return;
        }

        // Fallback to direct query if edge function fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('book_pages')
          .select('*')
          .eq('book_id', bookId)
          .order('page_index');

        if (fallbackError) {
          console.error('Error loading pages:', fallbackError);
          toast({
            title: "Error",
            description: "Failed to load book pages",
            variant: "destructive",
          });
          return;
        }
        
        setPages((fallbackData || []).map(page => ({
          ...page,
          tokens: page.tokens as Array<{word: string; start: number; end: number; tricky?: boolean}> | null
        })));
      } catch (err) {
        console.error('Error in loadPages:', err);
        toast({
          title: "Error",
          description: "Failed to load book content",
          variant: "destructive",
        });
      }
    };

    if (bookId) {
      loadPages();
    }
  }, [bookId, toast]);

  // Load reading progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data } = await supabase
          .from('child_reading_sessions')
          .select('current_locator')
          .eq('book_id', bookId)
          .eq('child_id', childId)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data?.current_locator) {
          const pageIndex = parseInt(data.current_locator) || 0;
          setCurrentPage(Math.min(pageIndex, pages.length - 1));
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    if (bookId && childId && pages.length > 0) {
      loadProgress();
    }
  }, [bookId, childId, pages.length]);

  const currentPageData = pages[currentPage];

  const saveProgress = async (pageIndex: number, readPercent: number = 100) => {
    try {
      // Update reading session
      await supabase
        .from('child_reading_sessions')
        .upsert({
          child_id: childId,
          book_id: bookId,
          current_locator: pageIndex.toString(),
          updated_at: new Date().toISOString()
        });

      // Update page progress and award coins
      if (readPercent === 100) {
        const { data: progressData } = await supabase
          .from('child_page_progress')
          .upsert({
            child_id: childId,
            book_id: bookId,
            page_index: pageIndex,
            read_percent: readPercent,
            coins_awarded: 5, // 5 coins per completed page
            updated_at: new Date().toISOString()
          })
          .select()
          .maybeSingle();

        if (progressData && 'coins_awarded' in progressData) {
          onCoinsAwarded?.(progressData.coins_awarded);
          toast({
            title: "Page Complete! 🎉",
            description: `You earned ${progressData.coins_awarded} coins!`,
          });
        }
      }

      onProgressUpdate?.(pageIndex, readPercent);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const startReading = () => {
    if (!currentPageData) return;

    setIsReading(true);
    setCurrentWordIndex(0);

    // Use browser's speech synthesis for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPageData.content);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Track word highlighting during speech
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const wordIndex = currentPageData.tokens?.findIndex(token => 
            token.start <= charIndex && token.end >= charIndex
          ) || 0;
          setCurrentWordIndex(wordIndex);
        }
      };

      utterance.onend = () => {
        setIsReading(false);
        setCurrentWordIndex(0);
        saveProgress(currentPage, 100);
      };

      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const stopReading = () => {
    setIsReading(false);
    setCurrentWordIndex(0);
    
    if (speechRef.current) {
      speechSynthesis.cancel();
      speechRef.current = null;
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setCurrentWordIndex(0);
      saveProgress(newPage, 0);
      stopReading();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setCurrentWordIndex(0);
      saveProgress(newPage, 0);
      stopReading();
    }
  };

  const renderHighlightedText = () => {
    if (!currentPageData?.tokens) {
      return <p className="text-lg leading-relaxed">{currentPageData?.content}</p>;
    }

    return (
      <p className="text-lg leading-relaxed">
        {currentPageData.tokens.map((token, index) => {
          let className = 'transition-colors duration-200';
          
          // Current word highlighting (for TTS)
          if (index === currentWordIndex && isReading) {
            className += ' bg-yellow-200 text-yellow-900 font-semibold';
          }
          // Tricky word highlighting (always visible)
          else if (token.tricky) {
            className += ' bg-orange-100 text-orange-800 font-medium border-b-2 border-orange-300';
          }
          
          return (
            <span key={index} className={className} title={token.tricky ? 'Difficult word' : undefined}>
              {token.word}{' '}
            </span>
          );
        })}
      </p>
    );
  };

  if (!currentPageData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading book content...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <span className="font-medium">Page {currentPage + 1} of {pages.length}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isReading ? stopReading : startReading}
            disabled={!currentPageData}
          >
            {isReading ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Read Aloud
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Split-screen content */}
      <div className="flex-1 flex">
        {/* Left pane - Text content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div
            ref={contentRef}
            className="font-serif text-foreground"
            style={{ fontSize: '18px', lineHeight: '1.8' }}
          >
            {renderHighlightedText()}
          </div>
        </div>

        {/* Right pane - Image */}
        <div className="w-1/2 border-l bg-muted/30 flex items-center justify-center">
          {currentPageData.image_url ? (
            <img
              src={currentPageData.image_url}
              alt={`Page ${currentPage + 1} illustration`}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                📖
              </div>
              <p>No image for this page</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex justify-between items-center p-4 border-t bg-card">
        <Button
          variant="outline"
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Progress: {Math.round(((currentPage + 1) / pages.length) * 100)}%
        </div>

        <Button
          variant="outline"
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
