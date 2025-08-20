import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Loader2 } from 'lucide-react';

interface BookIngestionDialogProps {
  trigger?: React.ReactNode;
  onIngestionComplete?: () => void;
}

export const BookIngestionDialog: React.FC<BookIngestionDialogProps> = ({
  trigger,
  onIngestionComplete
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');

  const handleIngestBook = async () => {
    if (!sourceUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid book URL",
        variant: "destructive",
      });
      return;
    }

    setIsIngesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('book-ingest', {
        body: { source_url: sourceUrl }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Ingestion Started",
        description: "Book ingestion has begun. This may take a few minutes.",
      });
      
      setIsOpen(false);
      setSourceUrl('');
      onIngestionComplete?.();
    } catch (error: any) {
      console.error('Ingestion error:', error);
      toast({
        title: "Ingestion Failed",
        description: error.message || "Failed to start book ingestion",
        variant: "destructive",
      });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Ingest Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ingest New Book</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="source-url">Book URL</Label>
            <Input
              id="source-url"
              type="url"
              placeholder="https://www.gutenberg.org/ebooks/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              disabled={isIngesting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a Project Gutenberg book URL to ingest
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isIngesting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleIngestBook}
              disabled={isIngesting || !sourceUrl.trim()}
            >
              {isIngesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Ingestion
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};