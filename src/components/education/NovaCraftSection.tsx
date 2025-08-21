import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Trophy, Zap } from 'lucide-react';

interface NovaCraftSectionProps {
  childId?: string;
}

export default function NovaCraftSection({ childId }: NovaCraftSectionProps) {
  const handleLaunchNovaCraft = async () => {
    let url = '/play/novacraft-pyramid';
    
    // Mint child token if available
    if (childId) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('nova-mint-child-token', {
          body: { child_id: childId }
        });
        
        if (!error && data?.token) {
          url += `?token=${data.token}`;
        }
      } catch (error) {
        console.error('Error minting child token:', error);
      }
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">⚡ NovaCraft Adventures</h2>
        <Badge variant="secondary">3D Parkour</Badge>
      </div>
      
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          {/* Hero Background */}
          <div className="h-48 bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-pyramid-pattern"></div>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                New!
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold mb-1">🏛️ Pyramid Parkour</h3>
              <p className="text-white/80">Navigate ancient pyramids and solve KS2 quizzes</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Explore a mysterious ancient pyramid filled with parkour challenges, quiz gates, 
              and hidden treasures. Jump across platforms, avoid lava, and unlock doors by 
              answering educational questions.
            </p>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Timed Challenges</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>KS2 Quiz Gates</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-red-500" />
                <span>3D Parkour Action</span>
              </div>
            </div>
            
            {/* XP Rewards */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                ⭐ Earn XP by:
              </h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Reach the apex: <strong>30 XP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Answer quizzes: <strong>+5 XP each</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Speed bonus: <strong>+10 XP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Perfect run (no falls): <strong>+15 XP</strong></span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleLaunchNovaCraft}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                Start Pyramid Parkour
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2">
              💡 <strong>Game Tip:</strong> Look for emerald checkpoints to save your progress. 
              Answer quiz questions correctly to unlock stone doors blocking your path.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}