
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, PlayCircle, FileText, Volume2 } from 'lucide-react';

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

  // Load fiction books (is_fiction=true, filtered by child's age)
  const { data: fictionBooks = [], isLoading: loadingFiction } = useQuery({
    queryKey: ['nova-fiction-books', child?.dob, educationProfile?.key_stage],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .eq('is_fiction', true)
        .order('title')
        .limit(10);

      // Filter by key stage if available
      if (educationProfile?.key_stage) {
        const ks = educationProfile.key_stage;
        // Match either books.ks or level_tags array
        query = query.or(`ks.eq.${ks},level_tags.cs.{${ks}}`);
      }

      // Filter by age if child's DOB is available
      if (child?.dob) {
        const age = new Date().getFullYear() - new Date(child.dob).getFullYear();
        query = query.lte('age_min', age).gte('age_max', age);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!child && !!educationProfile,
  });

  // Load curriculum books (is_fiction=false, filtered by key stage)
  const { data: curriculumBooks = [], isLoading: loadingCurriculum } = useQuery({
    queryKey: ['nova-curriculum-books', educationProfile?.key_stage],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .eq('is_fiction', false)
        .order('title')
        .limit(10);

      // Filter by key stage if available
      if (educationProfile?.key_stage) {
        const ks = educationProfile.key_stage;
        // Match either books.ks or level_tags array
        query = query.or(`ks.eq.${ks},level_tags.cs.{${ks}}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!educationProfile,
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
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (ageFilter !== 'all') {
        const age = parseInt(ageFilter);
        query = query.lte('age_min', age).gte('age_max', age);
      }

      if (subjectFilter !== 'all') {
        // Use 'ks' column for key stage filtering, 'category' for others
        if (subjectFilter.startsWith('KS')) {
          query = query.eq('ks', subjectFilter);
        } else {
          query = query.contains('subjects', [subjectFilter]);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingCurriculum || loadingFiction || loadingAll;

  // Load bookshelf data for status display
  const { data: bookshelfData = [] } = useQuery({
    queryKey: ['nova-bookshelf', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('child_bookshelf')
        .select('*')
        .eq('child_id', childId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!childId,
  });

  const getBookStatus = (bookId: string) => {
    const shelf = bookshelfData.find(item => item.book_id === bookId);
    return shelf ? { status: shelf.status, progress: shelf.progress } : null;
  };

  const handleStartReading = async (book: any) => {
    try {
      // Update bookshelf status
      await supabase
        .from('child_bookshelf')
        .upsert({
          child_id: childId,
          book_id: book.id,
          status: 'reading',
          progress: 0,
          started_at: new Date().toISOString(),
        });

      // Set active child in sessionStorage
      sessionStorage.setItem('nova_active_child', childId);
      
      // Navigate to reader with child ID
      navigate(`/novalearning/reading/${book.id}?child=${childId}`);
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
            {book.cover_url ? (
              <img
                src={book.cover_url}
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
            
            {(book.author || book.authors) && (
              <p className="text-xs text-muted-foreground">
                by {book.author || (book.authors && book.authors.join(', '))}
              </p>
            )}

            {/* Age range and format badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {book.age_min && book.age_max && (
                <Badge variant="outline" className="text-xs">
                  Ages {book.age_min}-{book.age_max}
                </Badge>
              )}
              {book.download_epub_url && (
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  EPUB
                </Badge>
              )}
              {book.has_audio && (
                <Badge variant="secondary" className="text-xs">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Audio
                </Badge>
              )}
            </div>

            {/* Progress if reading */}
            {status && status.status === 'reading' && (
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{Math.round(status.progress || 0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{ width: `${status.progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Read button */}
            <Button
              onClick={() => handleStartReading(book)}
              className="w-full mt-3"
              size="sm"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              {status?.status === 'reading' ? 'Continue' : 'Read'}
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
                <SelectItem value="Animals">Animals</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Friendship">Friendship</SelectItem>
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
    </div>
  );
}
