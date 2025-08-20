import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useNovaSession } from '@/hooks/useNovaSession';
import { NovaCoach } from '@/components/nova/NovaCoach';
import { ProblemWords } from '@/components/nova/ProblemWords';
import VoiceInterface from '@/components/nova/VoiceInterface';
import { EpubReader } from '@/components/nova/EpubReader';
import { TextToSpeechPlayer } from '@/components/nova/TextToSpeechPlayer';
import { ReadingRewards } from '@/components/nova/ReadingRewards';
import { generateDemoInsights, getSampleBookContent } from '@/utils/demoBooksData';

export default function NovaReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [readerContent, setReaderContent] = useState<'epub' | 'pdf' | 'online'>('epub');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

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

  // Nova session management with demo data generation
  const { sessionId, isListening, startSession, endSession } = useNovaSession(
    activeChildId || '',
    bookId || '',
    book?.title
  );

  // Generate demo data when session starts
  useEffect(() => {
    if (sessionId && activeChildId && bookId && book?.title) {
      console.log('Generating demo data for Nova coaching');
      
      // Generate demo insights and problem words after a short delay
      setTimeout(() => {
        generateDemoInsights(sessionId, activeChildId, bookId);
      }, 3000); // 3 second delay to simulate AI processing
    }
  }, [sessionId, activeChildId, bookId, book?.title]);

  // Determine reader type
  useEffect(() => {
    if (book) {
      // Prefer PDF (most reliable to embed), then online, then EPUB (simulated)
      if ((book as any).download_pdf_url) {
        setReaderContent('pdf');
      } else if ((book as any).read_online_url) {
        setReaderContent('online');
      } else if ((book as any).download_epub_url) {
        setReaderContent('epub');
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
                <div className="w-full h-full relative">
                  <iframe
                    src={
                      (readerContent === 'pdf' && (book as any).download_pdf_url)
                        ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(String((book as any).download_pdf_url))}`
                        : String((book as any).read_online_url)
                    }
                    className="w-full h-full border-0 rounded-lg"
                    title={`${book.title} Reader`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(String((book as any).download_pdf_url || (book as any).read_online_url), '_blank', 'noopener')}
                    >
                      Open in new tab
                    </Button>
                  </div>
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

        {/* Right Sidebar - AI Coach, Voice Interface, and Rewards */}
        <div className="w-80 bg-muted/50 p-4 space-y-4 overflow-y-auto">
          {/* Reading Rewards */}
          <ReadingRewards 
            childId={activeChildId}
            sessionId={sessionId}
            bookId={bookId}
            onProgressUpdate={(progress) => {
              console.log('Reading progress:', progress);
            }}
          />

          {/* Text-to-Speech Player */}
          <TextToSpeechPlayer 
            bookId={bookId || ''}
            bookTitle={book?.title || ''}
            bookContent={getSampleBookContent(book?.title || '')}
            onProgressUpdate={(progress) => {
              console.log('TTS progress:', progress);
            }}
          />
          
          {/* Voice Interface */}
          <VoiceInterface 
            onSpeakingChange={setAiSpeaking}
            onTranscriptUpdate={setTranscript}
          />
          
          {sessionId && (
            <>
              <NovaCoach sessionId={sessionId} childId={activeChildId} />
              <ProblemWords sessionId={sessionId} childId={activeChildId} />
            </>
          )}
          
          {aiSpeaking && (
            <div className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-primary font-medium">Nova is speaking...</span>
            </div>
          )}
          
          {transcript && (
            <div className="p-3 bg-background rounded-lg border">
              <h4 className="text-sm font-medium mb-2">AI Response:</h4>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}