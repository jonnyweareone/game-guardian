
import React from "react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen">
      <aside className="border-r border-border p-6 bg-muted/30">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/lovable-uploads/guardian-logo2-transparent.png" 
            width="28" 
            height="28" 
            alt="Guardian"
            className="rounded"
          />
          <strong className="text-foreground font-semibold">Guardian OS Docs</strong>
        </div>
        <nav>
          <ul className="space-y-3 list-none p-0 m-0">
            <li><a href="/docs/getting-started" className="text-muted-foreground hover:text-foreground transition-colors">Getting Started</a></li>
            <li><a href="/docs/install" className="text-muted-foreground hover:text-foreground transition-colors">Installation</a></li>
            <li><a href="/docs/reflex-desktop" className="text-muted-foreground hover:text-foreground transition-colors">Reflex Desktop</a></li>
            <li><a href="/docs/store" className="text-muted-foreground hover:text-foreground transition-colors">Guardian Store</a></li>
            <li><a href="/docs/updates" className="text-muted-foreground hover:text-foreground transition-colors">Updates & Sync</a></li>
            <li><a href="/docs/parental-controls" className="text-muted-foreground hover:text-foreground transition-colors">Parental Controls</a></li>
            <li><a href="/docs/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
          </ul>
        </nav>
        <div className="mt-6 text-xs text-muted-foreground">
          Safe by default • NextDNS built-in
        </div>
      </aside>
      <main className="p-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
