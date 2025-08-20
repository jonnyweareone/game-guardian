
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book_id, chapter_index } = await req.json();

    if (!book_id || chapter_index === undefined) {
      return new Response(
        JSON.stringify({ error: 'book_id and chapter_index are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create authenticated client
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Get current user to verify permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('book_chapters')
      .select('id, generated_images, max_images')
      .eq('book_id', book_id)
      .eq('chapter_index', chapter_index)
      .single();

    if (chapterError || !chapter) {
      return new Response(
        JSON.stringify({ error: 'Chapter not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if slot 2 is needed and not already generated
    if (chapter.generated_images >= 2) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Chapter already has maximum images',
          chapter_id: chapter.id,
          generated_images: chapter.generated_images
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if slot 2 job is already queued
    const { data: existingJob } = await supabase
      .from('nova_jobs')
      .select('id, status')
      .eq('book_id', book_id)
      .eq('chapter_id', chapter.id)
      .eq('job_type', 'illustrate_slot')
      .contains('payload', { slot: 2 })
      .in('status', ['queued', 'running'])
      .single();

    if (existingJob) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Slot 2 job already queued',
          job_id: existingJob.id,
          status: existingJob.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Queue slot 2 generation job
    const { data: newJob, error: jobError } = await supabase
      .from('nova_jobs')
      .insert({
        job_type: 'illustrate_slot',
        book_id,
        chapter_id: chapter.id,
        payload: { slot: 2, provider: 'api' }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating slot 2 job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Failed to queue slot 2 generation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Queued slot 2 generation for book ${book_id}, chapter ${chapter_index}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Slot 2 generation queued',
        job_id: newJob.id,
        chapter_id: chapter.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in nova-illustrations-ensure-slot2:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
