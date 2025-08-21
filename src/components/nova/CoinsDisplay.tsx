import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CoinsDisplayProps {
  childId: string;
}

export function CoinsDisplay({ childId }: CoinsDisplayProps) {
  // Fetch total coins for this child from wallets table
  const { data: totalCoins = 0 } = useQuery({
    queryKey: ['child-coins', childId],
    queryFn: async () => {
      if (!childId) return 0;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('coins')
        .eq('child_id', childId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching coins:', error);
        return 0;
      }
      
      return data?.coins || 0;
    },
    enabled: !!childId,
    refetchInterval: 5000, // Refetch every 5 seconds to show new coins
  });

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Coins</span>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalCoins}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}