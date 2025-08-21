import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square } from 'lucide-react';
import { formatUKTime } from '@/lib/ukTime';

interface SessionOverlayProps {
  state: 'start' | 'paused' | 'ending';
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onEnd: () => void;
  bookTitle?: string;
  isLoading?: boolean;
}

export const SessionOverlay: React.FC<SessionOverlayProps> = ({
  state,
  onStart,
  onResume,
  onPause,
  onEnd,
  bookTitle,
  isLoading
}) => {
  const currentTime = formatUKTime();

  if (state === 'start') {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Start Reading Session</h2>
              <p className="text-muted-foreground mb-2">
                Ready to begin reading with AI assistance?
              </p>
              {bookTitle && (
                <p className="text-sm font-medium text-primary">"{bookTitle}"</p>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Current time: {currentTime}
              </p>
            </div>
            <Button 
              onClick={onStart} 
              disabled={isLoading}
              size="lg" 
              className="w-full"
            >
              {isLoading ? 'Starting...' : 'Start Reading Session'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'paused') {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
              <Pause className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Session Paused</h2>
              <p className="text-muted-foreground mb-2">
                Your reading session is paused. Resume when ready or end the session.
              </p>
              <p className="text-xs text-muted-foreground">
                Paused at: {currentTime}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={onResume} 
                disabled={isLoading}
                variant="default"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button 
                onClick={onEnd} 
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};