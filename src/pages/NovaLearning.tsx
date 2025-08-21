
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Target, Star, Play, Clock, Award, Gamepad2, Palette, Monitor, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNovaSignals } from '@/hooks/useNovaSignals';
import DailyChallengesBanner from '@/components/DailyChallengesBanner';
import ChildEducationTabs from '@/components/education/ChildEducationTabs';
import ChildSwitcher from '@/components/ChildSwitcher';
import { getWallet } from '@/lib/rewardsApi';
import { yearAndKeyStageFromDOB } from '@/lib/ukSchoolYear';

export default function NovaLearning() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Selected child and wallet
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0);
  
  const { isListening, currentBookId } = useNovaSignals(selectedChildId || '');

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

  // Helper function to resolve child ID from token by querying the database
  const resolveChildFromToken = async (token: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('nova_child_tokens')
        .select('child_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (error) {
        console.error('Error resolving token:', error);
        return null;
      }
      
      return data?.child_id || null;
    } catch (e) {
      console.error('Error resolving child from token:', e);
      return null;
    }
  };

  // Initialize selected child from token, URL params, session storage, or default to first child
  useEffect(() => {
    if (!children?.length) return;
    
    const initializeChild = async () => {
      // Check for child ID from token (highest priority)
      const token = searchParams.get('token');
      let childIdFromToken = null;
      if (token) {
        childIdFromToken = await resolveChildFromToken(token);
      }
      
      // Check URL parameter for child selection
      const childParam = searchParams.get('child');
      
      // Check session storage for persisted selection (both key formats for compatibility)
      const storedChildId = sessionStorage.getItem('nova-active-child') || sessionStorage.getItem('nova_active_child');
      
      let targetChildId: string | null = null;
      
      if (childIdFromToken && children.find(c => c.id === childIdFromToken)) {
        // Token has highest priority
        targetChildId = childIdFromToken;
      } else if (childParam && children.find(c => c.id === childParam)) {
        targetChildId = childParam;
      } else if (storedChildId && children.find(c => c.id === storedChildId)) {
        targetChildId = storedChildId;
      } else {
        // Default to first child only if no other selection method worked
        targetChildId = children[0].id;
      }
      
      // Update sessionStorage with both key formats for compatibility
      if (targetChildId) {
        sessionStorage.setItem('nova-active-child', targetChildId);
        sessionStorage.setItem('nova_active_child', targetChildId);
      }
      
      setSelectedChildId(targetChildId);
    };
    
    initializeChild();
  }, [children, searchParams]);

  useEffect(() => {
    const loadWallet = async () => {
      if (selectedChildId) {
        try {
          const w = await getWallet(selectedChildId);
          setCoins(w?.coins ?? 0);
        } catch (e) {
          // silent
        }
      }
    };
    loadWallet();
  }, [selectedChildId]);

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

      {/* Main Content */}
      {childrenLoading ? (
        <Card>
          <CardContent className="p-8 text-center">Loading…</CardContent>
        </Card>
      ) : !children || children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No children profiles found. Add a child to get started with Nova Learning.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Child Switcher (if multiple children) */}
          {children.length > 1 && (
            <ChildSwitcher
              children={children}
              selectedChildId={selectedChildId}
              onChildSelect={(childId) => {
                setSelectedChildId(childId);
                if (childId) {
                  // Update both sessionStorage keys for compatibility
                  sessionStorage.setItem('nova-active-child', childId);
                  sessionStorage.setItem('nova_active_child', childId);
                }
              }}
              alertCounts={{}}
            />
          )}
          
          {(() => {
            const child = children.find((c:any) => c.id === selectedChildId) || children[0];
            const computed = yearAndKeyStageFromDOB(child?.dob);
            return (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {child?.avatar_url && (
                        <img src={child.avatar_url} alt={`${child.name}'s avatar`} className="w-12 h-12 rounded-full object-cover" />
                      )}
                      <div>
                        <h2 className="text-xl font-semibold">{child?.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Coins: {coins}</span>
                          {computed?.yearGroup && <span>Year: {computed.yearGroup}</span>}
                          {computed?.keyStage && <span>Key Stage: {computed.keyStage}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Tabs from child education (Books, Shelf, Activities, Games, Progress) */}
          {selectedChildId && <ChildEducationTabs childId={selectedChildId} />}
        </div>
      )}
    </div>
  );
}