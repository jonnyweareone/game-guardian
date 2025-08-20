import { supabase } from '@/integrations/supabase/client';

interface FunctionResponse<T = any> {
  data: T | null;
  error: any;
}

export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body?: any
): Promise<FunctionResponse<T>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        data: null,
        error: { message: 'User not authenticated' }
      };
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: body || {},
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo'
      }
    });

    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Exception calling ${functionName}:`, error);
    return { data: null, error };
  }
}

export const ingestBook = async (sourceUrl: string, bookId?: string) => {
  const { data, error } = await supabase.functions.invoke('book-ingest', {
    body: { 
      source_url: sourceUrl,
      book_id: bookId 
    }
  });

  if (error) throw error;
  return data;
};
