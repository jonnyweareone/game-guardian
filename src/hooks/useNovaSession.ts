import { useState, useEffect, useRef } from 'react';
import { invokeEdgeFunction } from '@/lib/supabase-functions';

export const useNovaSession = (childId: string, bookId: string, bookTitle?: string) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startSession = async () => {
    if (!childId || !bookId || sessionId) return;

    try {
      const { data, error } = await invokeEdgeFunction('nova-start-session', {
        child_id: childId,
        book_id: bookId,
        locator: '0.0'
      });

      if (error) {
        console.error('Error starting Nova session:', error);
        return;
      }

      if (data?.session_id) {
        setSessionId(data.session_id);
        setIsListening(true);
        startTimeRef.current = Date.now();

        // Start periodic reporting
        intervalRef.current = setInterval(async () => {
          await invokeEdgeFunction('nova-chunk', {
            session_id: data.session_id,
            child_id: childId,
            book_id: bookId,
            locator: Math.random().toFixed(2), // Random progress for demo
            raw_text: `Sample text from ${bookTitle || 'book'} at ${new Date().toLocaleTimeString()}`
          });
        }, 45000); // Every 45 seconds

        console.log('Nova session started:', data.session_id);
      }
    } catch (error) {
      console.error('Failed to start Nova session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      // Clear interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Calculate total seconds
      const totalSeconds = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;

      await invokeEdgeFunction('nova-end-session', {
        session_id: sessionId,
        total_seconds: totalSeconds
      });

      setSessionId(null);
      setIsListening(false);
      startTimeRef.current = null;
      console.log('Nova session ended');
    } catch (error) {
      console.error('Failed to end Nova session:', error);
    }
  };

  // Auto-start session when dependencies are available
  useEffect(() => {
    if (childId && bookId && bookTitle && !sessionId) {
      startSession();
    }
  }, [childId, bookId, bookTitle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (sessionId) {
        endSession();
      }
    };
  }, []);

  return {
    sessionId,
    isListening,
    startSession,
    endSession
  };
};