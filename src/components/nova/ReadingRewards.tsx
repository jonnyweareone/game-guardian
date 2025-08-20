import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { listRewards, getWallet, requestReward, Reward } from '@/lib/rewardsApi';

interface ReadingRewardsProps {
  childId: string;
  sessionId?: string;
  bookId?: string;
  onProgressUpdate?: (progress: { pages: number; coins: number }) => void;
}

export const ReadingRewards: React.FC<ReadingRewardsProps> = ({ childId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery({
    queryKey: ['wallet', childId],
    queryFn: () => getWallet(childId),
    enabled: !!childId,
  });

  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: () => listRewards(),
  });

  const requestMutation = useMutation({
    mutationFn: (rewardId: string) => requestReward(childId, rewardId),
    onSuccess: () => {
      toast({ title: 'Requested', description: 'Reward request submitted.' });
      queryClient.invalidateQueries({ queryKey: ['wallet', childId] });
    },
    onError: (e: any) => {
      toast({ title: 'Request failed', description: e.message, variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="h-4 w-4" />
              <span className="text-2xl font-bold">{wallet?.coins ?? 0}</span>
            </div>
            <div className="text-xs text-muted-foreground">Coins</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-1">
            <Gift className="h-4 w-4" />
            Available Rewards
          </div>

          {rewards && rewards.length > 0 ? (
            <div className="space-y-2">
              {rewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{r.name}</span>
                    <Badge variant="secondary">{r.coin_cost} coins</Badge>
                  </div>
                  <Button size="sm" onClick={() => requestMutation.mutate(r.id)}>
                    Request
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-2">
              No rewards yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};