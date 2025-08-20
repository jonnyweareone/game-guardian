
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookRenderer } from '@/components/nova/BookRenderer';
import { Loader2 } from 'lucide-react';

export default function NovaReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('child') || '';

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

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <BookRenderer
          bookId={bookId}
          childId={childId}
          onProgressUpdate={(page, percent) => {
            console.log(`Reading progress: page ${page + 1}, ${percent.toFixed(1)}%`);
          }}
          onCoinsAwarded={(coins) => {
            console.log(`Awarded ${coins} coins for reading`);
          }}
        />
      </main>
    </div>
  );
}
