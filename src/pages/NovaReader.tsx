import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useNovaSession } from '@/hooks/useNovaSession';
import { NovaCoach } from '@/components/nova/NovaCoach';
import { ProblemWords } from '@/components/nova/ProblemWords';
import { EpubReader } from '@/components/nova/EpubReader';

export default function NovaReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [readerContent, setReaderContent] = useState<'epub' | 'pdf' | 'online'>('online');

  // Get active child from session storage
  useEffect(() => {
    const savedChild = sessionStorage.getItem('nova_active_child');
    if (savedChild) {
      setActiveChildId(savedChild);
    } else {
      navigate('/novalearning');
    }
  }, [navigate]);

  // Load book details
  const { data: book, isLoading } = useQuery({
    queryKey: ['nova-book', bookId],
    queryFn: async () => {
      if (!bookId) throw new Error('No book ID');
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });

  // Nova session management
  const { sessionId, isListening, startSession, endSession } = useNovaSession(
    activeChildId || '',
    bookId || '',
    book?.title
  );

  // Determine reader type
  useEffect(() => {
    if (book) {
      if ((book as any).download_epub_url) {
        setReaderContent('epub');
      } else if ((book as any).download_pdf_url) {
        setReaderContent('pdf');
      } else {
        setReaderContent('online');
      }
    }
  }, [book]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Book not found</p>
            <Button 
              onClick={() => navigate('/novalearning')} 
              className="mt-4"
            >
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/novalearning')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
              
              <div>
                <h1 className="font-semibold">{book.title}</h1>
                {book.author && (
                  <p className="text-sm text-muted-foreground">
                    by {book.author}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isListening && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm">AI Listening</span>
                </div>
              )}
              
              {(book as any).has_audio && (
                <Button variant="outline" size="sm">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Audio
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-5rem)]">
        {/* Main reader area */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {/* Reader Content */}
            <div className="flex-1 bg-background rounded-lg border">
              {readerContent === 'epub' && book.download_epub_url && (
                <EpubReader
                  bookUrl={book.download_epub_url}
                  bookTitle={book.title}
                  onLocationChange={(locator) => {
                    console.log('Location changed:', locator);
                  }}
                  onTextExtracted={(text) => {
                    console.log('Text extracted:', text);
                  }}
                />
              )}
              
              {(readerContent === 'pdf' || readerContent === 'online') && (
                <div className="w-full h-full">
                  <iframe
                    src={book.download_pdf_url || book.read_online_url}
                    className="w-full h-full border-0 rounded-lg"
                    title={`${book.title} Reader`}
                  />
                </div>
              )}
              
              {!readerContent && (
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Reader Loading...</h3>
                      <p className="text-muted-foreground">Preparing your reading experience</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nova Coach Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <BookOpen className="h-5 w-5" />
            Nova Coach
          </div>

          {sessionId && (
            <>
              <NovaCoach sessionId={sessionId} childId={activeChildId} />
              <ProblemWords sessionId={sessionId} childId={activeChildId} />
            </>
          )}

          {!sessionId && (
            <Card>
              <div className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Start reading to activate Nova Coach
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}