
import React from 'react';

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
}

export function PageContent({
  content,
  tokens = [],
  illustration_url,
  illustration_caption,
  illustration_inline_at,
  currentTokenIndex,
  className = ""
}: PageContentProps) {
  if (!tokens.length) {
    // Fallback: render plain content if no tokens
    return (
      <div className={`prose prose-lg prose-invert max-w-[62ch] leading-8 text-[18px] md:text-[20px] ${className}`}>
        {illustration_url && (
          <figure className="my-6 flex justify-center">
            <img 
              src={illustration_url} 
              alt={illustration_caption ?? 'Illustration'} 
              className="max-h-72 rounded shadow" 
            />
            {illustration_caption && (
              <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                {illustration_caption}
              </figcaption>
            )}
          </figure>
        )}
        <div className="whitespace-pre-wrap hyphens-auto">
          {content}
        </div>
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
