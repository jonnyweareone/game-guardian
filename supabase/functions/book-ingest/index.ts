
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
    const { source_url, book_id } = await req.json()
    
    if (!source_url) {
      throw new Error('source_url is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting book ingestion for:', source_url)

    // Create or update ingest job
    const { data: ingestJob, error: ingestError } = await supabase
      .from('book_ingests')
      .insert({
        source_url,
        book_id,
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (ingestError) {
      console.error('Error creating ingest job:', ingestError)
      throw ingestError
    }

    // Fetch content from Gutenberg
    let fetchUrl = source_url
    if (source_url.includes('gutenberg.org') && !source_url.includes('.txt')) {
      // Convert HTML page to plain text URL
      const bookMatch = source_url.match(/\/ebooks\/(\d+)/)
      if (bookMatch) {
        fetchUrl = `https://www.gutenberg.org/files/${bookMatch[1]}/${bookMatch[1]}-0.txt`
      }
    }

    console.log('Fetching content from:', fetchUrl)
    const response = await fetch(fetchUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    const fullText = await response.text()
    console.log('Fetched text length:', fullText.length)

    // Extract book title and clean content
    const lines = fullText.split('\n')
    let title = 'Unknown Title'
    let author = 'Unknown Author'
    let startIndex = 0
    let endIndex = lines.length

    // Find title and author from Gutenberg header
    for (let i = 0; i < Math.min(50, lines.length); i++) {
      const line = lines[i].trim()
      if (line.startsWith('Title:')) {
        title = line.replace('Title:', '').trim()
      }
      if (line.startsWith('Author:')) {
        author = line.replace('Author:', '').trim()
      }
      if (line.includes('*** START OF') || line.includes('*** BEGIN')) {
        startIndex = i + 1
        break
      }
    }

    // Find end of book content
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.includes('*** END OF') || line.includes('*** FINIS')) {
        endIndex = i
        break
      }
    }

    // Extract clean content
    const cleanLines = lines.slice(startIndex, endIndex)
      .filter(line => line.trim().length > 0)
    
    const cleanText = cleanLines.join('\n').trim()
    console.log('Clean text length:', cleanText.length)

    // Create or update book record
    const gutenbergMatch = source_url.match(/\/ebooks\/(\d+)/)
    const gutenbergId = gutenbergMatch ? parseInt(gutenbergMatch[1]) : null

    let finalBookId = book_id
    if (!finalBookId) {
      // Create new book
      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert({
          title,
          author,
          source_url,
          gutenberg_id: gutenbergId,
          ingested: true,
          category: 'Classic Literature',
          license: 'Public Domain'
        })
        .select()
        .single()

      if (bookError) {
        console.error('Error creating book:', bookError)
        throw bookError
      }
      finalBookId = newBook.id
    } else {
      // Update existing book
      await supabase
        .from('books')
        .update({
          source_url,
          gutenberg_id: gutenbergId,
          ingested: true
        })
        .eq('id', finalBookId)
    }

    // Split content into pages (roughly 500 words per page)
    const words = cleanText.split(/\s+/)
    const wordsPerPage = 500
    const totalPages = Math.ceil(words.length / wordsPerPage)

    console.log(`Splitting into ${totalPages} pages`)

    // Clear existing pages
    await supabase
      .from('book_pages')
      .delete()
      .eq('book_id', finalBookId)

    // Insert pages
    const pages = []
    for (let i = 0; i < totalPages; i++) {
      const startWord = i * wordsPerPage
      const endWord = Math.min((i + 1) * wordsPerPage, words.length)
      const pageWords = words.slice(startWord, endWord)
      const pageContent = pageWords.join(' ')

      // Simple tokenization for highlighting
      const tokens = pageWords.map((word, index) => ({
        word,
        start: pageWords.slice(0, index).join(' ').length + (index > 0 ? 1 : 0),
        end: pageWords.slice(0, index + 1).join(' ').length
      }))

      pages.push({
        book_id: finalBookId,
        page_index: i,
        content: pageContent,
        tokens: tokens
      })
    }

    // Batch insert pages
    const batchSize = 50
    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize)
      const { error: pagesError } = await supabase
        .from('book_pages')
        .insert(batch)

      if (pagesError) {
        console.error('Error inserting pages batch:', pagesError)
        throw pagesError
      }
    }

    // Update ingest job as completed
    await supabase
      .from('book_ingests')
      .update({
        status: 'completed',
        book_id: finalBookId,
        completed_at: new Date().toISOString()
      })
      .eq('id', ingestJob.id)

    console.log('Book ingestion completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        book_id: finalBookId,
        title,
        author,
        total_pages: totalPages,
        ingest_job_id: ingestJob.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Book ingestion error:', error)
    
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
