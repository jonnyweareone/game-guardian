import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TTSSegment {
  text: string;
  label: string;
  start_para_idx: number;
}

interface AudioManifest {
  audioUrl: string;
  label: string;
  startParaIdx: number;
  duration?: number;
}

interface UseEnhancedTTSReturn {
  isAnalyzing: boolean;
  isRendering: boolean;
  analyzeText: (text: string, bookId: string) => Promise<TTSSegment[]>;
  renderAudio: (bookId: string, mode: 'single' | 'multi', segments: TTSSegment[], voiceStyle?: string) => Promise<AudioManifest[]>;
}

export const useEnhancedTTS = (): UseEnhancedTTSReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const { toast } = useToast();

  const analyzeText = useCallback(async (text: string, bookId: string): Promise<TTSSegment[]> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('tts-analyze', {
        body: { text, book_id: bookId }
      });

      if (error) throw error;

      return data.segments || [];
    } catch (error) {
      console.error('TTS Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze text for multi-voice. Using single voice instead.",
        variant: "destructive",
      });
      
      // Fallback: create simple segments
      const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
      return paragraphs.map((text, index) => ({
        text: text.trim(),
        label: 'narrator',
        start_para_idx: index
      }));
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const renderAudio = useCallback(async (
    bookId: string, 
    mode: 'single' | 'multi', 
    segments: TTSSegment[], 
    voiceStyle?: string
  ): Promise<AudioManifest[]> => {
    setIsRendering(true);
    try {
      const { data, error } = await supabase.functions.invoke('tts-render', {
        body: { 
          bookId, 
          mode, 
          voiceStyle, 
          segments 
        }
      });

      if (error) throw error;

      return data.manifest || [];
    } catch (error) {
      console.error('TTS Render error:', error);
      toast({
        title: "Audio Generation Failed",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsRendering(false);
    }
  }, [toast]);

  return {
    isAnalyzing,
    isRendering,
    analyzeText,
    renderAudio
  };
};