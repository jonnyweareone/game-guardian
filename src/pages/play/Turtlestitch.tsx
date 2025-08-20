import React from 'react';
import { useSearchParams } from 'react-router-dom';
import GameHost from '@/components/games/GameHost';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Turtlestitch() {
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
            <h1 className="text-3xl font-bold">🐢 Turtlestitch</h1>
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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Nova Learning
          </Button>
          <h1 className="text-3xl font-bold">🐢 Turtlestitch</h1>
        </div>

        <GameHost
          gameName="Turtlestitch"
          launchUrl="/vendor/turtlestitch/index.html"
          shimSrc="/shims/turtlestitch.js"
          bearerToken={token}
        />
      </div>
    </div>
  );
}