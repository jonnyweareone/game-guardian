import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated text cleaning function
function cleanGutenbergText(rawText: string): string {
  let text = rawText;
  
  // Remove Gutenberg header/footer
  const startMatch = text.match(/\*\*\* START OF (?:THE |THIS )?PROJECT GUTENBERG EBOOK[^\n]*\n/i);
  const endMatch = text.match(/\*\*\* END OF (?:THE |THIS )?PROJECT GUTENBERG EBOOK[^\n]*/i);
  
  if (startMatch) {
    const startIndex = text.indexOf(startMatch[0]) + startMatch[0].length;
    text = text.substring(startIndex);
  }
  
  if (endMatch) {
    const endIndex = text.indexOf(endMatch[0]);
    if (endIndex > 0) text = text.substring(0, endIndex);
  }
  
  // Remove table of contents section
  text = text.replace(/^CONTENTS?\s*$[\s\S]*?(?=^(?:CHAPTER|Chapter|I\.|1\.|\d+\.))/m, '');
  
  // Normalize whitespace but preserve paragraph breaks
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return text;
}

function isChapterHeader(line: string): boolean {
  const trimmed = line.trim();
  return /^(?:CHAPTER|Chapter)\s+[IVXLCDM\d]+(?:\.|:|\s|$)/i.test(trimmed) ||
         /^[IVXLCDM]+\.\s+/i.test(trimmed) ||
         /^(?:PART|Part)\s+[IVXLCDM\d]+/i.test(trimmed);
}

function isFrontMatter(line: string): boolean {
  const trimmed = line.trim().toUpperCase();
  return ['PREFACE', 'FOREWORD', 'INTRODUCTION', 'CONTENTS', 'DEDICATION', 'ACKNOWLEDGMENTS'].includes(trimmed);
}

function extractChapterTitle(line: string): string {
  return line.trim().replace(/^\s*(?:CHAPTER|Chapter)\s+/i, '');
}

// Illustration marker utilities
const ILLU_MARKER_RE = /\[\s*(?:illustration|illustrations)\s*:?\s*(?:["""]?)([^"\]\)]*)?(?:["""]?)\s*\]?/ig;

function stripIllustrationMarkers(raw: string) {
  let caption: string | null = null;
  let insertAtChar: number | null = null;

  const cleaned = raw.replace(ILLU_MARKER_RE, (m, cap, offset) => {
    if (caption == null && cap) caption = cap.trim();
    if (insertAtChar == null) insertAtChar = offset;  // remember first marker on the page
    return ""; // remove from text completely
  });

  return { cleaned, caption, insertAtChar };
}

// Simple tokenizer
function tokenize(text: string): Array<{w: string, s: number, e: number}> {
  const tokens: Array<{w: string, s: number, e: number}> = [];
  const words = text.match(/\S+/g) || [];
  let currentIndex = 0;
  
  for (const word of words) {
    const start = text.indexOf(word, currentIndex);
    const end = start + word.length;
    
    tokens.push({
      w: word,
      s: start,
      e: end
    });
    
    currentIndex = end;
  }
  
  return tokens;
}

function charToTokenIdx(tokens: {s: number, e: number}[], pos: number | null): number | null {
  if (pos == null) return null;
  for (let i = 0; i < tokens.length; i++) {
    if (pos <= tokens[i].e) return i;
  }
  return tokens.length ? tokens.length - 1 : null;
}

// Enhanced paginate function with chapter detection and illustration handling
function paginateContent(cleanText: string, wordsPerPage = 250): Array<{
  content: string;
  tokens: Array<{w: string, s: number, e: number}>;
  illustration_caption?: string;
  illustration_inline_at?: number;
  is_front_matter: boolean;
  chapter_index?: number;
  chapter_title?: string;
}> {
  const paragraphs = cleanText.split('\n\n').filter(p => p.trim());
  const pages: Array<any> = [];
  
  let currentPage = '';
  let currentWordCount = 0;
  let currentChapterIndex = 0;
  let currentChapterTitle = '';
  let isInFrontMatter = true;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;
    
    const firstLine = paragraph.split('\n')[0];
    
    // Check if this is a chapter header
    if (isChapterHeader(firstLine)) {
      // Save current page if it has content
      if (currentPage.trim()) {
        const { cleaned, caption, insertAtChar } = stripIllustrationMarkers(currentPage);
        const tokens = tokenize(cleaned);
        const inlineAt = charToTokenIdx(tokens, insertAtChar);
        
        pages.push({
          content: cleaned,
          tokens,
          illustration_caption: caption || undefined,
          illustration_inline_at: inlineAt || undefined,
          is_front_matter: isInFrontMatter,
          chapter_index: isInFrontMatter ? undefined : currentChapterIndex,
          chapter_title: isInFrontMatter ? undefined : currentChapterTitle
        });
      }
      
      // Start new chapter
      isInFrontMatter = false;
      currentChapterIndex++;
      currentChapterTitle = extractChapterTitle(firstLine);
      currentPage = '';
      currentWordCount = 0;
      continue;
    }
    
    // Check if this is front matter
    if (isFrontMatter(firstLine)) {
      isInFrontMatter = true;
    }
    
    const words = paragraph.split(/\s+/).length;
    
    // If adding this paragraph would exceed the word limit, save current page
    if (currentWordCount + words > wordsPerPage && currentPage.trim()) {
      const { cleaned, caption, insertAtChar } = stripIllustrationMarkers(currentPage);
      const tokens = tokenize(cleaned);
      const inlineAt = charToTokenIdx(tokens, insertAtChar);
      
      pages.push({
        content: cleaned,
        tokens,
        illustration_caption: caption || undefined,
        illustration_inline_at: inlineAt || undefined,
        is_front_matter: isInFrontMatter,
        chapter_index: isInFrontMatter ? undefined : currentChapterIndex,
        chapter_title: isInFrontMatter ? undefined : currentChapterTitle
      });
      
      currentPage = paragraph;
      currentWordCount = words;
    } else {
      currentPage += (currentPage ? '\n\n' : '') + paragraph;
      currentWordCount += words;
    }
  }
  
  // Add final page if there's content
  if (currentPage.trim()) {
    const { cleaned, caption, insertAtChar } = stripIllustrationMarkers(currentPage);
    const tokens = tokenize(cleaned);
    const inlineAt = charToTokenIdx(tokens, insertAtChar);
    
    pages.push({
      content: cleaned,
      tokens,
      illustration_caption: caption || undefined,
      illustration_inline_at: inlineAt || undefined,
      is_front_matter: isInFrontMatter,
      chapter_index: isInFrontMatter ? undefined : currentChapterIndex,
      chapter_title: isInFrontMatter ? undefined : currentChapterTitle
    });
  }
  
  return pages;
}

async function processIngestJob(supabase: any, job: any) {
  console.log(`Ingesting book ${job.book_id} from ${job.payload.source}`);
  
  let sourceUrl = job.payload.source_url;
  if (job.payload.source === 'gutenberg' && job.payload.gutenberg_id) {
    sourceUrl = `https://www.gutenberg.org/cache/epub/${job.payload.gutenberg_id}/pg${job.payload.gutenberg_id}.txt`;
  }
  
  console.log(`Fetching content from: ${sourceUrl}`);
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  
  const rawText = await response.text();
  const cleanText = cleanGutenbergText(rawText);
  const pages = paginateContent(cleanText);
  
  console.log(`Split into ${pages.length} pages`);
  
  // Clear existing pages
  await supabase.from('book_pages').delete().eq('book_id', job.book_id);
  
  // Insert new pages with enhanced metadata
  const batchSize = 20;
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize).map((page, idx) => ({
      book_id: job.book_id,
      page_index: i + idx,
      content: page.content,
      tokens: page.tokens,
      illustration_caption: page.illustration_caption,
      illustration_inline_at: page.illustration_inline_at,
      is_front_matter: page.is_front_matter,
      chapter_index: page.chapter_index,
      chapter_title: page.chapter_title
    }));
    
    const { error } = await supabase.from('book_pages').insert(batch);
    if (error) throw error;
  }
  
  // Update book status
  await supabase.from('books').update({
    ingested: true,
    ingested_at: new Date().toISOString(),
    pages: pages.length
  }).eq('id', job.book_id);
  
  console.log(`Book ${job.book_id} ingested successfully with ${pages.length} pages`);
  
  // Queue illustration job for pages with markers
  const pagesWithIllustrations = pages
    .map((page, index) => ({ ...page, page_index: index }))
    .filter(page => page.illustration_caption);
    
  if (pagesWithIllustrations.length > 0) {
    await supabase.from('nova_jobs').insert({
      book_id: job.book_id,
      type: 'illustrate_markers',
      payload: { pages: pagesWithIllustrations },
      status: 'queued'
    });
    console.log(`Queued illustration job for ${pagesWithIllustrations.length} pages with markers`);
  }
  
  // Queue analysis job (for first read analysis)
  await supabase.from('nova_jobs').insert({
    book_id: job.book_id,
    type: 'analyze',
    payload: {},
    status: 'queued'
  });
}

// Add new job processor for marker-based illustrations
async function processIllustrateMarkersJob(supabase: any, job: any) {
  console.log(`Processing illustration markers for book ${job.book_id}`);
  
  const { data: book } = await supabase
    .from('books')
    .select('title, author')
    .eq('id', job.book_id)
    .single();
    
  if (!book) throw new Error('Book not found');
  
  const pages = job.payload.pages || [];
  
  for (const pageData of pages) {
    if (!pageData.illustration_caption) continue;
    
    // Build a kid-safe prompt
    const scene = pageData.content.slice(0, 160).replace(/\s+/g, ' ');
    const prompt = [
      `Storybook illustration for children ages 7-11:`,
      `"${pageData.illustration_caption}"`,
      `From "${book.title}" by ${book.author}.`,
      `Scene: ${scene}`,
      `Style: warm, gentle, colorful, educational, no text overlays`
    ].join(' ');
    
    console.log(`Generating illustration for page ${pageData.page_index}: ${pageData.illustration_caption}`);
    
    try {
      // Call OpenAI DALL-E (or your preferred image API)
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      });
      
      if (!imageResponse.ok) {
        console.error(`Failed to generate image: ${imageResponse.status}`);
        continue;
      }
      
      const imageData = await imageResponse.json();
      const imageUrl = imageData.data[0]?.url;
      
      if (imageUrl) {
        // Update the page with the generated image URL
        await supabase.from('book_pages').update({
          illustration_url: imageUrl,
          illustration_prompt: prompt
        }).eq('book_id', job.book_id).eq('page_index', pageData.page_index);
        
        console.log(`Generated and assigned illustration for page ${pageData.page_index}`);
      }
    } catch (error) {
      console.error(`Failed to generate illustration for page ${pageData.page_index}:`, error);
    }
  }
  
  console.log(`Completed illustration generation for book ${job.book_id}`);
}

async function processAnalyzeJob(supabase: any, job: any) {
  console.log(`Analyzing book ${job.book_id}`);
  
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', job.book_id)
    .single();
    
  if (!book) throw new Error('Book not found');
  
  const { data: pages } = await supabase
    .from('book_pages')
    .select('content')
    .eq('book_id', job.book_id)
    .order('page_index');
    
  if (!pages || pages.length === 0) {
    throw new Error('No pages found for analysis');
  }
  
  const fullText = pages.map(p => p.content).join('\n\n');
  const wordCount = fullText.split(/\s+/).length;
  
  // Simple analysis - in production you'd use AI here
  const readingLevel = wordCount > 50000 ? 'Advanced' : 
                      wordCount > 20000 ? 'Intermediate' : 'Beginner';
  
  const estimatedMinutes = Math.ceil(wordCount / 200); // ~200 WPM reading speed
  
  await supabase.from('books').update({
    word_count: wordCount,
    reading_level: readingLevel,
    estimated_minutes: estimatedMinutes,
    analyzed: true,
    analyzed_at: new Date().toISOString()
  }).eq('id', job.book_id);
  
  console.log(`Book ${job.book_id} analyzed: ${wordCount} words, ${readingLevel} level, ~${estimatedMinutes} minutes`);
}

async function processIllustrateJob(supabase: any, job: any) {
  console.log(`Generating illustrations for book ${job.book_id}`);
  
  const { data: book } = await supabase
    .from('books')
    .select('title, author')
    .eq('id', job.book_id)
    .single();
    
  if (!book) throw new Error('Book not found');
  
  const { data: pages } = await supabase
    .from('book_pages')
    .select('page_index, content')
    .eq('book_id', job.book_id)
    .is('illustration_url', null)
    .order('page_index')
    .limit(5); // Limit to 5 illustrations per job
    
  if (!pages || pages.length === 0) {
    console.log('No pages need illustrations');
    return;
  }
  
  for (const page of pages) {
    const scene = page.content.slice(0, 200).replace(/\s+/g, ' ');
    const prompt = `Children's book illustration: ${scene}. From "${book.title}" by ${book.author}. Style: warm, colorful, educational.`;
    
    console.log(`Generating illustration for page ${page.page_index}`);
    
    try {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      });
      
      if (!imageResponse.ok) {
        console.error(`Failed to generate image: ${imageResponse.status}`);
        continue;
      }
      
      const imageData = await imageResponse.json();
      const imageUrl = imageData.data[0]?.url;
      
      if (imageUrl) {
        await supabase.from('book_pages').update({
          illustration_url: imageUrl,
          illustration_prompt: prompt
        }).eq('book_id', job.book_id).eq('page_index', page.page_index);
        
        console.log(`Generated illustration for page ${page.page_index}`);
      }
    } catch (error) {
      console.error(`Failed to generate illustration for page ${page.page_index}:`, error);
    }
  }
}

async function processIllustrateSlotJob(supabase: any, job: any) {
  console.log(`Processing slot illustration job for book ${job.book_id}`);
  
  const { book_id, chapter_index, slot = 2 } = job.payload;
  
  const { data: book } = await supabase
    .from('books')
    .select('title, author')
    .eq('id', book_id)
    .single();
    
  if (!book) throw new Error('Book not found');
  
  // Find pages in this chapter that don't have slot 2 illustrations
  const { data: pages } = await supabase
    .from('book_pages')
    .select('page_index, content, chapter_title')
    .eq('book_id', book_id)
    .eq('chapter_index', chapter_index)
    .is(`illustration_slot_${slot}_url`, null)
    .order('page_index')
    .limit(3);
    
  if (!pages || pages.length === 0) {
    console.log(`No pages in chapter ${chapter_index} need slot ${slot} illustrations`);
    return;
  }
  
  for (const page of pages) {
    const scene = page.content.slice(0, 200).replace(/\s+/g, ' ');
    const chapterTitle = page.chapter_title || `Chapter ${chapter_index}`;
    const prompt = `Children's book illustration for ${chapterTitle}: ${scene}. From "${book.title}" by ${book.author}. Style: warm, colorful, educational, storybook art.`;
    
    console.log(`Generating slot ${slot} illustration for page ${page.page_index}`);
    
    try {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      });
      
      if (!imageResponse.ok) {
        console.error(`Failed to generate slot ${slot} image: ${imageResponse.status}`);
        continue;
      }
      
      const imageData = await imageResponse.json();
      const imageUrl = imageData.data[0]?.url;
      
      if (imageUrl) {
        const updateData: any = {};
        updateData[`illustration_slot_${slot}_url`] = imageUrl;
        updateData[`illustration_slot_${slot}_prompt`] = prompt;
        
        await supabase.from('book_pages').update(updateData)
          .eq('book_id', book_id)
          .eq('page_index', page.page_index);
        
        console.log(`Generated slot ${slot} illustration for page ${page.page_index}`);
      }
    } catch (error) {
      console.error(`Failed to generate slot ${slot} illustration for page ${page.page_index}:`, error);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Nova job worker starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Poll for jobs
    const { data: jobs, error } = await supabase
      .from('nova_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(3);

    if (error) {
      console.error('Error fetching jobs:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    for (const job of jobs || []) {
      try {
        console.log(`Processing job ${job.id} (${job.type}) for book ${job.book_id}`);

        // Mark as processing
        await supabase.from('nova_jobs').update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        }).eq('id', job.id);

        switch (job.type) {
          case 'ingest':
            await processIngestJob(supabase, job);
            break;
          case 'analyze':
            await processAnalyzeJob(supabase, job);
            break;
          case 'illustrate':
            await processIllustrateJob(supabase, job);
            break;
          case 'illustrate_slot':
            await processIllustrateSlotJob(supabase, job);
            break;
          case 'illustrate_markers':
            await processIllustrateMarkersJob(supabase, job);
            break;
          default:
            throw new Error(`Unknown job type: ${job.type}`);
        }

        // Mark as completed
        await supabase.from('nova_jobs').update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        }).eq('id', job.id);

        console.log(`Job ${job.id} completed successfully`);
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        await supabase.from('nova_jobs').update({ 
          status: 'error',
          error: String(error?.message || error),
          completed_at: new Date().toISOString()
        }).eq('id', job.id);
      }
    }

    return new Response(JSON.stringify({ processed: jobs?.length || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ error: 'Worker failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
