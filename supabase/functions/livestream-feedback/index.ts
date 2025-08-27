
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const formData = await req.formData()
    
    const speakerSlug = formData.get('speakerSlug') as string
    const comfortable = formData.get('comfortable') === 'true'
    const notes = formData.get('notes') as string || null
    const preferredIntro = formData.get('preferredIntro') as string || null
    const techNotes = formData.get('techNotes') as string || null
    const userAgent = formData.get('userAgent') as string || null
    const headshotFile = formData.get('headshot') as File | null

    if (!speakerSlug) {
      return new Response(
        JSON.stringify({ error: 'Speaker slug is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let headshotPath = null

    // Handle headshot upload if provided
    if (headshotFile && headshotFile.size > 0) {
      const fileExt = headshotFile.name.split('.').pop()
      const fileName = `${speakerSlug}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('livestream-headshots')
        .upload(fileName, headshotFile, {
          contentType: headshotFile.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(
          JSON.stringify({ error: 'Failed to upload headshot' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      headshotPath = uploadData.path
    }

    // Insert feedback record (using service role key, bypasses RLS)
    const { data, error } = await supabase
      .from('livestream_feedback')
      .insert({
        speaker_slug: speakerSlug,
        comfortable,
        notes,
        preferred_intro: preferredIntro,
        headshot_path: headshotPath,
        tech_notes: techNotes,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Feedback submitted successfully',
        id: data.id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
