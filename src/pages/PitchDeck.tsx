import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEOHead from "@/components/SEOHead";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import deviceImg from "@/assets/guardian-device.png";
import logoImg from "@/assets/guardian-logo.png";
import osImg from "@/assets/gaming-headset-ai.png";

const PitchDeck = () => {
  const { pathname } = useLocation();
  const canonical = `${window.location.origin}${pathname}`;
  const title = "Guardian Pitch Deck – Zero-Trust Gaming Safety";
  const description = "Guardian protects kids in gaming with zero-trust devices, OS, and AI dashboards.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Guardian",
    url: canonical,
    logo: logoImg,
    sameAs: [
      `${window.location.origin}/products/device`,
      `${window.location.origin}/products/os-full`,
      `${window.location.origin}/dashboard`,
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={title}
        description={description}
        keywords="guardian, kids gaming safety, zero-trust, parental controls, esports, COPPA"
        canonicalUrl={canonical}
        ogImage={deviceImg}
        structuredData={jsonLd}
      />

      <Navigation />

      <header className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-safe to-warning" aria-hidden="true" />
        <div className="sr-only">
          <h1>Guardian – Zero-Trust Gaming & Online Safety for Kids</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section aria-label="Guardian Pitch Deck" className="relative">
          <div className="absolute left-0 top-0 z-10 flex items-center gap-2">
            <img src={logoImg} alt="Guardian shield logo" className="h-8 w-8" />
            <span className="text-sm text-muted-foreground">Pitch Deck</span>
          </div>

          <Carousel className="mt-10">
            <CarouselContent>
              {/* Slide 1 – Cover */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">Guardian</h2>
                    <p className="text-lg text-muted-foreground">Zero-Trust Gaming & Online Safety for Kids</p>
                    <Link to="/" className="inline-flex items-center gap-2 text-primary story-link">
                      Visit homepage
                    </Link>
                  </div>
                  <Link to="/" className="justify-self-center">
                    <img src={deviceImg} alt="Guardian device mockup with LED glow" className="w-full max-w-md rounded-lg shadow-xl hover-scale" />
                  </Link>
                </article>
              </CarouselItem>

              {/* Slide 2 – Problem */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">The Growing Threat to Kids in Gaming</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Grooming, cyberbullying, and harmful content</li>
                      <li>Parental controls are fragmented and reactive</li>
                      <li>No compliance-first global safety platform</li>
                    </ul>
                  </div>
                  <div className="justify-self-center">
                    <img src={osImg} loading="lazy" alt="Child gaming scene with AI danger alert overlay" className="w-full max-w-md rounded-lg shadow-xl" />
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 3 – Solution Overview */}
              <CarouselItem>
                <article className="grid md:grid-cols-3 gap-6 items-start">
                  <Link to="/products/device" className="group">
                    <img src={deviceImg} loading="lazy" alt="Guardian Device – inline AI monitor" className="rounded-lg shadow-xl group-hover:opacity-90 transition" />
                    <p className="mt-2 text-sm text-muted-foreground">Guardian Device</p>
                  </Link>
                  <Link to="/products/os-full" className="group">
                    <img src={osImg} loading="lazy" alt="Guardian OS – freeware for instant adoption" className="rounded-lg shadow-xl group-hover:opacity-90 transition" />
                    <p className="mt-2 text-sm text-muted-foreground">Guardian OS</p>
                  </Link>
                  <Link to="/dashboard" className="group">
                    <img src={osImg} loading="lazy" alt="Guardian Dashboard – parental insights and alerts" className="rounded-lg shadow-xl group-hover:opacity-90 transition" />
                    <p className="mt-2 text-sm text-muted-foreground">Guardian Dashboard</p>
                  </Link>
                </article>
              </CarouselItem>

              {/* Slide 4 – Creator Mode */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Creator Mode</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Safe, moderated content creation for kids</li>
                      <li>Parental approval workflows</li>
                      <li>Auto-redaction of unsafe material</li>
                    </ul>
                  </div>
                  <div className="justify-self-center">
                    <img src={osImg} loading="lazy" alt="Creator Mode UI mockup" className="w-full max-w-md rounded-lg shadow-xl" />
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 5 – Traction & Readiness */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Traction & Readiness</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>MVP in beta with hardware working</li>
                      <li>Manufacturing partner: SEI Robotics</li>
                      <li>Patent pending</li>
                      <li>Yoti integration for age/ID verification</li>
                      <li>Active partner talks with UK & AU edtech + Google Education</li>
                    </ul>
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 6 – Roadmap */}
              <CarouselItem>
                <article>
                  <h3 className="text-2xl font-semibold mb-6">Roadmap</h3>
                  <ol className="grid gap-4 md:grid-cols-2">
                    <li className="rounded-lg border border-border p-4 bg-card/50">
                      <p className="text-sm text-muted-foreground">Q3 2025</p>
                      <p>OS freeware release & global PR launch</p>
                    </li>
                    <li className="rounded-lg border border-border p-4 bg-card/50">
                      <p className="text-sm text-muted-foreground">Q4 2025</p>
                      <p>First hardware production run, UK & AU pilot deployments</p>
                    </li>
                    <li className="rounded-lg border border-border p-4 bg-card/50">
                      <p className="text-sm text-muted-foreground">Q1–Q2 2026</p>
                      <p>Child-only gaming servers & verified Safe Esports league</p>
                    </li>
                    <li className="rounded-lg border border-border p-4 bg-card/50">
                      <p className="text-sm text-muted-foreground">Q3 2026</p>
                      <p>Bundling with major game subscriptions</p>
                    </li>
                    <li className="rounded-lg border border-border p-4 bg-card/50 md:col-span-2">
                      <p className="text-sm text-muted-foreground">2027</p>
                      <p>Global Safe Esports tournaments, expanded school programs, deeper publisher integrations</p>
                    </li>
                  </ol>
                </article>
              </CarouselItem>

              {/* Slide 7 – Regulations & Compliance */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Riding the Regulatory Tailwind</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>UK Online Safety Act</li>
                      <li>EU Digital Services Act</li>
                      <li>Australia Online Safety Bill</li>
                      <li>COPPA (US) & global child protection laws</li>
                    </ul>
                    <p className="mt-3 text-muted-foreground">Positioned as the first global, compliant, zero-trust kids’ gaming solution.</p>
                  </div>
                  <div className="rounded-lg border border-border p-6 bg-card/50">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-md bg-muted">UK</div>
                      <div className="p-4 rounded-md bg-muted">EU</div>
                      <div className="p-4 rounded-md bg-muted">AU</div>
                      <div className="p-4 rounded-md bg-muted">US</div>
                    </div>
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 8 – Market Opportunity (TAM/SAM/SOM) */}
              <CarouselItem>
                <article>
                  <h3 className="text-2xl font-semibold mb-6">Market Opportunity</h3>
                  <div className="relative mx-auto aspect-square max-w-md">
                    <div className="absolute inset-0 m-auto h-full w-full rounded-full border-4" style={{ borderColor: "hsl(var(--primary))" }} />
                    <div className="absolute inset-6 m-auto h-[85%] w-[85%] rounded-full border-4" style={{ borderColor: "hsl(var(--safe))" }} />
                    <div className="absolute inset-12 m-auto h-[70%] w-[70%] rounded-full border-4" style={{ borderColor: "hsl(var(--warning))" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ul className="text-center text-sm text-muted-foreground space-y-1">
                        <li><strong className="text-foreground">TAM</strong>: $282B → $666B by 2030</li>
                        <li><strong className="text-foreground">SAM</strong>: $16B → $64B child-safe gaming</li>
                        <li><strong className="text-foreground">SOM</strong>: $12B–$21B by 2031</li>
                      </ul>
                    </div>
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 9 – Competitive Advantage */}
              <CarouselItem>
                <article>
                  <h3 className="text-2xl font-semibold mb-6">Competitive Advantage</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted text-left">
                          <th className="p-3">Capability</th>
                          <th className="p-3">Guardian</th>
                          <th className="p-3">Traditional Controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Zero-trust verified players", "Yes", "No"],
                          ["Compliance baked-in globally", "Yes", "Partial"],
                          ["Low deployment cost", "Yes", "Mixed"],
                          ["Freeware OS growth", "Yes", "No"],
                          ["Deep edu/game partnerships", "Yes", "Limited"],
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="p-3">{row[0]}</td>
                            <td className="p-3">{row[1]}</td>
                            <td className="p-3">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 10 – Partnerships */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-6 items-start">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Partnerships</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>EdTech: Quaria, Google Education, UK school networks</li>
                      <li>Game Publishers: Bundles with subscriptions</li>
                      <li>Safe Esports: Branded kids-only tournaments</li>
                      <li>Brand Sponsorships: Safe competitive gaming</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border p-6 bg-card/50 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-md bg-muted">Logo</div>
                    <div className="p-3 rounded-md bg-muted">Logo</div>
                    <div className="p-3 rounded-md bg-muted">Logo</div>
                    <div className="p-3 rounded-md bg-muted">Logo</div>
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 11 – Dashboard & Monitoring */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Dashboard & Monitoring</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Grooming detection & redaction</li>
                      <li>Cyberbullying alerts</li>
                      <li>Emotional trend analysis</li>
                      <li>Positive behavior recognition</li>
                    </ul>
                  </div>
                  <div className="justify-self-center">
                    <img src={osImg} loading="lazy" alt="Guardian dashboard preview" className="w-full max-w-md rounded-lg shadow-xl" />
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 12 – Funding & Use of Proceeds */}
              <CarouselItem>
                <article>
                  <h3 className="text-2xl font-semibold mb-6">Funding & Use of Proceeds</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-border p-6 bg-card/50">
                      <p className="text-muted-foreground">Capital Needed: [insert amount]</p>
                      <ul className="list-disc pl-5 space-y-2 mt-2 text-muted-foreground">
                        <li>Marketing to parents, schools, platforms</li>
                        <li>Scaling production</li>
                        <li>Minimal R&D (MVP complete)</li>
                        <li>Gaming server & esports league launch</li>
                      </ul>
                    </div>
                    <div className="relative p-6 flex items-center justify-center">
                      {/* Simple donut using borders and conics to avoid extra deps */}
                      <div className="relative h-48 w-48 rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) 0 35%, hsl(var(--safe)) 35% 65%, hsl(var(--warning)) 65% 85%, hsl(var(--secondary)) 85% 100%)` }}>
                        <div className="absolute inset-6 bg-background rounded-full border border-border" />
                      </div>
                    </div>
                  </div>
                </article>
              </CarouselItem>

              {/* Slide 13 – Vision */}
              <CarouselItem>
                <article className="grid md:grid-cols-2 gap-8 items-center">
                  <blockquote className="text-xl md:text-2xl font-semibold leading-relaxed">
                    “Guardian will change how children experience gaming and online life — globally, safely, and compliantly.”
                  </blockquote>
                  <div className="justify-self-center">
                    <img src={deviceImg} loading="lazy" alt="Hero device glowing in dark" className="w-full max-w-md rounded-lg shadow-xl" />
                  </div>
                </article>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-12" />
            <CarouselNext className="-right-4 md:-right-12" />
          </Carousel>
        </section>
      </main>
    </div>
  );
};

export default PitchDeck;
