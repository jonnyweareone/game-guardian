import React, { useEffect, useRef } from 'react';

interface GameFrameProps {
  src: string;
  bearerToken: string;
  gameName: string;
  shimSrc?: string;
}

export default function GameFrame({ src, bearerToken, gameName, shimSrc }: GameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Inject Nova Game SDK
        const sdkScript = iframeDoc.createElement('script');
        sdkScript.src = '/nova-game.js';
        sdkScript.onload = () => {
          // Initialize SDK with bearer token
          const iframeWindow = iframe.contentWindow as any;
          if (iframeWindow?.NovaGame) {
            iframeWindow.NovaGame.init({ bearerToken });
          }
        };
        iframeDoc.head.appendChild(sdkScript);

        // Inject shim if provided
        if (shimSrc) {
          const shimScript = iframeDoc.createElement('script');
          shimScript.src = shimSrc;
          iframeDoc.head.appendChild(shimScript);
        }
      } catch (error) {
        console.error('Failed to inject scripts into game iframe:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [bearerToken, shimSrc]);

  // Listen for postMessage events from games
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NovaGameEvent') {
        // Forward to Nova Game SDK
        fetch('https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/nova-game-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
          },
          body: JSON.stringify({
            game_name: gameName,
            ...event.data.payload
          })
        }).catch(error => console.error('Failed to forward game event:', error));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [bearerToken, gameName]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      sandbox="allow-scripts allow-pointer-lock allow-downloads"
      referrerPolicy="no-referrer"
      style={{ width: '100%', height: '100%', border: 0 }}
      className="rounded-lg"
    />
  );
}