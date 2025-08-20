
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookRenderer } from '@/components/nova/BookRenderer';
import { BookIngestor } from '@/components/nova/BookIngestor';
import { ReadingRewards } from '@/components/nova/ReadingRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NovaReader() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('child') || sessionStorage.getItem('nova_active_child') || 'demo-child-1';
  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookId || null);
  const [showIngestor, setShowIngestor] = useState(false);

  // Load book details
  const { data: book } = useQuery({
    queryKey: ['book', selectedBookId],
    queryFn: async () => {
      if (!selectedBookId) return null;
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', selectedBookId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBookId,
  });

  // Load available ingested books
  const { data: ingestedBooks } = useQuery({
    queryKey: ['ingested-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('ingested', true)
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleBookIngested = (newBookId: string) => {
    setSelectedBookId(newBookId);
    setShowIngestor(false);
  };

  const handleProgressUpdate = (page: number, readPercent: number) => {
    console.log(`Page ${page + 1} progress: ${readPercent}%`);
  };

  const handleCoinsAwarded = (coins: number) => {
    console.log(`Awarded ${coins} coins!`);
  };

  if (showIngestor) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowIngestor(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reader
          </Button>
          <h1 className="text-2xl font-bold">Ingest New Book</h1>
        </div>
        
        <BookIngestor onBookIngested={handleBookIngested} />
      </div>
    );
  }

  if (!selectedBookId) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nova Reader</h1>
          <Button onClick={() => setShowIngestor(true)}>
            Add New Book
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ingestedBooks?.map((ingestedBook) => (
            <Card 
              key={ingestedBook.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBookId(ingestedBook.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  {ingestedBook.cover_url ? (
                    <img
                      src={ingestedBook.cover_url}
                      alt={ingestedBook.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{ingestedBook.title}</h3>
                    {ingestedBook.author && (
                      <p className="text-sm text-muted-foreground">by {ingestedBook.author}</p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{ingestedBook.category || 'Literature'}</span>
                  <span>{ingestedBook.license || 'Public Domain'}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {ingestedBooks?.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Books Available</h3>
                <p className="text-muted-foreground mb-4">
                  Start by ingesting a book from Project Gutenberg to begin reading.
                </p>
                <Button onClick={() => setShowIngestor(true)}>
                  Ingest Your First Book
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedBookId(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Book Library
          </Button>
          {book && (
            <div>
              <h1 className="text-2xl font-bold">{book.title}</h1>
              {book.author && (
                <p className="text-muted-foreground">by {book.author}</p>
              )}
            </div>
          )}
        </div>
        
        <Button variant="outline" onClick={() => setShowIngestor(true)}>
          Add New Book
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <BookRenderer
            bookId={selectedBookId}
            childId={childId}
            onProgressUpdate={handleProgressUpdate}
            onCoinsAwarded={handleCoinsAwarded}
          />
        </div>
        
        <div className="space-y-6">
          <ReadingRewards
            childId={childId}
            bookId={selectedBookId}
          />
        </div>
      </div>
    </div>
  );
}
