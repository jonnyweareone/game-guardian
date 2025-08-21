import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy } from 'lucide-react';
import { edu } from '@/lib/educationApi';

interface ReadingProgressProps {
  childId: string;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({ childId }) => {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['education-timeline', childId],
    queryFn: () => edu.timeline(childId),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bookshelf = timelineData?.bookshelf || [];
  const sessions = timelineData?.sessions || [];

  // Calculate stats
  const totalBooks = bookshelf.length;
  const finishedBooks = bookshelf.filter((book: any) => book.status === 'finished').length;
  const currentlyReading = bookshelf.filter((book: any) => book.status === 'reading').length;
  
  const totalReadingTime = sessions.reduce((total: number, session: any) => total + (session.total_seconds || 0), 0);
  const totalMinutes = Math.round(totalReadingTime / 60);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalBooks}</div>
              <div className="text-sm text-muted-foreground">Books Added</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{finishedBooks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{currentlyReading}</div>
              <div className="text-sm text-muted-foreground">Reading</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalMinutes}</div>
              <div className="text-sm text-muted-foreground">Minutes Read</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookshelf */}
      <Card>
        <CardHeader>
          <CardTitle>Bookshelf</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {bookshelf.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No books in bookshelf yet. Start reading to add books here.
            </p>
          ) : (
            <div className="space-y-4">
              {bookshelf.map((item: any) => (
                <div key={item.book_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.books?.title || 'Unknown Book'}</h4>
                    <Badge variant={item.status === 'finished' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  {item.books?.author && (
                    <p className="text-sm text-muted-foreground mb-2">by {item.books.author}</p>
                  )}
                  <Progress value={item.progress || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(item.progress || 0)}% complete
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};