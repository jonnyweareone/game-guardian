import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility to create a client using the caller's JWT (for auth checks)
function createUserClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })
}

// Service client for privileged DB writes
function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  return createClient(supabaseUrl, serviceKey)
}

async function ingestSingle(supabase: ReturnType<typeof createServiceClient>, source_url: string, book_id?: string) {
  if (!source_url) throw new Error('source_url missing')

  // If it's a Gutenberg landing page, map to .txt file
  let fetchUrl = source_url
  if (source_url.includes('gutenberg.org') && !source_url.includes('.txt')) {
    const bookMatch = source_url.match(/\/ebooks\/(\d+)/)
    if (bookMatch) {
      fetchUrl = `https://www.gutenberg.org/files/${bookMatch[1]}/${bookMatch[1]}-0.txt`
    }
  }

  const response = await fetch(fetchUrl)
  if (!response.ok) throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`)

  const fullText = await response.text()
  const lines = fullText.split('\n')
  let title = 'Unknown Title'
  let author = 'Unknown Author'
  let startIndex = 0
  let endIndex = lines.length

  // Parse header
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i].trim()
    if (line.startsWith('Title:')) title = line.replace('Title:', '').trim()
    if (line.startsWith('Author:')) author = line.replace('Author:', '').trim()
    if (line.includes('*** START OF') || line.includes('*** BEGIN')) {
      startIndex = i + 1
      break
    }
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line.includes('*** END OF') || line.includes('*** FINIS')) {
      endIndex = i
      break
    }
  }

  const cleanLines = lines.slice(startIndex, endIndex).filter((l) => l.trim().length > 0)
  const cleanText = cleanLines.join('\n').trim()

  const gutenbergMatch = source_url.match(/\/ebooks\/(\d+)/)
  const gutenbergId = gutenbergMatch ? parseInt(gutenbergMatch[1]) : null

  // Upsert book if needed
  let finalBookId = book_id
  if (!finalBookId) {
    const { data: newBook, error: bookError } = await supabase
      .from('books')
      .insert({
        title,
        author,
        source_url,
        gutenberg_id: gutenbergId,
        ingested: true,
        category: 'Classic Literature',
        license: 'Public Domain',
      })
      .select()
      .single()
    if (bookError) throw bookError
    finalBookId = newBook.id
  } else {
    const { error: upErr } = await supabase
      .from('books')
      .update({ source_url, gutenberg_id: gutenbergId, ingested: true })
      .eq('id', finalBookId)
    if (upErr) throw upErr
  }

  // Split content into ~500-word pages and prepare tokens
  const words = cleanText.split(/\s+/)
  const wordsPerPage = 500
  const totalPages = Math.ceil(words.length / wordsPerPage)

  // Clear existing pages
  const { error: delErr } = await supabase.from('book_pages').delete().eq('book_id', finalBookId)
  if (delErr) throw delErr

  const pages: any[] = []
  for (let i = 0; i < totalPages; i++) {
    const startWord = i * wordsPerPage
    const endWord = Math.min((i + 1) * wordsPerPage, words.length)
    const pageWords = words.slice(startWord, endWord)
    const pageContent = pageWords.join(' ')

    const tokens = pageWords.map((word, index) => ({
      word,
      start: pageWords.slice(0, index).join(' ').length + (index > 0 ? 1 : 0),
      end: pageWords.slice(0, index + 1).join(' ').length,
    }))

    pages.push({ book_id: finalBookId, page_index: i, content: pageContent, tokens })
  }

  // Batch insert pages
  const batchSize = 50
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize)
    const { error: insErr } = await supabase.from('book_pages').insert(batch)
    if (insErr) throw insErr
  }

  return { book_id: finalBookId, title, author, total_pages: totalPages }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const userClient = createUserClient(req)
    const serviceClient = createServiceClient()

    // Auth check: must be admin
    const { data: userRes, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: isAdminData, error: adminErr } = await userClient.rpc('is_admin')
    if (adminErr || !isAdminData) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden: admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { limit = 20, force = false } = await req.json().catch(() => ({ limit: 20, force: false }))

    // Pick books: either all with source_url (force) or only not ingested yet
    const query = serviceClient.from('books').select('id, source_url, ingested').not('source_url', 'is', null)
    const { data: candidates, error: selErr } = force
      ? await query.limit(limit)
      : await query.eq('ingested', false).limit(limit)

    if (selErr) throw selErr

    const results: any[] = []
    for (const b of candidates || []) {
      try {
        const start = Date.now()
        const { data: ingestJob, error: ingestErr } = await serviceClient
          .from('book_ingests')
          .insert({ source_url: b.source_url, book_id: b.id, status: 'processing', started_at: new Date().toISOString() })
          .select()
          .single()
        if (ingestErr) throw ingestErr

        const res = await ingestSingle(serviceClient, b.source_url, b.id)

        await serviceClient
          .from('book_ingests')
          .update({ status: 'completed', completed_at: new Date().toISOString(), error: null })
          .eq('id', ingestJob.id)

        results.push({ ok: true, id: res.book_id, pages: res.total_pages, ms: Date.now() - start })
      } catch (e: any) {
        console.error('Ingest failed for book', b.id, e?.message)
        results.push({ ok: false, id: b.id, error: e?.message })
        await serviceClient
          .from('book_ingests')
          .insert({ source_url: b.source_url, book_id: b.id, status: 'error', error: String(e?.message), started_at: new Date().toISOString(), completed_at: new Date().toISOString() })
      }
    }

    return new Response(JSON.stringify({ success: true, count: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Batch reingest error', error)
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})