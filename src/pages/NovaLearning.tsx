
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Target, Star, Play, Clock, Award, Gamepad2, Palette, Monitor, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNovaSignals } from '@/hooks/useNovaSignals';
import DailyChallengesBanner from '@/components/DailyChallengesBanner';
import ChildEducationTabs from '@/components/education/ChildEducationTabs';

export default function NovaLearning() {
  const { user } = useAuth();
  const { isListening, currentBookId } = useNovaSignals(user?.id || '');

  // Load children for the authenticated user
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Load featured books
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['featured-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('ingested', true)
        .limit(6)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Load reading statistics
  const { data: stats } = useQuery({
    queryKey: ['reading-stats', user?.id],
    queryFn: async () => {
      if (!user || !children?.length) return null;
      
      const childIds = children.map(c => c.id);
      
      const { data: sessions, error } = await supabase
        .from('child_reading_sessions')
        .select('*')
        .in('child_id', childIds);
      
      if (error) throw error;
      
      const totalMinutes = sessions?.reduce((acc, session) => acc + (session.total_seconds / 60), 0) || 0;
      const booksRead = new Set(sessions?.map(s => s.book_id) || []).size;
      
      return {
        totalMinutes: Math.round(totalMinutes),
        booksRead,
        sessionsCount: sessions?.length || 0
      };
    },
    enabled: !!user && !!children?.length,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access Nova Learning</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Nova Learning</h1>
          {isListening && (
            <Badge variant="default" className="animate-pulse">
              AI Listening
            </Badge>
          )}
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform reading time into an intelligent learning adventure with AI-powered coaching and real-time insights.
        </p>
      </div>

      {/* Daily Challenges Banner */}
      <DailyChallengesBanner />

      {/* Main Content Tabs */}
      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="education" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="education" className="mt-6">
          {children && children.length > 0 ? (
            <div className="space-y-6">
              {children.map((child) => (
                <Card key={child.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {child.avatar_url && (
                        <img 
                          src={child.avatar_url} 
                          alt={`${child.name}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-semibold">{child.name}</h2>
                        <div className="text-sm text-muted-foreground">
                          {child.age && <span>Age {child.age}</span>}
                        </div>
                      </div>
                    </div>
                    <ChildEducationTabs childId={child.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No children profiles found. Add a child to get started with Nova Learning.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Creative activities coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Educational games coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Progress tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold">{stats.totalMinutes}</div>
                    <div className="text-muted-foreground">Minutes Read</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold">{stats.booksRead}</div>
                    <div className="text-muted-foreground">Books Explored</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold">{stats.sessionsCount}</div>
                    <div className="text-muted-foreground">Reading Sessions</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Children Overview */}
            {children && children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Children
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child) => (
                      <div key={child.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          {child.avatar_url && (
                            <img 
                              src={child.avatar_url} 
                              alt={child.name} 
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-semibold">{child.name}</div>
                            {child.age && (
                              <div className="text-sm text-muted-foreground">Age {child.age}</div>
                            )}
                          </div>
                        </div>
                        {currentBookId && isListening && (
                          <Badge variant="outline" className="text-xs">
                            Currently Reading
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Featured Books */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Featured Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                {booksLoading ? (
                  <div className="text-center py-8">Loading books...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books?.map((book) => (
                      <div key={book.id} className="border rounded-lg p-4 space-y-3">
                        {book.cover_url && (
                          <img 
                            src={book.cover_url} 
                            alt={book.title}
                            className="w-full h-48 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                          {book.author && (
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {book.level_tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            // Navigate to reader - would need proper routing implementation
                            window.location.href = `/nova/reader/${book.id}?child=${children?.[0]?.id}`;
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Reading
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <Target className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">AI Reading Coach</h3>
                  <p className="text-muted-foreground">
                    Real-time guidance and support tailored to your child's reading level and interests.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <BookOpen className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Smart Text-to-Speech</h3>
                  <p className="text-muted-foreground">
                    Multi-voice narration with word highlighting and phonetic assistance for difficult words.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <Award className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Detailed insights into reading habits, comprehension, and skill development over time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
