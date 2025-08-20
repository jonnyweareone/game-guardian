
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNovaSignals(childId: string) {
  const [isListening, setIsListening] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;

    // Subscribe to real-time events for this child
    const channel = supabase.channel(`nova_child_${childId}`)
      .on('broadcast', { event: 'nova' }, ({ payload }) => {
        console.log('Nova signal received:', payload);
        
        switch (payload.type) {
          case 'listening_on':
            toast.success('AI Listening started');
            setIsListening(true);
            setCurrentBookId(payload.book_id || null);
            break;
          case 'listening_off':
            toast.info('AI Listening stopped');
            setIsListening(false);
            setCurrentBookId(null);
            break;
          default:
            console.log('Unknown nova signal:', payload.type);
        }
      })
      .subscribe();

    // Load initial listening state
    const loadListeningState = async () => {
      try {
        const { data } = await supabase
          .from('child_listening_state')
          .select('is_listening, book_id')
          .eq('child_id', childId)
          .single();
        
        if (data) {
          setIsListening(data.is_listening);
          setCurrentBookId(data.book_id);
        }
      } catch (error) {
        console.error('Failed to load listening state:', error);
      }
    };

    loadListeningState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const startListening = async (bookId: string) => {
    try {
      await supabase.from('child_listening_state').upsert({
        child_id: childId,
        is_listening: true,
        book_id: bookId,
        updated_at: new Date().toISOString()
      });

      supabase.channel(`nova_child_${childId}`).send({
        type: 'broadcast',
        event: 'nova',
        payload: { type: 'listening_on', child_id: childId, book_id: bookId }
      });
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Failed to start AI listening');
    }
  };

  const stopListening = async () => {
    try {
      await supabase.from('child_listening_state').upsert({
        child_id: childId,
        is_listening: false,
        book_id: null,
        updated_at: new Date().toISOString()
      });

      supabase.channel(`nova_child_${childId}`).send({
        type: 'broadcast',
        event: 'nova',
        payload: { type: 'listening_off', child_id: childId }
      });
    } catch (error) {
      console.error('Failed to stop listening:', error);
      toast.error('Failed to stop AI listening');
    }
  };

  return {
    isListening,
    currentBookId,
    startListening,
    stopListening
  };
}
