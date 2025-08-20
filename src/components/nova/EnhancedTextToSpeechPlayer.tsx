import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Mic, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSampleBookContent } from '@/utils/demoBooksData';

interface EnhancedTextToSpeechPlayerProps {
  bookId: string;
  bookTitle: string;
  bookContent?: string;
  onProgressUpdate?: (progress: number) => void;
  onParagraphHighlight?: (paragraphIndex: number) => void;
  childId?: string;
}

interface AudioSegment {
  audioUrl: string;
  label: string;
  startParaIdx: number;
  duration?: number;
}

interface AudioQueue {
  segments: AudioSegment[];
  currentIndex: number;
  preloadedAudio: { [index: number]: HTMLAudioElement };
}

export const EnhancedTextToSpeechPlayer: React.FC<EnhancedTextToSpeechPlayerProps> = ({
  bookId,
  bookTitle,
  bookContent,
  onProgressUpdate,
  onParagraphHighlight,
  childId
}) => {
  const { toast } = useToast();
  
  // State management
  const [isMultiVoice, setIsMultiVoice] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState('storybook');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio queue management
  const [audioQueue, setAudioQueue] = useState<AudioQueue>({
    segments: [],
    currentIndex: 0,
    preloadedAudio: {}
  });
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Voice presets
  const singleVoicePresets = {
    storybook: { name: 'Storybook', description: 'Warm narrator voice' },
    playful: { name: 'Playful', description: 'Energetic, child-like' },
    calm: { name: 'Calm', description: 'Gentle, soothing' }
  };

  // Load user preferences from localStorage (fallback until types update)
  useEffect(() => {
    if (childId) {
      const savedPrefs = localStorage.getItem(`tts_prefs_${childId}`);
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          setIsMultiVoice(prefs.multiVoice || false);
          setVoiceStyle(prefs.voiceStyle || 'storybook');
        } catch (error) {
          console.log('Failed to load preferences');
        }
      }
    }
  }, [childId]);

  // Save user preferences to localStorage
  const savePreferences = () => {
    if (!childId) return;
    
    try {
      const prefs = {
        multiVoice: isMultiVoice,
        voiceStyle: voiceStyle,
        updated: new Date().toISOString()
      };
      localStorage.setItem(`tts_prefs_${childId}`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // Preload next audio segments
  const toBlobUrl = (dataUri: string) => {
    try {
      if (!dataUri.startsWith('data:')) return dataUri;
      const [header, base64] = dataUri.split(',');
      const mimeMatch = header.match(/data:(.*);base64/);
      const mime = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    } catch {
      return dataUri;
    }
  };

  const preloadAudio = (segments: AudioSegment[], currentIndex: number) => {
    const preloadedAudio: { [index: number]: HTMLAudioElement } = {};
    
    // Preload current and next 2 segments
    for (let i = currentIndex; i < Math.min(currentIndex + 3, segments.length); i++) {
      if (!audioQueue.preloadedAudio[i]) {
        let src = segments[i].audioUrl;
        if (src.startsWith('data:audio')) {
          src = toBlobUrl(src);
        }
        const audio = new Audio(src);
        audio.volume = isMuted ? 0 : volume;
        audio.preload = 'auto';
        preloadedAudio[i] = audio;
      }
    }
    
    return preloadedAudio;
  };
  // Analyze and render audio
  const prepareAudio = async () => {
    setIsPreparing(true);
    
    try {
      let textContent = bookContent;
      let segments: any[] = [];

      // If no bookContent provided, try to fetch from database
      if (!textContent) {
        console.log('Fetching book content from database...');
        const { data: bookPages, error: pagesError } = await supabase
          .from('book_pages')
          .select('content, tts_segments')
          .eq('book_id', bookId)
          .order('page_index')
          .limit(1); // Get first page for now

        if (pagesError) throw pagesError;
        
        if (bookPages && bookPages.length > 0) {
          textContent = bookPages[0].content;
          
          // Use pre-computed TTS segments if available
          if (isMultiVoice && bookPages[0].tts_segments && Array.isArray(bookPages[0].tts_segments)) {
            segments = bookPages[0].tts_segments;
            console.log('Using pre-computed TTS segments from database');
          }
        } else {
          // No pages found - trigger book ingestion
          console.log('No book pages found, triggering ingestion...');
          
          try {
            await supabase.functions.invoke('book-ingest', {
              body: { book_id: bookId }
            });
            
            toast({
              title: "Preparing Book...",
              description: "Processing book content for enhanced reading. This may take a moment.",
            });
            
            // Poll for pages to become available
            const pollForPages = async () => {
              for (let attempt = 0; attempt < 15; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                
                const { data: pages } = await supabase
                  .from('book_pages')
                  .select('content, tts_segments')
                  .eq('book_id', bookId)
                  .order('page_index')
                  .limit(1);
                
                if (pages && pages.length > 0) {
                  textContent = pages[0].content;
                  if (isMultiVoice && pages[0].tts_segments && Array.isArray(pages[0].tts_segments)) {
                    segments = pages[0].tts_segments;
                  }
                  break;
                }
              }
              
              if (!textContent) {
                // Final fallback to sample content
                textContent = getSampleBookContent(bookTitle) || '';
                if (!textContent) {
                  throw new Error('Book ingestion failed - no content available');
                }
              }
            };
            
            await pollForPages();
            
          } catch (ingestError) {
            console.error('Auto-ingestion failed:', ingestError);
            // Fallback to sample content
            textContent = getSampleBookContent(bookTitle) || '';
            if (!textContent) {
              throw new Error('No book content found and ingestion failed');
            }
          }
        }
      }

      if (!textContent) {
        toast({
          title: "No Content",
          description: "No text available to read aloud.",
          variant: "destructive",
        });
        return;
      }

      // If we don't have pre-computed segments, analyze the content
      if (segments.length === 0) {
        if (isMultiVoice) {
          console.log('Analyzing text for multi-voice...');
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('tts-analyze', {
            body: { text: textContent, book_id: bookId }
          });

          if (analysisError) throw analysisError;
          segments = analysisData.segments;
        } else {
          // Single voice mode - create simple segments
          const paragraphs = textContent.split('\n\n').filter(p => p.trim().length > 0);
          segments = paragraphs.map((text, index) => ({
            text: text.trim(),
            label: 'narrator',
            start_para_idx: index
          }));
        }
      }

      // Step 2: Render audio
      console.log(`Rendering ${segments.length} audio segments...`);
      const { data: renderData, error: renderError } = await supabase.functions.invoke('tts-render', {
        body: { 
          bookId, 
          mode: isMultiVoice ? 'multi' : 'single',
          voiceStyle: !isMultiVoice ? voiceStyle : undefined,
          segments 
        }
      });

      if (renderError) {
        console.error('TTS render failed, falling back to browser speech:', renderError);
        // Fallback to browser speech synthesis
        toast({
          title: "Using Browser Voice",
          description: "Enhanced voices unavailable, using system speech.",
          variant: "default",
        });
        return;
      }

      // Step 3: Set up audio queue
      const audioSegments: AudioSegment[] = renderData.manifest;
      const preloadedAudio = preloadAudio(audioSegments, 0);

      setAudioQueue({
        segments: audioSegments,
        currentIndex: 0,
        preloadedAudio
      });

      toast({
        title: "Audio Ready! 🎧",
        description: `Prepared ${audioSegments.length} segments with ${isMultiVoice ? 'multiple voices' : singleVoicePresets[voiceStyle as keyof typeof singleVoicePresets].name + ' voice'}.`,
      });

    } catch (error) {
      console.error('Audio preparation error:', error);
      toast({
        title: "Preparation Failed",
        description: error instanceof Error ? error.message : "Failed to prepare audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreparing(false);
    }
  };

  // Play current segment
  const playCurrentSegment = () => {
    const { segments, currentIndex, preloadedAudio } = audioQueue;
    if (segments.length === 0 || !preloadedAudio[currentIndex]) return;

    const audio = preloadedAudio[currentIndex];
    currentAudioRef.current = audio;
    
    // Ensure the element is ready in Safari/iOS
    try { audio.load(); } catch {}
    audio.onerror = (e) => {
      console.error('Audio element error:', e);
      toast({ title: 'Playback Error', description: 'Audio failed to load or is unsupported.', variant: 'destructive' });
    };

    audio.onended = () => {
      // Move to next segment
      if (currentIndex < segments.length - 1) {
        const newIndex = currentIndex + 1;
        const newPreloaded = preloadAudio(segments, newIndex);
        
        setAudioQueue(prev => ({
          ...prev,
          currentIndex: newIndex,
          preloadedAudio: { ...prev.preloadedAudio, ...newPreloaded }
        }));

        // Highlight next paragraph
        onParagraphHighlight?.(segments[newIndex].startParaIdx);
      } else {
        // End of playback
        setIsPlaying(false);
        setCurrentPosition(0);
        onProgressUpdate?.(100);
      }
    };

    audio.ontimeupdate = () => {
      const segmentProgress = (audio.currentTime / (audio.duration || 1)) * 100;
      const overallProgress = ((currentIndex + (audio.currentTime / (audio.duration || 1))) / segments.length) * 100;
      setCurrentPosition(overallProgress);
      onProgressUpdate?.(overallProgress);
    };

    // Highlight current paragraph
    onParagraphHighlight?.(segments[currentIndex].startParaIdx);

    audio.play().catch(error => {
      console.error('Audio play error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio segment.",
        variant: "destructive",
      });
    });
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (audioQueue.segments.length === 0) {
      await prepareAudio();
      return;
    }

    if (isPlaying) {
      currentAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playCurrentSegment();
    }
  };

  // Handle skip forward/backward
  const handleSkip = (direction: 'forward' | 'backward') => {
    const { segments, currentIndex } = audioQueue;
    let newIndex: number;

    if (direction === 'forward') {
      newIndex = Math.min(currentIndex + 1, segments.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    if (newIndex !== currentIndex) {
      currentAudioRef.current?.pause();
      const newPreloaded = preloadAudio(segments, newIndex);
      
      setAudioQueue(prev => ({
        ...prev,
        currentIndex: newIndex,
        preloadedAudio: { ...prev.preloadedAudio, ...newPreloaded }
      }));

      if (isPlaying) {
        setTimeout(playCurrentSegment, 100);
      }
    }
  };

  // Handle volume changes
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    Object.values(audioQueue.preloadedAudio).forEach(audio => {
      audio.volume = isMuted ? 0 : newVolume;
    });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    Object.values(audioQueue.preloadedAudio).forEach(audio => {
      audio.volume = newMuted ? 0 : volume;
    });
  };

  // Handle mode/style changes
  const handleModeChange = (multiVoice: boolean) => {
    setIsMultiVoice(multiVoice);
    setAudioQueue({ segments: [], currentIndex: 0, preloadedAudio: {} });
    setCurrentPosition(0);
    setIsPlaying(false);
    savePreferences();
  };

  const handleVoiceStyleChange = (style: string) => {
    setVoiceStyle(style);
    if (!isMultiVoice) {
      setAudioQueue({ segments: [], currentIndex: 0, preloadedAudio: {} });
      setCurrentPosition(0);
      setIsPlaying(false);
    }
    savePreferences();
  };

  const currentSegment = audioQueue.segments[audioQueue.currentIndex];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Volume2 className="h-5 w-5" />
          Enhanced Read to Me
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Mode Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-600" />
              <Label htmlFor="voice-mode">Voice Mode</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="voice-mode" className={`text-sm ${!isMultiVoice ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                Single
              </Label>
              <Switch
                id="voice-mode"
                checked={isMultiVoice}
                onCheckedChange={handleModeChange}
              />
              <Label htmlFor="voice-mode" className={`text-sm ${isMultiVoice ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                <Users className="h-3 w-3 inline mr-1" />
                Multi
              </Label>
            </div>
          </div>

          {/* Single Voice Style Selector */}
          {!isMultiVoice && (
            <div className="space-y-2">
              <Label className="text-sm text-blue-800">Voice Style</Label>
              <Select value={voiceStyle} onValueChange={handleVoiceStyleChange}>
                <SelectTrigger className="bg-white border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(singleVoicePresets).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-gray-500">{preset.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Current Segment Info */}
        {currentSegment && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                Segment {audioQueue.currentIndex + 1} of {audioQueue.segments.length}
              </span>
              {isMultiVoice && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-blue-600 capitalize">{currentSegment.label.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentPosition}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-700">
            <span>{Math.round(currentPosition)}%</span>
            <span>{audioQueue.segments.length > 0 ? `${audioQueue.segments.length} segments` : 'No audio'}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSkip('backward')}
            disabled={isLoading || isPreparing || audioQueue.currentIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isPreparing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Preparing voices...</span>
              </div>
            ) : isLoading ? (
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
            onClick={() => handleSkip('forward')}
            disabled={isLoading || isPreparing || audioQueue.currentIndex >= audioQueue.segments.length - 1}
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

        {/* Status */}
        <div className="text-center text-xs text-blue-600">
          {bookTitle}
          {isPreparing && <div className="mt-1 text-blue-700">🎭 Preparing voices for your story...</div>}
        </div>
      </CardContent>
    </Card>
  );
};