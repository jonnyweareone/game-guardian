import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, bookId, progress, pageIndex } = await req.json();

    if (!token || !bookId || progress === undefined) {
      return new Response(
        JSON.stringify({ error: 'Token, bookId, and progress are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get child ID
    const { data: tokenData, error: tokenError } = await supabase
      .from('nova_child_tokens')
      .select('child_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const childId = tokenData.child_id;

    // Update bookshelf progress (this will trigger coins awards via trigger)
    const { error: bookshelfError } = await supabase
      .from('child_bookshelf')
      .upsert({
        child_id: childId,
        book_id: bookId,
        progress: progress,
        status: progress >= 100 ? 'finished' : 'reading'
      });

    if (bookshelfError) {
      console.error('Error updating bookshelf:', bookshelfError);
      return new Response(
        JSON.stringify({ error: 'Failed to update progress' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update page progress if provided
    if (pageIndex !== undefined) {
      const { error: pageError } = await supabase
        .from('child_page_progress')
        .upsert({
          child_id: childId,
          book_id: bookId,
          page_index: pageIndex,
          read_percent: 100,
          updated_at: new Date().toISOString()
        });

      if (pageError) {
        console.error('Error updating page progress:', pageError);
      }
    }

    return new Response(
      JSON.stringify({
        progress_updated: true,
        child_id: childId,
        progress: progress
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in nova-update-progress-token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});