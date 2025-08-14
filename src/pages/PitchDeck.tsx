import { Link, useLocation, useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import EcosystemHero from "@/components/EcosystemHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import deviceImg from "@/assets/guardian-device.png";
import logoImg from "@/assets/guardian-logo.png";

const PitchDeck = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const canonical = `${window.location.origin}${pathname}`;
  const title = "Guardian Pitch – Zero‑Trust, Compliance‑First Safety";
  const description = "Guardian: device, OS, and dashboard for child‑safe gaming. Zero‑trust, compliance‑first.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Guardian Pitch",
    url: canonical,
    description,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` },
        { "@type": "ListItem", position: 2, name: "Pitch" }
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={title}
        description={description}
        keywords="guardian, kids gaming safety, zero-trust, parental controls, esports, COPPA, DSA, Online Safety Act"
        canonicalUrl={canonical}
        ogImage={deviceImg}
        structuredData={jsonLd}
      />

      <header className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Guardian shield logo" className="h-8 w-8" />
            <span className="text-sm text-muted-foreground">Company Pitch</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold">Guardian – Zero‑Trust, Compliance‑First Gaming Safety for Kids</h1>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            We're building the first zero‑trust, compliance‑first gaming and online safety ecosystem designed for children.
            Our mission is to protect kids everywhere they play online, starting with gaming — the largest unregulated
            playground on earth.
          </p>
        </div>
      </header>

      <EcosystemHero />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        {/* Problem */}
        <section aria-labelledby="problem-title">
          <h2 id="problem-title" className="text-2xl md:text-3xl font-semibold">The Problem</h2>
          <p className="mt-3 text-muted-foreground">
            The problem is growing fast. Millions of children face grooming, cyberbullying, and exposure to harmful content in online
            games every day. Existing parental controls are fragmented, reactive, and easy to bypass. There is no unified, global platform
            that keeps kids safe while allowing them to enjoy the social and educational benefits of gaming. The gap between regulatory
            pressure and available solutions is widening, creating a perfect moment for a compliant, scalable platform.
          </p>
        </section>

        {/* Solution */}
        <section aria-labelledby="solution-title">
          <h2 id="solution-title" className="text-2xl md:text-3xl font-semibold">Our Solution: The Guardian Ecosystem</h2>
          <p className="mt-3 text-muted-foreground">
            Three core components, built for global compliance, minimal deployment friction, and scale.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle>Guardian Device</CardTitle>
                <CardDescription>Inline AI monitoring between console/PC and headset.</CardDescription>
              </CardHeader>
              <CardContent>
                <figure className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30">
                  <img src="/lovable-uploads/6ee70be5-bcb2-464c-b22c-1b3f8ac991a5.png" alt="Guardian Device inline hardware with RGB edge lighting" className="w-full h-full object-contain" loading="lazy" />
                </figure>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/products/device')}>Learn more</Button>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle>Guardian OS</CardTitle>
                <CardDescription>Freeware OS launching Q3 2025 for rapid adoption.</CardDescription>
              </CardHeader>
              <CardContent>
                <figure className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30">
                  <img src="/lovable-uploads/85e329b1-1989-4e95-883b-5917e057ba13.png" alt="Guardian OS interface mockup showing child controls" className="w-full h-full object-cover" loading="lazy" />
                </figure>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/products/os-full')}>Learn more</Button>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle>Guardian Dashboard</CardTitle>
                <CardDescription>Real‑time alerts, sentiment, grooming detection, and trends.</CardDescription>
              </CardHeader>
              <CardContent>
                <figure className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30">
                  <img src="/lovable-uploads/07c9596b-e586-4794-be1d-893c1024bf68.png" alt="Guardian parental dashboard UI preview" className="w-full h-full object-cover" loading="lazy" />
                </figure>
                <Button className="mt-4 w-full" onClick={() => navigate('/auth')}>See the dashboard</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Creator Mode */}
        <section aria-labelledby="creator-title">
          <h2 id="creator-title" className="text-2xl md:text-3xl font-semibold">Creator Mode — Safe Creation for Kids</h2>
          <p className="mt-3 text-muted-foreground">
            A safe, moderated environment to record, edit, and share gameplay clips. Includes parental approval workflows and automatic
            redaction of unsafe audio or visuals. Empower creative play while keeping everything age‑appropriate.
          </p>
          <div className="mt-5">
            <Button variant="secondary" onClick={() => navigate('/creator-mode')}>Explore Creator Mode</Button>
          </div>
        </section>

        {/* Go-To-Market & Partners */}
        <section aria-labelledby="gtm-title">
          <h2 id="gtm-title" className="text-2xl md:text-3xl font-semibold">Go‑To‑Market and Partners</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle>Manufacturing & IP</CardTitle>
                <CardDescription>Scalable production with trusted partners.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Patent pending on core technology</li>
                  <li>Build partner: SEI Robotics (trusted by Google & T‑Mobile)</li>
                  <li>Specs in hand; low deployment cost, global addressable market</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle>Compliance & Verification</CardTitle>
                <CardDescription>Aligned with global standards from day one.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Age/ID verification partner: Yoti</li>
                  <li>MVP in beta with working hardware</li>
                  <li>School and edtech integrations underway</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Zero-Trust & Encryption */}
        <section aria-labelledby="zero-trust-title">
          <h2 id="zero-trust-title" className="text-2xl md:text-3xl font-semibold">Zero‑Trust Architecture & End‑to‑End Encryption</h2>
          <div className="mt-3 grid gap-6 md:grid-cols-2 items-start">
            <div>
              <p className="text-muted-foreground">
                Built for Safety, Privacy, and Trust — Guardian is designed from the ground up on zero‑trust principles, meaning no player, session, or connection is trusted by default; every interaction is verified.
              </p>
              <div className="mt-4">
                <h3 className="sr-only">Key Elements</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Identity‑Verified Access:</strong> All users undergo age & ID verification via Yoti before joining a game environment.</li>
                  <li><strong className="text-foreground">Session‑Level Trust:</strong> Every device session is independently authenticated; profile switching triggers automatic reapplication of age‑appropriate policies.</li>
                  <li><strong className="text-foreground">Secure‑by‑Design:</strong> All communications — voice, text, and gameplay telemetry — are protected with end‑to‑end encryption, ensuring no third party (including Guardian) can intercept content without parental consent.</li>
                  <li><strong className="text-foreground">Tamper‑Resistant Hardware:</strong> Guardian Device firmware is locked and signed, preventing modification or bypass.</li>
                  <li><strong className="text-foreground">Safe Play Matching:</strong> Our verified child‑only servers enforce strict entry criteria, preventing any unverified or adult accounts from joining.</li>
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="sr-only">Why It Matters</h3>
                <p className="text-muted-foreground">
                  Zero‑trust combined with encryption ensures that even if a network is compromised, a player's identity, communications, and safety settings remain secure. It creates an environment where parents, educators, and regulators can have complete confidence in every interaction.
                </p>
              </div>
            </div>
            <figure className="aspect-[3/2] overflow-hidden rounded-lg border border-border bg-muted/30">
              <img
                src="/lovable-uploads/dd7adcf2-1480-4676-9d93-db75824ccb5a.png"
                alt="Zero‑Trust and end‑to‑end encryption diagram: identity verification, session trust, encryption, tamper‑resistant hardware, safe play matching"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        {/* Regulations */}
        <section aria-labelledby="reg-title">
          <h2 id="reg-title" className="text-2xl md:text-3xl font-semibold">Regulatory Alignment</h2>
          <p className="mt-3 text-muted-foreground">
            Legislation is tightening worldwide. Guardian is aligned from day one and deployable in any jurisdiction without legal risk.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['UK Online Safety Act','EU Digital Services Act','Australia Online Safety Bill','US COPPA'].map((label) => (
              <div key={label} className="p-4 rounded-md bg-muted border border-border text-sm">{label}</div>
            ))}
          </div>
        </section>

        {/* Market Opportunity */}
        <section aria-labelledby="market-title">
          <h2 id="market-title" className="text-2xl md:text-3xl font-semibold">Market Opportunity</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Growth</CardTitle>
                <CardDescription>Expanding TAM, SAM, and SOM</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">TAM:</strong> $282B (2023) → $666B (2030)</li>
                  <li><strong className="text-foreground">SAM:</strong> $16B → $64B (child‑safe gaming & edutainment)</li>
                  <li><strong className="text-foreground">SOM:</strong> $12–$21B by 2031 (children's safe gaming)</li>
                </ul>
              </CardContent>
            </Card>
            <div className="relative p-6 flex items-center justify-center">
              <div
                aria-hidden
                className="relative h-56 w-56 rounded-full"
                style={{ background: `conic-gradient(hsl(var(--primary)) 0 35%, hsl(var(--safe)) 35% 65%, hsl(var(--warning)) 65% 85%, hsl(var(--secondary)) 85% 100%)` }}
              >
                <div className="absolute inset-6 bg-background rounded-full border border-border" />
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  TAM / SAM / SOM
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commercial Strategy */}
        <section aria-labelledby="strategy-title">
          <h2 id="strategy-title" className="text-2xl md:text-3xl font-semibold">Commercial Strategy</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Bundled distribution with game publishers</li>
            <li>Integrations with edtech platforms and schools</li>
            <li>Branded Safe Esports competitions for community growth</li>
            <li>Aligned sponsorships with child safety and education brands</li>
          </ul>
        </section>

        {/* Funding Ask */}
        <section aria-labelledby="funding-title">
          <h2 id="funding-title" className="text-2xl md:text-3xl font-semibold">Funding</h2>
          <p className="mt-3 text-muted-foreground">
            We are seeking capital to scale marketing, device production, and partner integration. Minimal funds are required for R&D — the
            MVP is complete and patent pending. Funds will amplify awareness, produce hardware at scale, launch the OS globally, and establish
            Safe Esports infrastructure.
          </p>
        </section>

        {/* Vision */}
        <section aria-labelledby="vision-title">
          <h2 id="vision-title" className="text-2xl md:text-3xl font-semibold">Vision</h2>
          <p className="mt-3 text-muted-foreground">
            Guardian will change how children experience gaming and online life — globally, safely, and compliantly. With a strong regulatory
            position, proven build plan, and massive addressable market, we're leading a new category: zero‑trust, compliance‑first gaming for kids.
          </p>
        </section>

        {/* Roadmap */}
        <section aria-labelledby="roadmap-title">
          <h2 id="roadmap-title" className="text-2xl md:text-3xl font-semibold">Roadmap</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-2">
            <li className="rounded-lg border border-border p-4 bg-card/50">
              <p className="text-sm text-muted-foreground">Q3 2025</p>
              <p>Global launch of Guardian OS freeware with PR to accelerate adoption.</p>
            </li>
            <li className="rounded-lg border border-border p-4 bg-card/50">
              <p className="text-sm text-muted-foreground">Q4 2025</p>
              <p>First hardware production run; pilot programs in the UK and Australia with schools, Quaria, and Google Education.</p>
            </li>
            <li className="rounded-lg border border-border p-4 bg-card/50">
              <p className="text-sm text-muted-foreground">Q1–Q2 2026</p>
              <p>Launch verified child‑only gaming servers and the Safe Esports League.</p>
            </li>
            <li className="rounded-lg border border-border p-4 bg-card/50">
              <p className="text-sm text-muted-foreground">Q3 2026</p>
              <p>Bundled offerings with major game subscription services.</p>
            </li>
            <li className="rounded-lg border border-border p-4 bg-card/50 md:col-span-2">
              <p className="text-sm text-muted-foreground">2027</p>
              <p>Brand‑sponsored global Safe Esports tournaments, expanded education programs, and deeper publisher integrations.</p>
            </li>
          </ol>
        </section>

        {/* Founder */}
        <section aria-labelledby="founder-title">
          <h2 id="founder-title" className="text-2xl md:text-3xl font-semibold">Our Founder — Jonny Robinson</h2>
          <p className="mt-3 text-muted-foreground">
            Jonny is a father of four boys (ages 5–13). Personal experiences with his sons' online gaming — seeing risks firsthand and the gap in effective tools — are the reason he built Game Guardian.
          </p>
          <p className="mt-3 text-muted-foreground">
            Previous experience: ZYBRE Internet — a start‑up, trend‑setting ISP focused purely on FTTP that built the UK's first Android Operator Tier Android TV Platform with Google and SEI Robotics, the current build partner for the Game Guardian AI. ZYBRE was sold to Octoplus at the end of 2023.
          </p>
          <blockquote className="mt-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
            "Every child deserves to play, learn, and compete online without fear. Guardian exists to make that non‑negotiable."
          </blockquote>
          <p className="mt-4">
            Read more: <a
              href="https://www.express.co.uk/life-style/science-technology/1599539/Sky-Q-rival-broadband-TV-ZYBRE-gaming"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >Express article featuring Jonny as Sky's rival with ZYBRE</a>.
          </p>
        </section>

        {/* Demo Login CTA */}
        <section aria-labelledby="demo-title" className="border-t border-border pt-10">
          <h2 id="demo-title" className="text-2xl md:text-3xl font-semibold">Try It — Demo Login</h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Jump into a demo account to explore the parent dashboard and alerts. On the next screen, use the "Demo Login" option.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={() => navigate('/auth')}>Go to Sign In</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/products')}>Explore Products</Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PitchDeck;
