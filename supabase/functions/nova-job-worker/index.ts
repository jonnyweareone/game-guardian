
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NovaJob {
  id: string
  job_type: 'ingest' | 'analyze'
  book_id: string
  payload: any
  status: string
  attempts: number
  error?: string
  created_at: string
  started_at?: string
  finished_at?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('Nova job worker starting...')

    // Process up to 3 jobs per invocation to avoid timeouts
    let processed = 0
    const maxJobs = 3

    while (processed < maxJobs) {
      // Claim next job atomically
      const { data: job, error: claimError } = await supabase.rpc('nova_claim_job')
      
      if (claimError) {
        console.error('Error claiming job:', claimError)
        break
      }

      if (!job) {
        console.log('No jobs available')
        break
      }

      console.log(`Processing job ${job.id} (${job.job_type}) for book ${job.book_id}`)

      try {
        if (job.job_type === 'ingest') {
          await processIngestJob(supabase, job)
        } else if (job.job_type === 'analyze') {
          await processAnalyzeJob(supabase, job)
        }

        // Mark job as done
        await supabase
          .from('nova_jobs')
          .update({ 
            status: 'done', 
            finished_at: new Date().toISOString() 
          })
          .eq('id', job.id)

        console.log(`Job ${job.id} completed successfully`)
        processed++

      } catch (error) {
        console.error(`Job ${job.id} failed:`, error)
        
        // Mark job as error, with retry logic
        const shouldRetry = job.attempts < 3
        await supabase
          .from('nova_jobs')
          .update({ 
            status: shouldRetry ? 'queued' : 'error',
            error: error.message,
            finished_at: shouldRetry ? null : new Date().toISOString()
          })
          .eq('id', job.id)

        processed++
      }
    }

    return new Response(
      JSON.stringify({ processed, message: `Processed ${processed} jobs` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processIngestJob(supabase: any, job: NovaJob) {
  const { book_id, payload } = job
  const { source_url, source_id, source } = payload

  console.log(`Ingesting book ${book_id} from ${source_url || `${source}:${source_id}`}`)

  // Determine the URL to fetch
  let fetchUrl = source_url
  if (!fetchUrl && source === 'gutenberg' && source_id) {
    fetchUrl = `https://www.gutenberg.org/cache/epub/${source_id}/pg${source_id}.txt`
  }

  if (!fetchUrl) {
    throw new Error('No source URL available for ingestion')
  }

  // Fetch the book content
  console.log(`Fetching content from: ${fetchUrl}`)
  const response = await fetch(fetchUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch book: ${response.status} ${response.statusText}`)
  }

  let content = await response.text()
  
  // Clean up the content
  content = cleanGutenbergText(content)
  
  if (!content.trim()) {
    throw new Error('No content found after cleaning')
  }

  // Split into pages
  const pages = paginateContent(content)
  console.log(`Split into ${pages.length} pages`)

  // Clear existing pages for this book
  await supabase
    .from('book_pages')
    .delete()
    .eq('book_id', book_id)

  // Insert new pages
  const pageInserts = pages.map((pageContent, index) => ({
    book_id,
    page_index: index,
    content: pageContent,
    tokens: tokenizeContent(pageContent),
    voice_spans: null // Will be filled by analysis job
  }))

  // Insert in batches to avoid payload limits
  const batchSize = 50
  for (let i = 0; i < pageInserts.length; i += batchSize) {
    const batch = pageInserts.slice(i, i + batchSize)
    const { error } = await supabase
      .from('book_pages')
      .insert(batch)
    
    if (error) {
      throw new Error(`Failed to insert pages batch ${i}: ${error.message}`)
    }
  }

  // Mark book as ingested
  await supabase
    .from('books')
    .update({ 
      ingested: true, 
      ingested_at: new Date().toISOString(),
      pages: pages.length
    })
    .eq('id', book_id)

  console.log(`Book ${book_id} ingested successfully with ${pages.length} pages`)
}

async function processAnalyzeJob(supabase: any, job: NovaJob) {
  const { book_id } = job

  console.log(`Analyzing book ${book_id} for voice spans`)

  // Get all pages for this book
  const { data: pages, error } = await supabase
    .from('book_pages')
    .select('id, content, page_index')
    .eq('book_id', book_id)
    .order('page_index')

  if (error) {
    throw new Error(`Failed to fetch pages: ${error.message}`)
  }

  if (!pages || pages.length === 0) {
    throw new Error('No pages found for analysis')
  }

  // Process each page for voice spans
  for (const page of pages) {
    const voiceSpans = analyzeVoiceSpans(page.content)
    
    await supabase
      .from('book_pages')
      .update({ voice_spans: voiceSpans })
      .eq('id', page.id)
  }

  // Mark book as analyzed
  await supabase
    .from('books')
    .update({ 
      analysis_done: true, 
      analysis_at: new Date().toISOString()
    })
    .eq('id', book_id)

  console.log(`Book ${book_id} analyzed successfully`)
}

function cleanGutenbergText(content: string): string {
  // Remove Project Gutenberg header/footer
  let cleaned = content
  
  // Remove header (everything before "*** START OF")
  const startMatch = cleaned.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG.*?\*\*\*/i)
  if (startMatch) {
    cleaned = cleaned.substring(startMatch.index! + startMatch[0].length)
  }
  
  // Remove footer (everything after "*** END OF")
  const endMatch = cleaned.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG.*?\*\*\*/i)
  if (endMatch) {
    cleaned = cleaned.substring(0, endMatch.index)
  }
  
  // Normalize whitespace
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  return cleaned
}

function paginateContent(content: string): string[] {
  const pages: string[] = []
  const targetWordsPerPage = 250
  
  // Split by double newlines (paragraphs)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())
  
  let currentPage = ''
  let currentWordCount = 0
  
  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/).length
    
    // If adding this paragraph would exceed target and we have content, start new page
    if (currentWordCount > 0 && currentWordCount + paragraphWords > targetWordsPerPage) {
      pages.push(currentPage.trim())
      currentPage = paragraph
      currentWordCount = paragraphWords
    } else {
      if (currentPage) {
        currentPage += '\n\n' + paragraph
      } else {
        currentPage = paragraph
      }
      currentWordCount += paragraphWords
    }
  }
  
  // Add final page if there's content
  if (currentPage.trim()) {
    pages.push(currentPage.trim())
  }
  
  return pages
}

function tokenizeContent(content: string): any[] {
  const tokens: any[] = []
  const words = content.split(/(\s+|[.,!?;:"()])/g)
  let position = 0
  
  for (const word of words) {
    const startPos = position
    const endPos = position + word.length
    
    if (word.trim() && !/^\s+$/.test(word)) {
      tokens.push({
        w: word.trim(),
        s: startPos,
        e: endPos
      })
    }
    
    position = endPos
  }
  
  return tokens
}

function analyzeVoiceSpans(content: string): any[] {
  const spans: any[] = []
  
  // Simple dialogue detection for quoted speech
  const dialogueRegex = /"([^"]+)"/g
  let match
  
  while ((match = dialogueRegex.exec(content)) !== null) {
    const start = match.index
    const end = match.index + match[0].length
    
    // Try to find speaker attribution nearby
    let speaker = null
    const beforeText = content.substring(Math.max(0, start - 100), start)
    const afterText = content.substring(end, Math.min(content.length, end + 100))
    
    // Look for "said [Name]" patterns
    const speakerMatch = (beforeText + afterText).match(/(?:said|asked|replied|whispered|shouted|exclaimed)\s+([A-Z][a-z]+)/i)
    if (speakerMatch) {
      speaker = speakerMatch[1]
    }
    
    spans.push({
      role: 'DIALOGUE',
      speaker: speaker,
      s: start,
      e: end
    })
  }
  
  // Add a default NARRATOR span for the rest if no dialogue found
  if (spans.length === 0) {
    spans.push({
      role: 'NARRATOR',
      speaker: null,
      s: 0,
      e: content.length
    })
  }
  
  return spans
}
