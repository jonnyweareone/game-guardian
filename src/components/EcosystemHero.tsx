import React from "react";

interface EcosystemHeroProps {
  title?: string;
  description?: string;
  className?: string;
}

const EcosystemHero: React.FC<EcosystemHeroProps> = ({
  title = "Introducing the Guardian Ecosystem",
  description = "The Guardian Ecosystem is a world-first, fully connected safety network that protects children across every aspect of their digital and gaming life. More than just an app — it’s a complete suite of products working together for 360° safety.",
  className,
}) => {
  return (
    <section
      className={`py-12 md:py-16 bg-card/40 border-t border-b border-border ${className ?? ''}`}
      aria-label="Guardian Ecosystem introduction"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
        <p className="text-lg md:text-xl text-muted-foreground">{description}</p>
        <div className="flex justify-center">
          <div className="rounded-xl border border-border bg-background p-6 w-full">
            {/* SVG diagram reused from HomePage hero ecosystem */}
            <svg
              viewBox="0 0 400 200"
              role="img"
              aria-labelledby="ecosystemTitle ecosystemDesc"
              className="mx-auto w-full max-w-3xl h-48"
            >
              <title id="ecosystemTitle">Guardian Ecosystem Diagram</title>
              <desc id="ecosystemDesc">Guardian OS and the Game Guardian Device connect to deliver 360° safety</desc>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-primary" />
                </marker>
              </defs>
              <circle cx="120" cy="100" r="48" className="stroke-current text-primary fill-transparent" strokeWidth="2" />
              <text x="120" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground text-sm">
                Guardian OS
              </text>
              <circle cx="280" cy="100" r="48" className="stroke-current text-secondary fill-transparent" strokeWidth="2" />
              <text x="280" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground text-sm">
                Device
              </text>
              <path d="M168,100 L232,100" className="stroke-current text-primary" strokeWidth="2" markerEnd="url(#arrow)" />
              <circle cx="200" cy="100" r="80" className="stroke-current text-muted-foreground/50 fill-transparent" strokeDasharray="6 6" strokeWidth="1.5" />
              <text x="200" y="24" textAnchor="middle" className="fill-current text-muted-foreground text-xs">
                360° Safety
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemHero;
