import { useEffect, useRef, useState } from 'react';

export function useTTSHighlight(text: string) {
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const partsRef = useRef<string[]>([]);

  useEffect(() => {
    const parts = text.split(/(?<=[\.!\?])\s+/g).filter(Boolean);
    partsRef.current = parts;
    setActiveIdx(-1);
  }, [text]);

  function speak() {
    if (!('speechSynthesis' in window)) return;
    const parts = partsRef.current;
    let i = -1;
    const next = () => {
      i += 1; 
      if (i >= parts.length) {
        setActiveIdx(-1);
        return;
      }
      setActiveIdx(i);
      const u = new SpeechSynthesisUtterance(parts[i]);
      u.onend = () => setTimeout(next, 80);
      window.speechSynthesis.speak(u);
    };
    next();
  }

  function stop() { 
    window.speechSynthesis.cancel(); 
    setActiveIdx(-1); 
  }

  return { activeIdx, speak, stop, parts: partsRef.current };
}