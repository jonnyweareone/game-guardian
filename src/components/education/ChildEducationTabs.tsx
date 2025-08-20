import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookRenderer } from "@/components/nova/BookRenderer";
import { NovaShelf } from "@/components/nova/NovaShelf";
import { TTSDemo } from "@/components/nova/TTSDemo";
import GameActivityGrid from "@/components/education/GameActivityGrid";
import { BookOpen, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChildEducationTabsProps {
  childId: string;
}

export default function ChildEducationTabs({ childId }: ChildEducationTabsProps) {
  const [selectedBook, setSelectedBook] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState(() => {
    const saved = localStorage.getItem(`edu-tab-${childId}`);
    return saved || 'books';
  });
  
  const { toast } = useToast();

  // Load child's reading progress
  const { data: readingProgress } = useQuery({
    queryKey: ['child-reading-progress', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('child_reading_sessions')
        .select('book_id, current_locator, total_seconds')
        .eq('child_id', childId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(`edu-tab-${childId}`, value);
  };

  const handleNovaLearning = async () => {
    const novaTab = window.open('', '_blank');
    
    try {
      const { data, error } = await supabase.functions.invoke('nova-mint-child-token', {
        body: { child_id: childId }
      });

      if (error) throw error;

      if (data?.nova_url && novaTab) {
        novaTab.location.href = data.nova_url;
        toast({
          title: "Nova Learning Opened",
          description: "Direct access to Nova Learning is now available.",
        });
      } else if (!novaTab) {
        throw new Error('Failed to open new tab');
      }
    } catch (error) {
      console.error('Error opening Nova Learning:', error);
      if (novaTab) novaTab.close();
      
      toast({
        title: "Error",
        description: "Failed to open Nova Learning. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="books">📚 Books</TabsTrigger>
          <TabsTrigger value="shelf">📖 My Shelf</TabsTrigger>
          <TabsTrigger value="voice">🎵 Voice Demo</TabsTrigger>
          <TabsTrigger value="activities">🎨 Activities</TabsTrigger>
          <TabsTrigger value="games">🎮 Games</TabsTrigger>
          <TabsTrigger value="progress">📈 Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          {selectedBook ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBook(null)}
                >
                  ← Back to Library
                </Button>
                <Button
                  variant="default"
                  onClick={handleNovaLearning}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Open Nova Learning
                </Button>
              </div>
              <BookRenderer 
                bookId={selectedBook} 
                childId={childId}
                onProgressUpdate={(page, percent) => {
                  console.log(`Reading progress: page ${page}, ${percent}%`);
                }}
                onCoinsAwarded={(coins) => {
                  toast({
                    title: "Coins Earned!",
                    description: `You've earned ${coins} coins for reading!`,
                  });
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📚 Nova Book Library</h3>
                <Button
                  variant="default"
                  onClick={handleNovaLearning}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Nova Learning
                </Button>
              </div>
              <NovaShelf 
                childId={childId}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="shelf" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">📖 Your Personal Bookshelf</h3>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Books you've started reading will appear here, along with your progress and bookmarks.
                </p>
                {readingProgress && readingProgress.length > 0 ? (
                  <div className="space-y-2">
                    {readingProgress.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span>Book {session.book_id.slice(0, 8)}...</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(session.total_seconds / 60)} min read
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No books in progress yet. Start reading from the Books tab!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">🎵 Voice & Speech Demo</h3>
            <TTSDemo />
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">🎨 Learning Activities</h3>
            <GameActivityGrid filter="activities" childId={childId} />
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">🎮 Educational Games</h3>
            <GameActivityGrid filter="games" childId={childId} />
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">📈 Learning Progress</h3>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Track your reading progress, completed challenges, and earned rewards here.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Books Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Challenges Done</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">XP Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}