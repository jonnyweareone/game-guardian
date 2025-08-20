
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BookIngestorProps {
  onBookIngested?: (bookId: string) => void;
}

export function BookIngestor({ onBookIngested }: BookIngestorProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    gutenbergId: '',
    sourceUrl: '',
    description: '',
    category: 'Literature',
    keyStage: 'KS2',
    isFiction: true,
  });

  const queryClient = useQueryClient();

  const ingestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Determine source URL
      let sourceUrl = data.sourceUrl;
      if (!sourceUrl && data.gutenbergId) {
        sourceUrl = `https://www.gutenberg.org/cache/epub/${data.gutenbergId}/pg${data.gutenbergId}.txt`;
      }

      if (!sourceUrl) {
        throw new Error('Either Gutenberg ID or Source URL is required');
      }

      // Insert book - this will trigger the ingestion automatically
      const { data: book, error } = await supabase
        .from('books')
        .insert({
          title: data.title,
          author: data.author,
          authors: data.author ? [data.author] : [],
          description: data.description,
          category: data.category,
          level_tags: [data.keyStage],
          is_fiction: data.isFiction,
          source: 'gutenberg',
          source_id: data.gutenbergId || null,
          source_url: sourceUrl,
          language: 'en',
          ingested: false, // Will be set to true by the worker
        })
        .select()
        .single();

      if (error) throw error;
      return book;
    },
    onSuccess: (book) => {
      toast.success('Book added successfully! Ingestion will start automatically.');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        gutenbergId: '',
        sourceUrl: '',
        description: '',
        category: 'Literature',
        keyStage: 'KS2',
        isFiction: true,
      });

      // Invalidate queries to refresh book lists
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['ingested-books'] });
      
      onBookIngested?.(book.id);
    },
    onError: (error) => {
      console.error('Ingestion error:', error);
      toast.error(error.message || 'Failed to add book');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.gutenbergId.trim() && !formData.sourceUrl.trim()) {
      toast.error('Either Gutenberg ID or Source URL is required');
      return;
    }

    ingestMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Add New Book
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Book Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gutenbergId">Project Gutenberg ID</Label>
              <Input
                id="gutenbergId"
                value={formData.gutenbergId}
                onChange={(e) => handleInputChange('gutenbergId', e.target.value)}
                placeholder="e.g. 271"
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Find books at gutenberg.org (e.g., for book 271, enter "271")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Or Direct URL</Label>
              <Input
                id="sourceUrl"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                placeholder="https://www.gutenberg.org/cache/epub/..."
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the book"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Biography">Biography</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Key Stage</Label>
              <Select
                value={formData.keyStage}
                onValueChange={(value) => handleInputChange('keyStage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KS1">Key Stage 1 (Ages 5-7)</SelectItem>
                  <SelectItem value="KS2">Key Stage 2 (Ages 7-11)</SelectItem>
                  <SelectItem value="KS3">Key Stage 3 (Ages 11-14)</SelectItem>
                  <SelectItem value="KS4">Key Stage 4 (Ages 14-16)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.isFiction ? 'fiction' : 'non-fiction'}
                onValueChange={(value) => handleInputChange('isFiction', value === 'fiction')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={ingestMutation.isPending}>
              {ingestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Book...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Book
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <p className="font-medium mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter book details and a Gutenberg ID or direct URL</li>
              <li>The book will be automatically fetched and processed</li>
              <li>Processing usually takes 1-2 minutes for most books</li>
              <li>Voice analysis happens when a child first reads the book</li>
            </ol>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
