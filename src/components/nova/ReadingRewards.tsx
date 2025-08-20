import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Star, BookOpen, Trophy, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ReadingRewardsProps {
  childId: string;
  sessionId?: string;
  bookId?: string;
  onProgressUpdate?: (progress: { pages: number; coins: number }) => void;
}

export const ReadingRewards: React.FC<ReadingRewardsProps> = ({
  childId,
  sessionId,
  bookId,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Fetch child's wallet/coins
  const { data: wallet } = useQuery({
    queryKey: ['child-wallet', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!childId,
  });

  // Fetch current reading progress
  const { data: readingProgress } = useQuery({
    queryKey: ['reading-progress', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('nova_reading_progress')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reading progress:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Update reading progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ pages, timeMinutes }: { pages: number; timeMinutes: number }) => {
      if (!sessionId || !bookId) return;

      const { data, error } = await supabase
        .from('nova_reading_progress')
        .upsert({
          session_id: sessionId,
          child_id: childId,
          book_id: bookId,
          pages_read: pages,
          reading_time_minutes: timeMinutes,
          words_read: Math.floor(pages * 250), // Estimate ~250 words per page
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', sessionId] });
    },
  });

  // Award coins mutation
  const awardCoinsMutation = useMutation({
    mutationFn: async (coins: number) => {
      const { data, error } = await supabase.rpc('award_coins', {
        p_child: childId,
        p_delta: coins
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, coins) => {
      queryClient.invalidateQueries({ queryKey: ['child-wallet', childId] });
      toast({
        title: "Coins Earned! 🎉",
        description: `You earned ${coins} coins for reading!`,
      });
    },
  });

  // Calculate rewards based on reading progress
  const calculateRewards = (pages: number) => {
    const rewards = [];
    
    // 1 coin per page read
    const baseCoins = pages;
    if (baseCoins > 0) {
      rewards.push({ type: 'coins', amount: baseCoins, reason: 'Pages read' });
    }

    // Bonus for milestones
    if (pages >= 5 && pages < 10) {
      rewards.push({ type: 'bonus', amount: 5, reason: '5 pages milestone!' });
    } else if (pages >= 10 && pages < 20) {
      rewards.push({ type: 'bonus', amount: 15, reason: '10 pages milestone!' });
    } else if (pages >= 20) {
      rewards.push({ type: 'bonus', amount: 30, reason: '20+ pages milestone!' });
    }

    return rewards;
  };

  // Simulate page reading progress (in real app, this would come from the reader)
  const simulateReading = () => {
    const currentPages = readingProgress?.pages_read || 0;
    const newPages = currentPages + 1;
    const timeSpent = Math.floor((readingProgress?.reading_time_minutes || 0) + 2);

    updateProgressMutation.mutate({ pages: newPages, timeMinutes: timeSpent });

    // Award coins for the new page
    awardCoinsMutation.mutate(1);

    // Check for milestone bonuses
    const rewards = calculateRewards(newPages);
    const bonusReward = rewards.find(r => r.type === 'bonus');
    if (bonusReward && newPages % 5 === 0) { // Only award bonus at exact milestones
      setTimeout(() => {
        awardCoinsMutation.mutate(bonusReward.amount);
      }, 1000);
    }

    onProgressUpdate?.({ pages: newPages, coins: wallet?.coins || 0 });
  };

  const pages = readingProgress?.pages_read || 0;
  const coins = wallet?.coins || 0;
  const rewards = calculateRewards(pages);
  const nextMilestone = pages < 5 ? 5 : pages < 10 ? 10 : pages < 20 ? 20 : pages + 10;
  const progressToNextMilestone = ((pages % 5) / 5) * 100;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Trophy className="h-5 w-5" />
          Reading Rewards
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{pages}</span>
            </div>
            <div className="text-xs text-gray-600">Pages Read</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{coins}</span>
            </div>
            <div className="text-xs text-gray-600">Total Coins</div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-orange-800">
              Next Milestone: {nextMilestone} pages
            </span>
            <Badge variant="outline" className="text-xs">
              {nextMilestone - pages} to go
            </Badge>
          </div>
          <Progress value={progressToNextMilestone} className="h-2" />
        </div>

        {/* Available Rewards */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-orange-800 flex items-center gap-1">
            <Gift className="h-4 w-4" />
            Rewards Earned
          </div>
          
          {rewards.length > 0 ? (
            <div className="space-y-1">
              {rewards.map((reward, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200"
                >
                  <div className="flex items-center gap-2">
                    {reward.type === 'coins' ? (
                      <Coins className="h-3 w-3 text-yellow-600" />
                    ) : (
                      <Star className="h-3 w-3 text-orange-600" />
                    )}
                    <span className="text-xs text-gray-700">{reward.reason}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{reward.amount} coins
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-2">
              Start reading to earn rewards!
            </div>
          )}
        </div>

        {/* Demo Button */}
        <Button 
          onClick={simulateReading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="sm"
          disabled={updateProgressMutation.isPending}
        >
          {updateProgressMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Simulate Page Read
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};