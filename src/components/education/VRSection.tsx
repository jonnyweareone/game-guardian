import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Headphones, Smartphone, Zap } from 'lucide-react';

interface VRSectionProps {
  childId?: string;
}

export default function VRSection({ childId }: VRSectionProps) {
  const handleLaunchSpaceTrek = async () => {
    let url = '/play/spacetrek';
    
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
        <h2 className="text-2xl font-bold">🥽 Virtual Reality</h2>
        <Badge variant="secondary">WebVR</Badge>
      </div>
      
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          {/* Hero Background */}
          <div className="h-48 bg-gradient-to-br from-blue-900 via-purple-900 to-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-stars-pattern"></div>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Active
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold mb-1">🚀 SpaceTrek VR</h3>
              <p className="text-white/80">Explore the cosmos in virtual reality</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Journey through space, learn about planets and stars, and complete interactive quizzes 
              in an immersive virtual reality environment.
            </p>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span>Mobile VR Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Headphones className="h-4 w-4 text-green-500" />
                <span>3D Spatial Audio</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Interactive Quizzes</span>
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
                  <span>Complete quiz: <strong>25 XP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>≥95% accuracy: <strong>+10 bonus</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Enter VR mode: <strong>+5 bonus</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Daily challenges: <strong>up to +15</strong></span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleLaunchSpaceTrek}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                Launch SpaceTrek VR
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Desktop
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2">
              💡 <strong>VR Tip:</strong> Use headphones for immersive spatial audio. 
              On mobile, use a Cardboard-compatible headset for the best experience.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}