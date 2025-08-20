import React from 'react';
import { useSearchParams } from 'react-router-dom';
import GameHost from '@/components/games/GameHost';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Headphones, Smartphone } from 'lucide-react';

export default function SpaceTrek() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">🚀 SpaceTrek VR</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Missing authentication token. Please launch from Nova Learning.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Nova Learning
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🚀 SpaceTrek VR
                <Badge variant="secondary" className="text-sm">
                  WebVR
                </Badge>
              </h1>
              <p className="text-muted-foreground">Explore space and complete educational quizzes</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile VR
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Headphones className="h-3 w-3" />
              Desktop
            </Badge>
          </div>
        </div>

        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Complete quiz: <strong>25 XP</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>≥95% accuracy: <strong>+10 bonus XP</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Enter VR mode: <strong>+5 bonus XP</strong></span>
            </div>
          </div>
        </div>

        <GameHost
          gameName="SpaceTrek"
          launchUrl="/vendor/spacetrek/index.html"
          shimSrc="/shims/spacetrek.js"
          bearerToken={token}
        />
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 <strong>VR Tip:</strong> On mobile, tap the VR goggles icon to enter immersive mode</p>
          <p>🎮 Use a Cardboard headset or similar for the best VR experience</p>
        </div>
      </div>
    </div>
  );
}