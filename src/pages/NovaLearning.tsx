import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Users, Clock, Sparkles, Gamepad2, Headset, BookMarked, Volume2 } from 'lucide-react';
import { NovaLibrary } from '@/components/nova/NovaLibrary';
import { NovaShelf } from '@/components/nova/NovaShelf';
import { NovaTimeline } from '@/components/nova/NovaTimeline';
import { TTSDemo } from '@/components/nova/TTSDemo';
import { useNovaSignals } from '@/hooks/useNovaSignals';

export default function NovaLearning() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [children, setChildren] = useState<any[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [childData, setChildData] = useState<any>(null);

  // Real-time listening signals
  const { isListening, currentBook } = useNovaSignals(activeChildId);

  // Handle child token authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Verify token and get child info
      supabase.functions.invoke('nova-verify-child', {
        body: { token }
      }).then(({ data, error }) => {
        if (error) {
          console.error('Token verification failed:', error);
          // Fall back to regular authentication
          const savedChild = sessionStorage.getItem('nova_active_child');
          if (savedChild) {
            setActiveChildId(savedChild);
            setIsValidated(true);
          }
          return;
        }
        
        if (data?.child) {
          setActiveChildId(data.child.id);
          setChildData(data.child);
          setIsValidated(true);
          // Store in session for future use
          sessionStorage.setItem('nova_active_child', data.child.id);
          // Clean URL
          window.history.replaceState({}, '', '/novalearning');
        }
      });
    } else {
      // Load from session storage or show child picker
      const savedChild = sessionStorage.getItem('nova_active_child');
      if (savedChild) {
        setActiveChildId(savedChild);
        setIsValidated(true);
      }
    }
  }, [user]);

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

  // If we have no child data and no user, we need authentication
  if (!user && !isValidated && !activeChildId) {
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
            <p className="text-muted-foreground">Please use the Nova Learning link provided by your parent.</p>
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
        {/* Child Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={childData?.avatar_url} />
              <AvatarFallback className="text-xl">
                {childData?.name ? childData.name.charAt(0).toUpperCase() : 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Hello, {childData?.name || 'Student'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Ready to learn something amazing today?
              </p>
            </div>
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Books
            </TabsTrigger>
            <TabsTrigger value="shelf" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Shelf
            </TabsTrigger>
            <TabsTrigger value="tts-demo" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Demo
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="vr" className="flex items-center gap-2">
              <Headset className="h-4 w-4" />
              VR
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-6">
            <NovaLibrary childId={activeChildId} />
          </TabsContent>

          <TabsContent value="shelf" className="mt-6">
            <NovaShelf childId={activeChildId} />
          </TabsContent>

          <TabsContent value="tts-demo" className="mt-6">
            <TTSDemo />
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Learning Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookMarked className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
                  <p className="text-muted-foreground">
                    Interactive quizzes, fact-finding missions, and curriculum-based activities will be available here soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Educational Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Games Coming Soon!</h3>
                  <p className="text-muted-foreground">
                    Fun, curriculum-aligned games that make learning exciting will be available here soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vr" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headset className="h-5 w-5" />
                  VR Experiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Headset className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">VR Adventures Coming Soon!</h3>
                  <p className="text-muted-foreground">
                    Immersive Virtual Reality experiences that bring learning to life will be available here soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <NovaTimeline childId={activeChildId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}