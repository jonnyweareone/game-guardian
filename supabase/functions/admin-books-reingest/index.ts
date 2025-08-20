import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { book_ids, limit = 5 } = await req.json()

    if (!book_ids || !Array.isArray(book_ids)) {
      return new Response(
        JSON.stringify({ error: 'book_ids array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Admin reingest requested for ${book_ids.length} books (limit: ${limit})`)

    const results = []
    const processedBooks = book_ids.slice(0, limit)

    for (const bookId of processedBooks) {
      try {
        console.log(`Triggering reingest for book: ${bookId}`)
        
        // Call book-ingest function with service role
        const { data, error } = await supabase.functions.invoke('book-ingest', {
          body: { book_id: bookId }
        })

        if (error) {
          console.error(`Error reingesting book ${bookId}:`, error)
          results.push({ book_id: bookId, success: false, error: error.message })
        } else {
          console.log(`Successfully triggered reingest for book ${bookId}`)
          results.push({ book_id: bookId, success: true, data })
        }
      } catch (err) {
        console.error(`Failed to reingest book ${bookId}:`, err)
        results.push({ book_id: bookId, success: false, error: err.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedBooks.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Admin reingest error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})