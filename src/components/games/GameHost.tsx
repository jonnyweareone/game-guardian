import React from 'react';
import GameFrame from './GameFrame';

interface GameHostProps {
  gameName: string;
  launchUrl: string;
  shimSrc?: string;
  bearerToken: string;
}

export default function GameHost({ gameName, launchUrl, shimSrc, bearerToken }: GameHostProps) {
  return (
    <div className="h-[78vh] rounded-xl border border-border overflow-hidden bg-background">
      <GameFrame 
        src={launchUrl} 
        bearerToken={bearerToken} 
        gameName={gameName}
        shimSrc={shimSrc}
      />
    </div>
  );
}