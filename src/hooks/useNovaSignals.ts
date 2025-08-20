import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NovaState {
  isListening: boolean;
  currentBook?: {
    id: string;
    title?: string;
  };
}

export function useNovaSignals(childId: string) {
  const [state, setState] = useState<NovaState>({
    isListening: false,
    currentBook: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!childId) return;

    // Subscribe to Nova signals for this child
    const channel = supabase.channel(`nova_child_${childId}`);

    channel
      .on('broadcast', { event: 'nova' }, ({ payload }) => {
        if (payload.type === 'listening_on') {
          setState({
            isListening: true,
            currentBook: {
              id: payload.book_id,
              title: payload.title,
            },
          });
          toast({
            title: "Listening started",
            description: `Nova is now listening for "${payload.title || 'Current book'}"`,
          });
        } else if (payload.type === 'listening_off') {
          setState({
            isListening: false,
            currentBook: undefined,
          });
          toast({
            title: "Listening stopped",
            description: "Nova has stopped listening",
          });
        } else if (payload.type === 'progress') {
          // Optional: Handle progress updates
          console.log('Reading progress:', payload.progress);
        }
      })
      .subscribe();

    // Load initial listening state
    supabase
      .from('child_listening_state')
      .select('*')
      .eq('child_id', childId)
      .single()
      .then(({ data }) => {
        if (data?.is_listening && data.book_id) {
          // Load book title
          supabase
            .from('books')
            .select('title')
            .eq('id', data.book_id)
            .single()
            .then(({ data: book }) => {
              setState({
                isListening: true,
                currentBook: {
                  id: data.book_id,
                  title: book?.title,
                },
              });
            });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId, toast]);

  return state;
}