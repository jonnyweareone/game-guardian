import { Link, useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
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

      <Navigation />

      <header className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Guardian shield logo" className="h-8 w-8" />
            <span className="text-sm text-muted-foreground">Company Pitch</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold">Guardian – Zero‑Trust, Compliance‑First Gaming Safety for Kids</h1>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            We’re building the first zero‑trust, compliance‑first gaming and online safety ecosystem designed for children.
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
                  <li><strong className="text-foreground">SOM:</strong> $12–$21B by 2031 (children’s safe gaming)</li>
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
            position, proven build plan, and massive addressable market, we’re leading a new category: zero‑trust, compliance‑first gaming for kids.
          </p>
        </section>

        {/* Demo Login CTA */}
        <section aria-labelledby="demo-title" className="border-t border-border pt-10">
          <h2 id="demo-title" className="text-2xl md:text-3xl font-semibold">Try It — Demo Login</h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Jump into a demo account to explore the parent dashboard and alerts. On the next screen, use the “Demo Login” option.
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
