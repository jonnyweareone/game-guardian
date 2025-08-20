import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface EpubReaderProps {
  bookUrl: string;
  bookTitle: string;
  onLocationChange?: (locator: string) => void;
  onTextExtracted?: (text: string) => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({
  bookUrl,
  bookTitle,
  onLocationChange,
  onTextExtracted
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const extractText = useCallback(() => {
    try {
      const contents = renditionRef.current?.getContents?.() || [];
      const text = contents
        .map((c: any) => c.document?.body?.innerText || '')
        .join(' ')
        .trim();
      if (text) {
        onTextExtracted?.(text.slice(0, 500));
      }
    } catch (e) {
      // ignore extraction errors
    }
  }, [onTextExtracted]);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const load = async () => {
      try {
        const { default: ePub } = await import('epubjs');
        if (cancelled) return;

        bookRef.current = ePub(bookUrl);
        renditionRef.current = bookRef.current.renderTo(containerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'auto',
          flow: 'paginated',
        });

        renditionRef.current.display();
        await bookRef.current.ready;
        await bookRef.current.locations.generate(1600);
        onLocationChange?.('0.0');

        renditionRef.current.on('relocated', (location: any) => {
          try {
            const percent = bookRef.current.locations.percentageFromCfi(location.start.cfi);
            if (!isNaN(percent)) {
              onLocationChange?.(percent.toFixed(2));
            }
          } catch {}
          extractText();
        });

        renditionRef.current.on('rendered', () => {
          extractText();
        });
      } catch (e: any) {
        console.error('EPUB load error', e);
        setError('Unable to load EPUB. The source may be blocking access.');
      }
    };

    load();

    return () => {
      cancelled = true;
      try {
        renditionRef.current?.destroy?.();
        bookRef.current?.destroy?.();
      } catch {}
    };
  }, [bookUrl, extractText, onLocationChange]);

  const next = () => renditionRef.current?.next?.();
  const prev = () => renditionRef.current?.prev?.();

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  return (
    <Card className="w-full h-full flex flex-col" onKeyDown={handleKey} tabIndex={0}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{bookTitle}</h3>
        <p className="text-sm text-muted-foreground">Interactive EPUB Reader</p>
      </div>

      <div className="flex-1 p-4">
        {error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <a className="underline" href={bookUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full border rounded-md overflow-hidden" />
        )}
      </div>

      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Use arrow keys or click to navigate</span>
          <div className="flex gap-3">
            <button className="underline" onClick={prev} aria-label="Previous">Prev</button>
            <button className="underline" onClick={next} aria-label="Next">Next</button>
          </div>
        </div>
      </div>
    </Card>
  );
};