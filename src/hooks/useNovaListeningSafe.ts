import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NovaSessionIDs } from '@/lib/novaSession';

/**
 * Safe Nova listening hook that always calls hooks unconditionally
 * and gates effects internally to avoid React #310 errors
 */
export function useNovaListeningSafe(ids: NovaSessionIDs | null, enabled: boolean = false) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up previous effect
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Only proceed if we have valid IDs and feature is enabled
    if (!ids || !enabled) return;

    let cancelled = false;

    const setupListening = async () => {
      try {
        // Update listening state in database
        await supabase
          .from('child_listening_state')
          .upsert({ 
            child_id: ids.childId, 
            is_listening: true, 
            book_id: ids.bookId,
            session_id: ids.sessionId
          });

        console.log('Nova listening state activated for session:', ids.sessionId);
      } catch (error) {
        console.error('Error setting up Nova listening:', error);
      }
    };

    const teardownListening = async () => {
      if (cancelled) return;
      try {
        await supabase
          .from('child_listening_state')
          .upsert({ 
            child_id: ids.childId, 
            is_listening: false, 
            book_id: null,
            session_id: null
          });
        console.log('Nova listening state deactivated');
      } catch (error) {
        console.error('Error tearing down Nova listening:', error);
      }
    };

    setupListening();

    // Store cleanup function
    cleanupRef.current = () => {
      cancelled = true;
      teardownListening();
    };

    return () => {
      cancelled = true;
      teardownListening();
    };
  }, [ids, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
}