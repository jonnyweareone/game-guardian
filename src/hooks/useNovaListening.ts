import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Nova listening hook with opt-in flag support
 * Always call unconditionally to avoid React #310 errors
 */
export function useNovaListening(childId: string, bookId: string, enabled: boolean = true) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up previous effect
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Only proceed if we have valid IDs and feature is enabled
    if (!enabled || !childId || !bookId) return;

    let cancelled = false;

    const setupListening = async () => {
      try {
        // Update listening state in database
        await supabase
          .from('child_listening_state')
          .upsert({ 
            child_id: childId, 
            is_listening: true, 
            book_id: bookId
          });

        console.log('Nova listening state activated for child:', childId);
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
            child_id: childId, 
            is_listening: false, 
            book_id: null
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
  }, [childId, bookId, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
}