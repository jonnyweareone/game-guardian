import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';

interface NovaShelfProps {
  childId: string;
}

export function NovaShelf({ childId }: NovaShelfProps) {
  const navigate = useNavigate();

  // Load child's bookshelf with book details
  const { data: shelfBooks = [], isLoading } = useQuery({
    queryKey: ['nova-shelf', childId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('child_bookshelf')
          .select(`
            *,
            books (
              id,
              title,
              author,
              cover_url,
              has_audio,
              download_epub_url,
              download_pdf_url,
              read_online_url
            )
          `)
          .eq('child_id', childId)
          .order('started_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.log('Bookshelf table not ready yet, returning empty data');
        return [];
      }
    },
    enabled: !!childId,
  });

  const inProgressBooks = shelfBooks.filter(item => (item as any).status === 'reading');
  const finishedBooks = shelfBooks.filter(item => (item as any).status === 'finished');
  const savedBooks = shelfBooks.filter(item => (item as any).status === 'saved' || (item as any).saved_offline);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reading':
        return <Clock className="h-4 w-4" />;
      case 'finished':
        return <CheckCircle className="h-4 w-4" />;
      case 'abandoned':
        return <PauseCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleContinueReading = (book: any) => {
    // Store the active child and navigate to reader
    sessionStorage.setItem('nova_active_child', childId);
    navigate(`/nova-reader/${(book as any).books?.id || (book as any).book_id}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 animate-pulse" />
        <p>Loading your shelf...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* In Progress */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Currently Reading ({inProgressBooks.length})
        </h2>
        
        {inProgressBooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No books in progress</h3>
              <p className="text-muted-foreground mb-4">
                Start reading a book from the library to see it here.
              </p>
              <Button onClick={() => navigate('/novalearning')}>
                Browse Library
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressBooks.map((item) => (
              <Card key={(item as any).book_id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      {(item as any).books?.cover_url ? (
                        <img
                          src={(item as any).books.cover_url}
                          alt={(item as any).books?.title || 'Book'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {(item as any).books?.title || 'Unknown Book'}
                      </h3>
                      
                      {(item as any).books?.author && (
                        <p className="text-xs text-muted-foreground">
                          by {(item as any).books.author}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round((item as any).progress || 0)}% complete
                        </Badge>
                        {getStatusIcon((item as any).status)}
                      </div>

                      <Button
                        onClick={() => handleContinueReading(item)}
                        size="sm"
                        className="w-full"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Finished */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Finished ({finishedBooks.length})
        </h2>
        
        {finishedBooks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Books you complete will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {finishedBooks.map((item) => (
              <Card key={(item as any).book_id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] mb-2 bg-muted rounded overflow-hidden">
                    {(item as any).books?.cover_url ? (
                      <img
                        src={(item as any).books.cover_url}
                        alt={(item as any).books?.title || 'Book'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs line-clamp-2 mb-1">
                    {(item as any).books?.title || 'Unknown Book'}
                  </h3>
                  
                  <div className="flex items-center justify-center">
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Saved for Later */}
      {savedBooks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Saved for Later ({savedBooks.length})
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {savedBooks.map((item) => (
              <Card key={(item as any).book_id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] mb-2 bg-muted rounded overflow-hidden">
                    {(item as any).books?.cover_url ? (
                      <img
                        src={(item as any).books.cover_url}
                        alt={(item as any).books?.title || 'Book'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs line-clamp-2 mb-2">
                    {(item as any).books?.title || 'Unknown Book'}
                  </h3>
                  
                  <Button
                    onClick={() => handleContinueReading(item)}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}