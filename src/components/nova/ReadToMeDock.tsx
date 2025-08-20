
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ReadToMeDockProps {
  bookTitle?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  progress?: number;
  duration?: number;
  onSeek?: (position: number) => void;
}

export function ReadToMeDock({
  bookTitle = "Reading...",
  isPlaying = false,
  onPlay,
  onPause,
  onStop,
  progress = 0,
  duration = 100,
  onSeek
}: ReadToMeDockProps) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-background/95 backdrop-blur-sm border shadow-lg">
      <div className="flex items-center gap-4 p-4">
        {/* Play Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="h-8 w-8 p-0"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Book Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{bookTitle}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(progress)} / {formatTime(duration)}
          </p>
        </div>

        {/* Progress Slider */}
        <div className="flex-1 max-w-xs">
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            onValueChange={([value]) => onSeek?.(value)}
            className="w-full"
          />
        </div>

        {/* Volume Controls */}
        <div className="relative flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVolumeToggle}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="h-8 w-8 p-0"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          {showVolumeSlider && (
            <div 
              className="absolute bottom-full mb-2 right-0 bg-background border rounded-lg p-3 shadow-lg"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="w-24">
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setVolume(value)}
                  orientation="vertical"
                  className="h-20"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ReadToMeDock;
