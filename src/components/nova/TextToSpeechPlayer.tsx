import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TextToSpeechPlayerProps {
  bookId: string;
  bookTitle: string;
  bookContent?: string;
  onProgressUpdate?: (progress: number) => void;
}

export const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({
  bookId,
  bookTitle,
  bookContent,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate speech using Web Speech API (free but limited)
  const generateSpeechWeb = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings for children
      utterance.rate = 0.8; // Slower reading speed
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = volume;
      
      // Try to find a suitable voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Woman'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentPosition(0);
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsPlaying(false);
        setIsLoading(false);
        toast({
          title: "Speech Error",
          description: "Unable to read the text aloud. Please try again.",
          variant: "destructive",
        });
      };

      // Track progress (approximate)
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const progress = (event.charIndex / text.length) * 100;
          setCurrentPosition(progress);
          onProgressUpdate?.(progress);
        }
      };

      speechRef.current = utterance;
      return utterance;
    }
    return null;
  };

  // Generate speech using OpenAI TTS (higher quality but requires API call)
  const generateSpeechOpenAI = async (text: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text.substring(0, 4000), // Limit text length
          voice: 'alloy' // Child-friendly voice
        }
      });

      if (error) throw error;

      // Create audio from base64
      const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      
      audio.volume = isMuted ? 0 : volume;
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };

      audio.ontimeupdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setCurrentPosition(progress);
        onProgressUpdate?.(progress);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPosition(0);
      };

      audio.onerror = () => {
        setIsLoading(false);
        toast({
          title: "Audio Error",
          description: "Failed to load audio. Using browser speech instead.",
          variant: "destructive",
        });
        // Fallback to web speech
        const webSpeech = generateSpeechWeb(text);
        if (webSpeech) {
          speechSynthesis.speak(webSpeech);
        }
      };

      audioRef.current = audio;
      return audio;
      
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      setIsLoading(false);
      
      // Fallback to web speech
      const webSpeech = generateSpeechWeb(text);
      if (webSpeech) {
        speechSynthesis.speak(webSpeech);
      }
    }
  };

  const handlePlay = async () => {
    if (!bookContent) {
      toast({
        title: "No Content",
        description: "No text available to read aloud.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // First try OpenAI TTS, fallback to Web Speech API
    const audio = await generateSpeechOpenAI(bookContent);
    
    if (audio) {
      audio.play().catch(error => {
        console.error('Audio play error:', error);
        // Fallback to web speech
        const webSpeech = generateSpeechWeb(bookContent);
        if (webSpeech) {
          speechSynthesis.speak(webSpeech);
        }
      });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (speechRef.current) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentPosition(0);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Read to Me</span>
          </div>
          <div className="text-xs text-blue-700">
            {bookTitle}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentPosition}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-700">
            <span>{Math.round(currentPosition)}%</span>
            <span>{duration ? `${Math.round(duration)}s` : '--:--'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVolumeChange(Math.max(0, volume - 0.1))}
            disabled={isLoading}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVolumeChange(Math.min(1, volume + 0.1))}
            disabled={isLoading}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="ml-2"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <VolumeX className="h-3 w-3 text-blue-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <Volume2 className="h-3 w-3 text-blue-600" />
        </div>
      </div>
    </Card>
  );
};