
import React from 'react';
import InlineIllustration from './InlineIllustration';
import { useTTSHighlight } from '@/hooks/useTTSHighlight';

interface Token {
  w: string;
  s: number;
  e: number;
}

interface PageContentProps {
  content: string;
  tokens?: Token[];
  illustration_url?: string;
  illustration_caption?: string;
  illustration_inline_at?: number;
  currentTokenIndex?: number;
  className?: string;
  simpleHighlight?: boolean; // New prop for sentence highlighting
}

export function PageContent({
  content,
  tokens = [],
  illustration_url,
  illustration_caption,
  illustration_inline_at,
  currentTokenIndex,
  className = "",
  simpleHighlight = false
}: PageContentProps) {
  // Remove [Illustration: ...] markers from visible text
  const ILLU_RE = /\[\s*(?:illustration|illustrations)\s*:?\s*[""]?([^"\]]*)[""]?\s*\]/ig;
  const cleaned = content.replace(ILLU_RE, '');
  
  // Sentence-level highlight hook
  const { parts, activeIdx } = useTTSHighlight(cleaned);
  if (!tokens.length || simpleHighlight) {
    // Fallback: render plain content with optional sentence highlighting
    return (
      <div className={`prose prose-lg prose-invert max-w-[62ch] leading-8 text-[18px] md:text-[20px] ${className}`}>
        <InlineIllustration url={illustration_url} caption={illustration_caption} />
        
        {simpleHighlight && parts.length ? (
          <div className="whitespace-pre-wrap hyphens-auto">
            {parts.map((sentence, i) => (
              <span
                key={i}
                className={i === activeIdx ? 'bg-primary/20 rounded px-0.5' : undefined}
              >
                {sentence}{' '}
              </span>
            ))}
          </div>
        ) : (
          <div className="whitespace-pre-wrap hyphens-auto">
            {cleaned}
          </div>
        )}
      </div>
    );
  }

  const nodes: React.ReactNode[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    // Insert illustration at the specified token index
    if (illustration_url && illustration_inline_at === i) {
      nodes.push(
        <figure key={`fig-${i}`} className="my-6 flex flex-col items-center">
          <img 
            src={illustration_url} 
            alt={illustration_caption ?? 'Illustration'} 
            className="max-h-72 rounded shadow" 
          />
          {illustration_caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              {illustration_caption}
            </figcaption>
          )}
        </figure>
      );
    }
    
    const token = tokens[i];
    const isHighlighted = currentTokenIndex === i;
    
    nodes.push(
      <span
        key={i}
        data-token-index={i}
        className={isHighlighted ? "bg-primary/25 rounded px-0.5 transition-colors" : ""}
      >
        {content.slice(token.s, token.e)}
      </span>
    );
    
    // Add space after token (except for punctuation)
    if (i < tokens.length - 1 && !token.w.match(/[.,!?;:]/)) {
      nodes.push(<span key={`sp-${i}`}> </span>);
    }
  }

  return (
    <div className={`prose prose-lg prose-invert max-w-[62ch] leading-8 text-[18px] md:text-[20px] hyphens-auto ${className}`}>
      {nodes}
    </div>
  );
}
