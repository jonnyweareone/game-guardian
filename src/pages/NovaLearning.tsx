
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Target, Star, Play, Clock, Award, Gamepad2, Palette, Monitor, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNovaSignals } from '@/hooks/useNovaSignals';
import DailyChallengesBanner from '@/components/DailyChallengesBanner';
import ChildEducationTabs from '@/components/education/ChildEducationTabs';
import { yearAndKeyStageFromDOB } from '@/lib/ukSchoolYear';

export default function NovaLearning() {
  const [searchParams] = useSearchParams();
  const [childData, setChildData] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const { isListening, currentBookId } = useNovaSignals(childData?.child_id || '');

  // Verify token and get child data
  const { data: tokenResult, isLoading: tokenLoading, error } = useQuery({
    queryKey: ['verify-token', searchParams.get('token')],
    queryFn: async () => {
      const token = searchParams.get('token');
      if (!token) {
        throw new Error('No token provided');
      }

      const { data, error } = await supabase.functions.invoke('nova-verify-child-token', {
        body: { token }
      });

      if (error) throw error;
      if (!data?.token_valid) throw new Error('Invalid token');
      
      return data;
    },
    enabled: !!searchParams.get('token'),
    retry: false
  });

  useEffect(() => {
    if (tokenResult) {
      setChildData(tokenResult);
      setTokenError(null);
      
      // Save token and child_id to sessionStorage for persistence
      const token = searchParams.get('token');
      if (token && tokenResult.child_id) {
        sessionStorage.setItem('nova_token', token);
        sessionStorage.setItem('nova_child_id', tokenResult.child_id);
        console.log('Nova token saved to sessionStorage:', { token: token.slice(0, 20) + '...', child_id: tokenResult.child_id });
      }
    } else if (error) {
      setTokenError(error.message);
      setChildData(null);
    }
  }, [tokenResult, error, searchParams]);

  // Show token error or no token state
  if (!searchParams.get('token')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold mb-4">Token Required</h1>
            <p className="text-muted-foreground">
              Nova Learning requires a valid access token. Please use the provided deep link or QR code from your Guardian AI device.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying access token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError || !childData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-4">Invalid Token</h1>
            <p className="text-muted-foreground">
              {tokenError || 'The provided token is invalid or expired. Please use a valid deep link or QR code from your Guardian AI device.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token-verified child from the validated response
  const child = childData?.child;
  const computed = yearAndKeyStageFromDOB(child?.dob);

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

      {/* Token-verified child banner */}
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
                  {computed?.yearGroup && <span>Year: {computed.yearGroup}</span>}
                  {computed?.keyStage && <span>Key Stage: {computed.keyStage}</span>}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Token Verified
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Child education tabs */}
      <ChildEducationTabs childId={childData?.child_id} />
    </div>
  );
}