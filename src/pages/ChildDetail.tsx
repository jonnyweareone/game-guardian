import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Calendar, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  avatar_url: string | null;
  age: number | null;
  dob: string | null;
  created_at: string;
}

export default function ChildDetail() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;

    const loadChild = async () => {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('id, name, avatar_url, age, dob, created_at')
          .eq('id', childId)
          .single();

        if (error) throw error;
        setChild(data);
      } catch (error) {
        console.error('Failed to load child:', error);
        toast({
          title: 'Error',
          description: 'Failed to load child profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadChild();
  }, [childId, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading child profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center space-y-4">
            <User className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Child profile not found</h3>
              <p className="text-muted-foreground">
                The requested child profile could not be found
              </p>
            </div>
            <Button onClick={() => navigate('/children')}>
              Back to Children
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Child Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={child.avatar_url || "/avatars/missing.png"} />
              <AvatarFallback className="text-xl">{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{child.name}</CardTitle>
              <p className="text-muted-foreground">
                {child.age ? `${child.age} years old` : 'Age not specified'}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Date of Birth:</strong>{' '}
                {child.dob ? new Date(child.dob).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Profile Created:</strong>{' '}
                {new Date(child.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate(`/children/${child.id}/apps`)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Manage Apps
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/monitoring', { state: { selectedChild: child.id } })}
                className="flex items-center gap-2"
              >
                View Monitoring
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}