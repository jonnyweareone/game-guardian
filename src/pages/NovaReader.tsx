import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Volume2, Sparkles, Brain } from 'lucide-react';
import { NovaCoach } from '@/components/nova/NovaCoach';
import { ProblemWords } from '@/components/nova/ProblemWords';
import { useNovaSession } from '@/hooks/useNovaSession';

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

  // Nova session management (auto-start listening)
  const { sessionId, isListening, startSession, endSession } = useNovaSession(
    activeChildId,
    bookId || '',
    book?.title
  );

  // Determine reader type
  useEffect(() => {
    if (book) {
      if (book.download_epub_url) {
        setReaderContent('epub');
      } else if (book.download_pdf_url) {
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
                {book.authors && book.authors.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    by {book.authors.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isListening && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm">AI Listening</span>
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              
              {book.has_audio && (
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
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              {readerContent === 'epub' && book.download_epub_url && (
                <div className="text-center py-20">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">EPUB Reader</h3>
                  <p className="text-muted-foreground mb-4">
                    This would integrate with Readium Web or similar EPUB reader
                  </p>
                  <Button 
                    onClick={() => window.open(book.download_epub_url, '_blank')}
                  >
                    Download EPUB
                  </Button>
                </div>
              )}

              {readerContent === 'pdf' && book.download_pdf_url && (
                <div className="h-full">
                  <iframe
                    src={book.download_pdf_url}
                    className="w-full h-full border-0"
                    title={`${book.title} - PDF Reader`}
                  />
                </div>
              )}

              {readerContent === 'online' && book.read_online_url && (
                <div className="h-full">
                  <iframe
                    src={book.read_online_url}
                    className="w-full h-full border-0"
                    title={`${book.title} - Online Reader`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nova Coach Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Brain className="h-5 w-5" />
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
              <CardContent className="pt-6 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Start reading to activate Nova Coach
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}