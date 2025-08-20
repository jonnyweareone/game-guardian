import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useNovaSession(childId: string, bookId: string, bookTitle?: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Start session and listening
  const startSession = async () => {
    if (!childId || !bookId) return;

    try {
      // Call Nova edge function to start session
      const { data, error } = await supabase.functions.invoke('nova-start-session', {
        body: {
          child_id: childId,
          book_id: bookId,
          locator: null, // Could be enhanced with reader position
        },
      });

      if (error) throw error;

      setSessionId(data.session_id);
      setIsListening(true);
      startTimeRef.current = new Date();

      // Start periodic chunk reporting (every 45 seconds)
      intervalRef.current = setInterval(async () => {
        if (data.session_id) {
          await supabase.functions.invoke('nova-chunk', {
            body: {
              session_id: data.session_id,
              child_id: childId,
              book_id: bookId,
              locator: null, // Would contain reader position in real implementation
              raw_text: null, // Would contain extracted text for AI analysis
            },
          });
        }
      }, 45000);

    } catch (error) {
      console.error('Failed to start Nova session:', error);
    }
  };

  // End session
  const endSession = async () => {
    if (!sessionId) return;

    try {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Calculate session duration
      const totalSeconds = startTimeRef.current 
        ? Math.round((Date.now() - startTimeRef.current.getTime()) / 1000)
        : 0;

      // Call Nova edge function to end session
      await supabase.functions.invoke('nova-end-session', {
        body: {
          session_id: sessionId,
          total_seconds: totalSeconds,
        },
      });

      setSessionId('');
      setIsListening(false);
      startTimeRef.current = null;

    } catch (error) {
      console.error('Failed to end Nova session:', error);
    }
  };

  // Auto-start session when component mounts
  useEffect(() => {
    if (childId && bookId) {
      startSession();
    }

    // Cleanup on unmount
    return () => {
      if (sessionId) {
        endSession();
      }
    };
  }, [childId, bookId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    sessionId,
    isListening,
    startSession,
    endSession,
  };
}