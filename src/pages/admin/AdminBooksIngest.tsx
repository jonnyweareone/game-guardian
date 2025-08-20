
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, RefreshCw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBooksIngest() {
  const [newBookUrl, setNewBookUrl] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const queryClient = useQueryClient();

  // Load all books with ingestion status
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['admin-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Load job queue status
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['nova-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nova_jobs')
        .select(`
          *,
          books:book_id(title)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Add new book mutation
  const addBookMutation = useMutation({
    mutationFn: async ({ url, title }: { url: string; title: string }) => {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title,
          source: 'gutenberg',
          source_url: url,
          language: 'en',
          category: 'Literature',
          level_tags: ['KS2'],
          is_fiction: true,
          ingested: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Book added successfully! Ingestion will start automatically.');
      setNewBookUrl('');
      setNewBookTitle('');
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      queryClient.invalidateQueries({ queryKey: ['nova-jobs'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add book');
    },
  });

  // Retry failed job mutation
  const retryJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('nova_jobs')
        .update({ 
          status: 'queued', 
          error: null,
          finished_at: null 
        })
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job requeued successfully');
      queryClient.invalidateQueries({ queryKey: ['nova-jobs'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to retry job');
    },
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookUrl.trim() || !newBookTitle.trim()) {
      toast.error('Both URL and title are required');
      return;
    }
    addBookMutation.mutate({ url: newBookUrl, title: newBookTitle });
  };

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
      case 'running':
        return <Badge variant="default"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case 'done':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Done</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Books & Ingestion Management</h1>
        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-books'] });
            queryClient.invalidateQueries({ queryKey: ['nova-jobs'] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Add new book */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Book Title</Label>
                <Input
                  id="title"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Enter book title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Gutenberg URL</Label>
                <Input
                  id="url"
                  value={newBookUrl}
                  onChange={(e) => setNewBookUrl(e.target.value)}
                  placeholder="https://www.gutenberg.org/cache/epub/.../pg....txt"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={addBookMutation.isPending}>
              {addBookMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Book
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Job Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs?.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getJobStatusBadge(job.status)}
                    <span className="font-medium">{job.job_type}</span>
                    <span className="text-sm text-muted-foreground">
                      {(job.books as any)?.title || job.book_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                    {job.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryJobMutation.mutate(job.id)}
                        disabled={retryJobMutation.isPending}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {jobs?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No recent jobs</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Books Status */}
      <Card>
        <CardHeader>
          <CardTitle>Books Status</CardTitle>
        </CardHeader>
        <CardContent>
          {booksLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading books...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {books?.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {book.author} • {book.pages || 0} pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {book.ingested ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ingested
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {book.analysis_done ? (
                      <Badge variant="default">Analyzed</Badge>
                    ) : (
                      <Badge variant="outline">No Analysis</Badge>
                    )}
                  </div>
                </div>
              ))}
              {books?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No books found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
