import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Filter, PlayCircle, FileText, Volume2 } from 'lucide-react';

interface NovaLibraryProps {
  childId: string;
}

export function NovaLibrary({ childId }: NovaLibraryProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Load books from catalog
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['nova-books', searchQuery, ageFilter, subjectFilter],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .order('title');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
      }

      if (ageFilter !== 'all') {
        const age = parseInt(ageFilter);
        query = query.lte('age_min', age).gte('age_max', age);
      }

      if (subjectFilter !== 'all') {
        query = query.eq('subject', subjectFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Placeholder for bookshelf data (will be enabled once types are regenerated)
  const bookshelfData: any[] = [];

  const getBookStatus = (bookId: string) => {
    const shelf = bookshelfData.find(item => item.book_id === bookId);
    return shelf ? { status: shelf.status, progress: shelf.progress } : null;
  };

  const handleStartReading = async (book: any) => {
    try {
      // Update bookshelf status (using any cast until types refresh)
      await (supabase as any)
        .from('child_bookshelf')
        .upsert({
          child_id: childId,
          book_id: book.id,
          status: 'reading',
          progress: 0,
          started_at: new Date().toISOString(),
        });

      // Navigate to reader
      navigate(`/nova-reader/${book.id}`);
    } catch (error) {
      console.error('Error starting reading:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 animate-pulse" />
        <p>Loading library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="7">Age 7</SelectItem>
                <SelectItem value="8">Age 8</SelectItem>
                <SelectItem value="9">Age 9</SelectItem>
                <SelectItem value="10">Age 10</SelectItem>
                <SelectItem value="11">Age 11</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Fantasy">Fantasy</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Friendship">Friendship</SelectItem>
                <SelectItem value="Nature">Nature</SelectItem>
                <SelectItem value="Animals">Animals</SelectItem>
                <SelectItem value="KS2">KS2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => {
          const status = getBookStatus(book.id);
          
          return (
            <Card key={book.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Book Cover */}
                <div className="aspect-[3/4] mb-4 bg-muted rounded-lg overflow-hidden">
                  {(book as any).cover_url ? (
                    <img
                      src={(book as any).cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {book.title}
                  </h3>
                  
                  {(book.author || (book as any).authors) && (
                    <p className="text-xs text-muted-foreground">
                      by {book.author || ((book as any).authors && (book as any).authors.join(', '))}
                    </p>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {status && (
                      <Badge variant={
                        status.status === 'finished' ? 'default' :
                        status.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {status.status === 'not_started' && 'Not Started'}
                        {status.status === 'in_progress' && `${Math.round(status.progress || 0)}%`}
                        {status.status === 'finished' && 'Finished'}
                        {status.status === 'abandoned' && 'Paused'}
                      </Badge>
                    )}
                  </div>

                  {/* Format badges */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {(book as any).download_epub_url && (
                      <Badge variant="outline" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        EPUB
                      </Badge>
                    )}
                    {(book as any).download_pdf_url && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </Badge>
                    )}
                    {(book as any).has_audio && (
                      <Badge variant="outline" className="text-xs">
                        <Volume2 className="h-3 w-3 mr-1" />
                        Audio
                      </Badge>
                    )}
                  </div>

                  {/* Age range */}
                  {book.age_min && book.age_max && (
                    <p className="text-xs text-muted-foreground">
                      Ages {book.age_min}-{book.age_max}
                    </p>
                  )}

                  {/* Read button */}
                  <Button
                    onClick={() => handleStartReading(book)}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {status?.status === 'in_progress' ? 'Continue' : 'Read'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {books.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters to find more books.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}