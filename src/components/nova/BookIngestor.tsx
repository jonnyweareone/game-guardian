
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Download, ExternalLink } from 'lucide-react';

interface BookIngestorProps {
  onBookIngested?: (bookId: string) => void;
}

export const BookIngestor: React.FC<BookIngestorProps> = ({ onBookIngested }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [progress, setProgress] = useState('');

  const ingestBook = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsIngesting(true);
    setProgress('Starting ingestion...');

    try {
      const { data, error } = await supabase.functions.invoke('book-ingest', {
        body: { source_url: url.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Success! 📚",
          description: `"${data.title}" has been ingested with ${data.total_pages} pages`,
        });
        
        onBookIngested?.(data.book_id);
        setUrl('');
      } else {
        throw new Error(data.error || 'Ingestion failed');
      }
    } catch (error) {
      console.error('Ingestion error:', error);
      toast({
        title: "Ingestion Failed",
        description: error.message || 'Failed to ingest book',
        variant: "destructive",
      });
    } finally {
      setIsIngesting(false);
      setProgress('');
    }
  };

  const suggestedBooks = [
    {
      title: "Alice's Adventures in Wonderland",
      url: "https://www.gutenberg.org/ebooks/11.html.images",
      author: "Lewis Carroll"
    },
    {
      title: "The Adventures of Tom Sawyer",
      url: "https://www.gutenberg.org/ebooks/74.html.images",
      author: "Mark Twain"
    },
    {
      title: "Peter Pan",
      url: "https://www.gutenberg.org/ebooks/16.html.images",
      author: "J. M. Barrie"
    },
    {
      title: "The Secret Garden",
      url: "https://www.gutenberg.org/ebooks/113.html.images",
      author: "Frances Hodgson Burnett"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Ingest New Book
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Project Gutenberg URL (e.g., https://www.gutenberg.org/ebooks/16.html.images)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isIngesting}
            />
            <Button 
              onClick={ingestBook}
              disabled={isIngesting || !url.trim()}
            >
              {isIngesting ? 'Ingesting...' : 'Ingest'}
            </Button>
          </div>
          
          {progress && (
            <div className="text-sm text-muted-foreground">
              {progress}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Suggested Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {suggestedBooks.map((book, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{book.title}</h4>
                  <p className="text-sm text-muted-foreground">by {book.author}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(book.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setUrl(book.url);
                      setTimeout(ingestBook, 100);
                    }}
                    disabled={isIngesting}
                  >
                    Ingest
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
