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

  // Fetch child data to get their key stage
  const { data: child } = useQuery({
    queryKey: ['child', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, dob, name')
        .eq('id', childId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get child's key stage from education profile
  const { data: educationProfile } = useQuery({
    queryKey: ['education-profile', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education_profiles')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });

  // Load curriculum books filtered by child's key stage
  const { data: curriculumBooks = [], isLoading: loadingCurriculum } = useQuery({
    queryKey: ['nova-curriculum-books', educationProfile?.key_stage],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .eq('category', 'curriculum')
        .order('title')
        .limit(10);

      // Filter by key stage if available
      if (educationProfile?.key_stage) {
        query = query.eq('ks', educationProfile.key_stage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!educationProfile,
  });

  // Load fiction books filtered by child's age range
  const { data: fictionBooks = [], isLoading: loadingFiction } = useQuery({
    queryKey: ['nova-fiction-books', child?.dob],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .eq('category', 'fiction')
        .order('title')
        .limit(10);

      // Filter by age if child's DOB is available
      if (child?.dob) {
        const age = new Date().getFullYear() - new Date(child.dob).getFullYear();
        query = query.lte('age_min', age).gte('age_max', age);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!child,
  });

  // Load all books for search
  const { data: allBooks = [], isLoading: loadingAll } = useQuery({
    queryKey: ['nova-all-books', searchQuery, ageFilter, subjectFilter],
    queryFn: async () => {
      if (!searchQuery && ageFilter === 'all' && subjectFilter === 'all') {
        return [];
      }

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
        // Use 'ks' column for key stage filtering, 'subject' for others
        if (subjectFilter.startsWith('KS')) {
          query = query.eq('ks', subjectFilter);
        } else {
          query = query.eq('subject', subjectFilter);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingCurriculum || loadingFiction || loadingAll;

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
      navigate(`/novalearning/reading/${book.id}`);
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

  const renderBookCard = (book: any) => {
    const status = getBookStatus(book.id);
    
    return (
      <Card key={book.id} className="group hover:shadow-lg transition-shadow flex-shrink-0 w-64">
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
  };

  const hasSearchResults = searchQuery || ageFilter !== 'all' || subjectFilter !== 'all';

  return (
    <div className="space-y-8">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
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

      {/* Search Results */}
      {hasSearchResults && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {allBooks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters to find more books.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allBooks.map(renderBookCard)}
            </div>
          )}
        </div>
      )}

      {/* Curriculum Books Rail */}
      {!hasSearchResults && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📚 Curriculum Books
          </h2>
          {curriculumBooks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No curriculum books available for {educationProfile?.key_stage || 'this key stage'} yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {curriculumBooks.map(renderBookCard)}
            </div>
          )}
        </div>
      )}

      {/* Fiction Books Rail */}
      {!hasSearchResults && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🌟 Fiction Stories
          </h2>
          {fictionBooks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No fiction books available for {child?.name || 'this child'}'s age yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {fictionBooks.map(renderBookCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}