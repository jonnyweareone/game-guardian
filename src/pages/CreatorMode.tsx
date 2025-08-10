import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Play, Wand2, Mic, Eye, ArrowRight } from "lucide-react";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does this slow down games?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No—capture and AI processing run with low‑latency paths designed for gaming."
      }
    },
    {
      "@type": "Question",
      "name": "Can my child publish without my approval?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only if you enable “self‑publish”. Default is parent approval required."
      }
    },
    {
      "@type": "Question",
      "name": "Which platforms are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Works with leading consoles and PCs. YouTube/Twitch integrations included."
      }
    },
    {
      "@type": "Question",
      "name": "What personal info is removed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Names, locations, school references, gamer tags, IDs—configurable in the dashboard."
      }
    }
  ]
};

export default function CreatorMode() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Creator Mode — Safe Editing & Streaming for Kids | Game Guardian"
        description="Give kids pro‑level editing and AI highlights with parent‑approved publishing. Auto‑bleep profanity and remove personal info before content goes live."
        canonicalUrl="https://guardianai.co.uk/creator-mode"
        structuredData={faqStructuredData}
      />

      <div className="min-h-screen bg-background">
        <header className="bg-card/50 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-8 text-center">
            <Badge variant="outline" className="mb-3">Creator Tools</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Creator Mode — Safe by Design</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Create, clip, and share—without the risk.
            </p>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4">
              Creator Mode builds safe creation into Guardian and Guardian OS, so kids can make amazing content while parents stay in control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => navigate('/auth')} aria-label="Start with Creator Mode">
                Start with Creator Mode
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="See how it works"
              >
                See how it works
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          {/* Why Creator Mode? */}
          <section className="mb-16" aria-labelledby="why-title">
            <h2 id="why-title" className="text-3xl font-bold text-center mb-4">Why Creator Mode?</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-center mb-6">
              Most tools block after the fact. Creator Mode protects at the source—on the device and inside the OS—so unsafe language, personal info, and risky uploads are caught before they go live.
            </p>
            <ul className="max-w-3xl mx-auto space-y-3">
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>On‑device checks across apps and games</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Real‑time AI safety for voice, text, and video</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Parent approval gates built into publishing</span></li>
            </ul>
          </section>

          {/* What Kids Get */}
          <section className="mb-16" aria-labelledby="kids-title">
            <h2 id="kids-title" className="text-3xl font-bold text-center mb-6">What Kids Get (the fun stuff)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><Wand2 className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>Full Editing Suite — Trim, merge, captions, overlays, and stickers on‑device</span></li>
                  <li className="flex items-start gap-3"><Play className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>AI Highlights — Auto‑detect epic wins, funny fails, boss fights, and clutch moments</span></li>
                  <li className="flex items-start gap-3"><Shield className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>One‑Tap Share — Push to YouTube and Twitch with built‑in safety checks</span></li>
                  <li className="flex items-start gap-3"><Mic className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>Clean Audio — Auto‑bleep profanity in real time</span></li>
                  <li className="flex items-start gap-3"><Eye className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>Privacy Guard — AI scrubs names, school, location, gamer tags, and other PII from clips</span></li>
                </ul>
                <div className="mt-6">
                  <Button variant="secondary" onClick={() => navigate('/dashboard')} aria-label="Try the editor">
                    Try the editor
                  </Button>
                </div>
              </div>
              <Card className="bg-card/40">
                <CardContent className="p-6 text-muted-foreground">
                  Creator features run locally with low‑latency, so gameplay stays smooth while edits and highlights process in the background.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* What Parents Control */}
          <section className="mb-16" aria-labelledby="parents-title">
            <h2 id="parents-title" className="text-3xl font-bold text-center mb-6">What Parents Control (the guardrails)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Approve Before Publish — Uploads wait for a quick “yes”</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Age Profiles — Safe defaults by age; fine‑tune categories</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Time & App Controls — Set windows for capturing, editing, and streaming</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Real‑Time Alerts — Get notified on risky language or personal info in content</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Cross‑Device Profiles — Settings follow your child wherever they log in</span></li>
                </ul>
                <div className="mt-6">
                  <Button variant="outline" onClick={() => navigate('/dashboard')} aria-label="View parent dashboard">
                    View parent dashboard
                  </Button>
                </div>
              </div>
              <Card className="bg-card/40">
                <CardContent className="p-6 text-muted-foreground">
                  Parents remain in control with clear approvals and notifications — without invasive surveillance.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="mb-16" aria-labelledby="how-title">
            <h2 id="how-title" className="text-3xl font-bold text-center mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {[
                { step: 1, title: 'Capture', desc: 'Guardian/OS records gameplay and voice with low‑latency' },
                { step: 2, title: 'Detect', desc: 'AI finds highlight moments and flags risks (profanity, PII)' },
                { step: 3, title: 'Clean', desc: 'Auto‑bleep unsafe words; remove personal details from audio/text' },
                { step: 4, title: 'Review', desc: 'Kid edits; parent gets a one‑tap approval request' },
                { step: 5, title: 'Publish', desc: 'Push to YouTube/Twitch once approved' },
              ].map(({ step, title, desc }) => (
                <Card key={step} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                      {step}
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Integrations */}
          <section className="mb-16" aria-labelledby="integrations-title">
            <h2 id="integrations-title" className="text-3xl font-bold text-center mb-6">Integrations</h2>
            <ul className="max-w-3xl mx-auto space-y-3">
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>YouTube: Draft uploads, unlisted by default until approved</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Twitch: Stream safety overlay + chat filters</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Dolby‑compatible audio path for crisp voice and reliable bleeping</span></li>
            </ul>
          </section>

          {/* Built for Safety, Not Surveillance */}
          <section className="mb-16" aria-labelledby="safety-title">
            <h2 id="safety-title" className="text-3xl font-bold text-center mb-6">Built for Safety, Not Surveillance</h2>
            <ul className="max-w-3xl mx-auto space-y-3">
              <li className="flex items-start gap-3"><Shield className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>On‑device by default — Fast, private, and tamper‑resistant</span></li>
              <li className="flex items-start gap-3"><Shield className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>Data minimisation — Only what’s needed to keep kids safe</span></li>
              <li className="flex items-start gap-3"><Shield className="h-5 w-5 text-primary mt-1" aria-hidden="true" /><span>Clear controls — Parents see and set exactly what’s shared</span></li>
            </ul>
          </section>

          {/* Real Scenarios */}
          <section className="mb-16" aria-labelledby="scenarios-title">
            <h2 id="scenarios-title" className="text-3xl font-bold text-center mb-6">Real Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  title: 'After‑school stream',
                  desc: 'Auto‑bleep kicks in; PII guard hides school name mentioned on mic',
                },
                {
                  title: 'Weekend montage',
                  desc: 'AI generates a highlight reel; parent approves with one tap',
                },
                {
                  title: 'At a friend’s house',
                  desc: 'Same protections off‑network—rules travel with the child',
                },
              ].map((s, i) => (
                <Card key={i} className="bg-card/40">
                  <CardHeader>
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{s.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Pricing / Availability */}
          <section className="mb-16" aria-labelledby="pricing-title">
            <h2 id="pricing-title" className="text-3xl font-bold text-center mb-6">Pricing / Availability</h2>
            <ul className="max-w-3xl mx-auto space-y-3">
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Included with Guardian and Guardian OS</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" aria-hidden="true" /><span>Creator Mode tools and parent approvals included on all plans</span></li>
            </ul>
            <div className="text-center mt-6">
              <Button onClick={() => navigate('/auth')} aria-label="Get Creator Mode">Get Creator Mode</Button>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-20" aria-labelledby="faq-title">
            <h2 id="faq-title" className="text-3xl font-bold text-center mb-6">FAQ</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {[{
                q: 'Does this slow down games?',
                a: 'No—capture and AI processing run with low‑latency paths designed for gaming.'
              },{
                q: 'Can my child publish without my approval?',
                a: 'Only if you enable “self‑publish”. Default is parent approval required.'
              },{
                q: 'Which platforms are supported?',
                a: 'Works with leading consoles and PCs. YouTube/Twitch integrations included.'
              },{
                q: 'What personal info is removed?',
                a: 'Names, locations, school references, gamer tags, IDs—configurable in the dashboard.'
              }].map((item, idx) => (
                <Card key={idx} className="bg-card/40">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{item.a}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center bg-card rounded-lg p-8 border" aria-labelledby="final-cta-title">
            <h2 id="final-cta-title" className="text-3xl font-bold mb-4">Safer play. Smarter creation.</h2>
            <Button size="lg" onClick={() => navigate('/auth')} aria-label="Start with Creator Mode">
              Start with Creator Mode
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </section>
        </main>
      </div>
    </>
  );
}
