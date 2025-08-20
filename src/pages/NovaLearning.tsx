import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, Clock, Sparkles } from 'lucide-react';
import { NovaLibrary } from '@/components/nova/NovaLibrary';
import { NovaShelf } from '@/components/nova/NovaShelf';
import { NovaTimeline } from '@/components/nova/NovaTimeline';
import { useNovaSignals } from '@/hooks/useNovaSignals';

export default function NovaLearning() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [children, setChildren] = useState<any[]>([]);
  const [isValidated, setIsValidated] = useState(false);

  // Real-time listening signals
  const { isListening, currentBook } = useNovaSignals(activeChildId);

  // Handle child token authentication
  useEffect(() => {
    const childId = searchParams.get('child_id');
    const childToken = searchParams.get('ct');

    if (childId && childToken) {
      // TODO: Verify child token via edge function
      // For now, assume valid if user is authenticated
      if (user) {
        setActiveChildId(childId);
        setIsValidated(true);
        sessionStorage.setItem('nova_active_child', childId);
      }
    } else {
      // Load from session storage or show child picker
      const savedChild = sessionStorage.getItem('nova_active_child');
      if (savedChild) {
        setActiveChildId(savedChild);
        setIsValidated(true);
      }
    }
  }, [searchParams, user]);

  // Load children for picker
  useEffect(() => {
    if (user && !isValidated) {
      supabase
        .from('children')
        .select('id, name, avatar_url')
        .eq('parent_id', user.id)
        .then(({ data }) => {
          if (data) {
            setChildren(data);
            if (data.length === 1 && !activeChildId) {
              setActiveChildId(data[0].id);
              setIsValidated(true);
            }
          }
        });
    }
  }, [user, isValidated, activeChildId]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Nova Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please sign in to access Nova Learning.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeChildId && children.length > 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Child
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => {
              setActiveChildId(value);
              setIsValidated(true);
              sessionStorage.setItem('nova_active_child', value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeChildId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header with listening indicator */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Nova Learning
            </h1>
            <p className="text-muted-foreground">
              Discover, read, and learn with AI-powered guidance
            </p>
          </div>
          
          {isListening && currentBook && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Listening — {currentBook.title}
              </span>
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="shelf" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shelf
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-6">
            <NovaLibrary childId={activeChildId} />
          </TabsContent>

          <TabsContent value="shelf" className="mt-6">
            <NovaShelf childId={activeChildId} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <NovaTimeline childId={activeChildId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}