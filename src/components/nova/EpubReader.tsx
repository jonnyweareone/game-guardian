import React, { useEffect, useRef } from 'react';
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Simulate page changes for demo purposes
    const interval = setInterval(() => {
      const randomProgress = Math.random().toFixed(2);
      onLocationChange?.(randomProgress);
      
      // Simulate text extraction
      const sampleTexts = [
        "Alice was beginning to get very tired of sitting by her sister on the bank...",
        "The rabbit-hole went straight on like a tunnel for some way...",
        "Alice opened the door and found that it led into a small passage..."
      ];
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      onTextExtracted?.(randomText);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [onLocationChange, onTextExtracted]);

  const handleLoad = () => {
    console.log('EPUB reader loaded:', bookTitle);
    onLocationChange?.('0.0');
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{bookTitle}</h3>
        <p className="text-sm text-muted-foreground">Interactive EPUB Reader</p>
      </div>
      
      <div className="flex-1 p-4">
        <iframe
          ref={iframeRef}
          src={bookUrl}
          className="w-full h-full border rounded-md"
          title={`EPUB Reader - ${bookTitle}`}
          onLoad={handleLoad}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Use arrow keys or click to navigate</span>
          <span>AI Coach is listening</span>
        </div>
      </div>
    </Card>
  );
};