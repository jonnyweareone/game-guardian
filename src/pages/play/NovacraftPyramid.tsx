import React from 'react';
import GameHost from "@/components/games/GameHost";

interface NovacraftPyramidProps {
  bearerToken?: string;
}

export default function NovacraftPyramid({ bearerToken }: NovacraftPyramidProps) {
  // Extract token from URL if not provided via props
  const urlParams = new URLSearchParams(window.location.search);
  const token = bearerToken || urlParams.get('token') || "";
  return (
    <div className="p-4">
      <GameHost
        gameName="NovaCraft"
        launchUrl="/vendor/novacraft/pyramid/index.html"
        shimSrc="/shims/novacraft-pyramid.js"
        bearerToken={token}
      />
      <p className="mt-3 text-sm text-muted-foreground">
        Tip: Reach the golden capstone. Answer quiz gates to open doors. Avoid lava!
      </p>
    </div>
  );
}