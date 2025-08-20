
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NovaJob {
  id: string
  job_type: 'ingest' | 'analyze' | 'illustrate' | 'illustrate_slot' | 'illustrate_finalize'
  book_id: string
  chapter_id?: string
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
        } else if (job.job_type === 'illustrate') {
          await processIllustrateJob(supabase, job)
        } else if (job.job_type === 'illustrate_slot') {
          await processIllustrateSlotJob(supabase, job)
        } else if (job.job_type === 'illustrate_finalize') {
          await processIllustrateFinalizeJob(supabase, job)
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

  // Create chapters after ingestion
  await createChaptersFromPages(supabase, book_id, pages)

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

async function processIllustrateJob(supabase: any, job: NovaJob) {
  const { book_id, payload } = job
  const { mode = 'progressive', max_per_chapter = 2 } = payload

  console.log(`Starting illustration job for book ${book_id} (${mode} mode)`)

  // Get all chapters for this book
  const { data: chapters, error } = await supabase
    .from('book_chapters')
    .select('*')
    .eq('book_id', book_id)
    .order('chapter_index')

  if (error) {
    throw new Error(`Failed to fetch chapters: ${error.message}`)
  }

  if (!chapters || chapters.length === 0) {
    throw new Error('No chapters found for illustration')
  }

  // For each chapter, enqueue slot 1 jobs
  for (const chapter of chapters) {
    if (chapter.generated_images < chapter.max_images) {
      // Always enqueue slot 1
      await supabase
        .from('nova_jobs')
        .insert({
          job_type: 'illustrate_slot',
          book_id,
          chapter_id: chapter.id,
          payload: { slot: 1, provider: 'api' }
        })

      console.log(`Enqueued slot 1 for chapter ${chapter.chapter_index}`)
    }
  }

  console.log(`Illustration bootstrap completed for book ${book_id}`)
}

async function processIllustrateSlotJob(supabase: any, job: NovaJob) {
  const { book_id, chapter_id, payload } = job
  const { slot, provider = 'api' } = payload

  console.log(`Generating illustration for chapter ${chapter_id}, slot ${slot}`)

  // Get chapter details
  const { data: chapter, error: chapterError } = await supabase
    .from('book_chapters')
    .select('*')
    .eq('id', chapter_id)
    .single()

  if (chapterError || !chapter) {
    throw new Error('Chapter not found')
  }

  // Check if this slot already exists
  const { data: existingImage } = await supabase
    .from('book_chapter_images')
    .select('id')
    .eq('chapter_id', chapter_id)
    .eq('slot', slot)
    .single()

  if (existingImage) {
    console.log(`Slot ${slot} already exists for chapter ${chapter_id}`)
    return
  }

  // Get book details for prompt context
  const { data: book } = await supabase
    .from('books')
    .select('title, author, subjects, level_tags')
    .eq('id', book_id)
    .single()

  // Build safe, kid-friendly prompt
  const prompt = buildChapterPrompt(book, chapter, slot)
  console.log(`Generated prompt: ${prompt}`)

  // Generate image using OpenAI
  const imageResult = await generateImage(prompt)

  // Upload to storage
  const fileName = `${chapter.chapter_index}-${slot}.png`
  const filePath = `${book_id}/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('book-art')
    .upload(filePath, imageResult.imageBytes, {
      contentType: 'image/png',
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  const imageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/book-art/${filePath}`

  // Save to database
  await supabase
    .from('book_chapter_images')
    .insert({
      book_id,
      chapter_id,
      slot,
      image_url: imageUrl,
      prompt,
      width: 1024,
      height: 1024,
      provider,
      cost_estimate_cents: imageResult.costCents
    })

  // Update chapter generated count
  await supabase
    .from('book_chapters')
    .update({ 
      generated_images: chapter.generated_images + 1
    })
    .eq('id', chapter_id)

  // Assign to appropriate page
  const targetPageIndex = slot === 1 
    ? chapter.first_page_index 
    : Math.floor((chapter.first_page_index + chapter.last_page_index) / 2)

  if (targetPageIndex !== null) {
    await supabase
      .from('book_pages')
      .update({
        illustration_url: imageUrl,
        illustration_prompt: prompt
      })
      .eq('book_id', book_id)
      .eq('page_index', targetPageIndex)
  }

  console.log(`Generated and assigned illustration for chapter ${chapter.chapter_index}, slot ${slot}`)
}

async function processIllustrateFinalizeJob(supabase: any, job: NovaJob) {
  const { book_id } = job

  console.log(`Finalizing illustrations for book ${book_id}`)

  // Check if all chapters have max images
  const { data: chapters } = await supabase
    .from('book_chapters')
    .select('generated_images, max_images')
    .eq('book_id', book_id)

  const allComplete = chapters?.every(ch => ch.generated_images >= ch.max_images)

  if (allComplete) {
    await supabase
      .from('books')
      .update({ images_generated: true })
      .eq('id', book_id)

    console.log(`All illustrations completed for book ${book_id}`)
  }
}

async function createChaptersFromPages(supabase: any, bookId: string, pages: string[]) {
  // Simple chapter detection based on content patterns
  const chapters = []
  let currentChapter = 0
  let chapterStart = 0

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    
    // Look for chapter markers (very basic heuristic)
    const isChapterStart = /^(Chapter|CHAPTER)\s+\d+/i.test(page.trim()) ||
                          /^\d+\.\s+[A-Z]/.test(page.trim()) ||
                          (i === 0) // First page is always start of first chapter

    if (isChapterStart && i > chapterStart) {
      // End previous chapter
      chapters.push({
        book_id: bookId,
        chapter_index: currentChapter,
        chapter_title: extractChapterTitle(pages[chapterStart]),
        first_page_index: chapterStart,
        last_page_index: i - 1,
        chapter_hash: hashString(pages.slice(chapterStart, i).join(''))
      })

      currentChapter++
      chapterStart = i
    }
  }

  // Add final chapter
  chapters.push({
    book_id: bookId,
    chapter_index: currentChapter,
    chapter_title: extractChapterTitle(pages[chapterStart]),
    first_page_index: chapterStart,
    last_page_index: pages.length - 1,
    chapter_hash: hashString(pages.slice(chapterStart).join(''))
  })

  // Insert chapters
  if (chapters.length > 0) {
    await supabase
      .from('book_chapters')
      .upsert(chapters, { onConflict: 'book_id,chapter_index' })

    console.log(`Created ${chapters.length} chapters for book ${bookId}`)
  }
}

function extractChapterTitle(pageContent: string): string {
  const lines = pageContent.split('\n').filter(line => line.trim())
  if (lines.length === 0) return 'Untitled Chapter'
  
  // Look for chapter title patterns
  const firstLine = lines[0].trim()
  if (/^(Chapter|CHAPTER)\s+\d+/i.test(firstLine)) {
    return firstLine
  }
  
  // Use first substantial line as title
  return lines.find(line => line.length > 5 && line.length < 100) || 'Untitled Chapter'
}

function hashString(str: string): string {
  // Simple hash for chapter content detection
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(16)
}

function buildChapterPrompt(book: any, chapter: any, slot: number): string {
  const style = "storybook illustration for children"
  const audience = book.level_tags?.includes('KS1') ? 'ages 5-7' : 'ages 7-11'
  const tone = "warm, gentle, and adventurous"
  
  const chapterContext = chapter.chapter_title || `Chapter ${chapter.chapter_index + 1}`
  const slotDescription = slot === 1 ? "opening scene" : "middle scene"
  
  return `${style} for ${audience}: ${tone} ${slotDescription} from "${chapterContext}" in the book "${book.title}" by ${book.author || 'unknown author'}. Safe, educational, no text overlays, no photorealism, colorful and engaging.`
}

async function generateImage(prompt: string) {
  const openAIKey = Deno.env.get('OPENAI_API_KEY')
  if (!openAIKey) {
    throw new Error('OpenAI API key not configured')
  }

  console.log('Calling OpenAI image generation...')
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json'
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const result = await response.json()
  const imageData = result.data[0]
  
  // Convert base64 to bytes
  const base64Data = imageData.b64_json
  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

  return {
    imageBytes,
    costCents: 4.0 // Approximate cost for dall-e-3
  }
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
