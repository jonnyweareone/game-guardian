
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
  }>;
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
  const [readingSpeed, setReadingSpeed] = useState(150); // words per minute
  const contentRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load book pages
  useEffect(() => {
    const loadPages = async () => {
      const { data, error } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', bookId)
        .order('page_index');

      if (error) {
        console.error('Error loading pages:', error);
        toast({
          title: "Error",
          description: "Failed to load book pages",
          variant: "destructive",
        });
        return;
      }

      setPages(data || []);
    };

    if (bookId) {
      loadPages();
    }
  }, [bookId, toast]);

  // Load reading progress
  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase
        .from('reading_sessions')
        .select('current_page')
        .eq('book_id', bookId)
        .eq('child_id', childId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.current_page) {
        setCurrentPage(data.current_page);
      }
    };

    if (bookId && childId) {
      loadProgress();
    }
  }, [bookId, childId]);

  const currentPageData = pages[currentPage];

  const saveProgress = async (pageIndex: number, readPercent: number = 100) => {
    try {
      // Update reading session
      await supabase
        .from('reading_sessions')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          child_id: childId,
          book_id: bookId,
          current_page: pageIndex,
          tokens_read: Math.floor((currentPageData?.tokens?.length || 0) * readPercent / 100)
        });

      // Update page progress and award coins
      const { data: progressData } = await supabase
        .from('child_page_progress')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          child_id: childId,
          book_id: bookId,
          page_index: pageIndex,
          read_percent: readPercent,
          coins_awarded: readPercent === 100 ? 5 : 0 // 5 coins per completed page
        })
        .select()
        .single();

      if (progressData?.coins_awarded && readPercent === 100) {
        onCoinsAwarded?.(progressData.coins_awarded);
        toast({
          title: "Page Complete! 🎉",
          description: `You earned ${progressData.coins_awarded} coins!`,
        });
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
        {currentPageData.tokens.map((token, index) => (
          <span
            key={index}
            className={`${
              index === currentWordIndex && isReading
                ? 'bg-yellow-200 text-yellow-900 font-semibold'
                : ''
            } transition-colors duration-200`}
          >
            {token.word}{' '}
          </span>
        ))}
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Page {currentPage + 1} of {pages.length}</span>
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
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Image pane (if available) */}
        {currentPageData.image_url && (
          <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={currentPageData.image_url}
              alt={`Page ${currentPage + 1} illustration`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Text content with highlighting */}
        <div
          ref={contentRef}
          className="min-h-96 p-6 bg-background border rounded-lg font-serif text-foreground"
          style={{ fontSize: '18px', lineHeight: '1.8' }}
        >
          {renderHighlightedText()}
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center">
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
      </CardContent>
    </Card>
  );
};
