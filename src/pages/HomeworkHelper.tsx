
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Users, 
  Shield, 
  Award, 
  Lightbulb, 
  Brain, 
  Star, 
  Target,
  Zap,
  Eye,
  Volume2,
  BookText,
  Play,
  CheckCircle,
  Briefcase,
  ArrowRight,
  Quote
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";

const HomeworkHelper = () => {
  const navigate = useNavigate();
  const [creatorModeTheme, setCreatorModeTheme] = useState<'light' | 'dark'>('light');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Guardian OS AI Homework Helper",
    "description": "AI-powered homework assistance that teaches rather than cheats, with proof of work and effort-based rewards",
    "brand": {
      "@type": "Organization",
      "name": "Guardian AI"
    },
    "category": "Educational Software",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "GBP"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Guardian AI",
    "description": "Building AI-powered educational technology for safe, effective learning",
    "url": "https://guardianai.co.uk"
  };

  return (
    <>
      <SEOHead
        title="Guardian OS – AI Homework Helper | AI that teaches, not cheats"
        description="Guidance over answers, proof students did the work, and rewards for effort. Built for different minds with adaptive learning modes and neurodiversity-aware support."
        keywords="AI homework helper, educational AI, proof of work, adaptive learning, neurodiversity support, Guardian OS"
        canonicalUrl="https://guardianai.co.uk/homework-helper"
        structuredData={[structuredData, organizationData]}
      />

      <div className="min-h-screen bg-background">
        {/* Sticky Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/guardian-logo2-transparent.png" 
                  width="32" 
                  height="32" 
                  alt="Guardian"
                  className="rounded"
                />
                <span className="font-semibold text-foreground">Guardian OS</span>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <a href="#overview" className="text-muted-foreground hover:text-foreground transition-colors">Overview</a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                <a href="#proof" className="text-muted-foreground hover:text-foreground transition-colors">Proof</a>
                <a href="#rewards" className="text-muted-foreground hover:text-foreground transition-colors">Rewards</a>
                <a href="#schools" className="text-muted-foreground hover:text-foreground transition-colors">For Schools</a>
                <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="overview" className="py-20 bg-gradient-to-br from-background via-accent/30 to-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  AI that teaches, <span className="text-primary">not cheats.</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Guidance over answers, proof students did the work, and rewards for effort.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    For Schools & EdTech
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    For Parents
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/lovable-uploads/0bbd87f9-1a96-4406-a119-e2ce7a6b6352.png"
                  alt="Creator Mode with Google Education rail and AI Homework Helper explaining World War I; +20 points reward."
                  className="w-full rounded-lg shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 text-center">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Kid‑safe desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Privacy‑first</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">School‑ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Knowledge Tree Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/lovable-uploads/f04cf4cd-e92d-4d63-8bbb-9ecc04caeb61.png"
                  alt="Knowledge Tree UI showing branching topics like Ancient Civilisations, Greek Myths, and Egyptian Inventions."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Knowledge grows like a skill tree.</h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Children earn points for trying. Each topic unlocks new branches — exploration becomes progression.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-safe" />
                    <span>Branching topics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-safe" />
                    <span>Visible mastery</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-safe" />
                    <span>Curiosity loops</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Learning Modes Section */}
        <section id="how-it-works" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Show me. Tell me. Read. Try it.</h2>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Eye className="h-4 w-4 mr-2" />
                  Show
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Tell
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <BookText className="h-4 w-4 mr-2" />
                  Read
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Play className="h-4 w-4 mr-2" />
                  Try
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The assistant presents multiple representations so every learner can understand, then practice.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <img 
                src="/lovable-uploads/5d732111-113e-4cf1-8fb1-f9c94c3fbe22.png"
                alt="Homework Helper with four tabs — Show, Tell, Read, Try — guiding a volcano topic with a labelled diagram."
                className="w-full rounded-lg shadow-xl"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Early Years Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Early Years, done gently.</h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Story-led prompts, big buttons, calm pacing, optional read‑aloud.
                </p>
                <Badge className="mb-4">Kid-safe desktop</Badge>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/d919619d-687d-47fa-a8c6-6a0cfddcc8b4.png"
                  alt="Early Years Learning: interactive 'Three Little Pigs' story with child‑friendly prompts."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Rewards & Store Section */}
        <section id="rewards" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/lovable-uploads/ee1450ca-fb1e-43eb-b265-85c565368d6f.png"
                  alt="Guardian Store: avatars, skins, seasonal packs; Maths Hero challenge skin highlighted."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Effort earns rewards.</h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Guardian Points for persistence and progress. Redeem for avatars, pets, and seasonal packs.
                </p>
                <div className="mb-6">
                  <Badge variant="outline" className="mb-4">Exclusive challenge skins (e.g., Maths Hero)</Badge>
                </div>
                <Button variant="outline" className="inline-flex items-center gap-2">
                  Open the Store
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Homework Helper in Action Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Guidance, not answers.</h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  The sidebar explains steps and sources, then asks the learner to try. When they submit, they earn points — no penalties for mistakes.
                </p>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/42bf6b0e-e9ce-45f0-90b2-2c27f7aa189e.png"
                  alt="Maths homework scene with supportive sidebar and a friendly astronaut‑style avatar; action buttons to ask or confirm."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Avatar Companions Section */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/lovable-uploads/f6f9c6a3-42c1-4c9a-927d-a6485c6705e0.png"
                  alt="Avatar companions for different age groups and styles; supportive speech bubbles; reward level badges."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">A study buddy that grows with you.</h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Avatars level up with learning. Skins and pets travel across desktop (and, soon, AR/VR).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator Mode Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Creator Mode + Reflex</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Auto‑tiling and low‑latency Reflex profiles for video editing, 3D, coding. Hardware‑aware: we auto‑select high‑performance settings when available.
              </p>
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={creatorModeTheme === 'light' ? 'default' : 'outline'}
                  onClick={() => setCreatorModeTheme('light')}
                >
                  Light
                </Button>
                <Button
                  variant={creatorModeTheme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setCreatorModeTheme('dark')}
                >
                  Dark
                </Button>
              </div>
            </div>
            <div className="max-w-4xl mx-auto">
              <img 
                src={creatorModeTheme === 'light' 
                  ? "/lovable-uploads/a2953e55-2e79-447e-ab03-e87dac269248.png"
                  : "/lovable-uploads/7009c633-9f3f-40c2-9b56-1970ad26bee1.png"
                }
                alt={creatorModeTheme === 'light' 
                  ? "Creator Mode (light theme) auto‑tiled windows: video editor, mixer, files, terminal; Reflex ON."
                  : "Creator Mode (dark neon) with Blender, graphics editor, files, terminal; Reflex ON."
                }
                className="w-full rounded-lg shadow-xl transition-opacity duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Proof of Original Work Section */}
        <section id="proof" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Proof they did the work.</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Signed proof bundle</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Target className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Timeline of effort</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Private by default</h3>
                </div>
              </div>
              <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
                Designed so teachers learn from homework — not scan it.
              </p>
            </div>
          </div>
        </section>

        {/* Home Hub Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Everything in one kid‑safe desktop.</h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Curated rails for Games, School, Media, Creativity, Comms.
                </p>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/aee070be-6bae-49ef-9730-9a2257142451.png"
                  alt="Guardian OS home hub with large category icons: Games, School, Media, Creativity, Comms."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* For Schools & EdTech Section */}
        <section id="schools" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Schools & EdTech</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <Card className="p-8">
                <CardHeader>
                  <Brain className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">Learning Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Strengths, improvement areas, frustration signals, subject sentiment.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-8">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">Drop‑in Rollout</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Integrates with Google Education and Microsoft Classroom.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-12">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                Partner with Guardian
              </Button>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="roadmap" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">From desktop to AR & VR.</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center">
                  <Eye className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AR avatar guidance on your desk</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Brain className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Step inside timelines and solar systems (VR)</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Star className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Cross‑platform continuity for points, skins, and pets</h3>
                </div>
              </div>
            </div>
            <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="text-center">
                <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
                <p className="text-lg italic text-foreground mb-4">
                  "Guardian is building the world's first truly immersive learning OS, where trying is winning, and curiosity opens entire worlds."
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Founder Quote Section */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto p-12 text-center border-primary/20">
              <CardContent>
                <Quote className="h-12 w-12 text-primary mx-auto mb-6" />
                <blockquote className="text-2xl md:text-3xl italic font-medium text-foreground mb-6 leading-relaxed">
                  "Points can become fail points. Guardian rewards attitude, not just aptitude—so every child feels proud for trying."
                </blockquote>
                <footer className="text-muted-foreground">
                  — Jonny Robinson, Founder
                </footer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Bring Guardian to your school.</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                Talk to Sales
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/how-to-guide")}>
                See Parent Guide
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/brand-assets")}>
                Download One‑Pager
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
              <a href="/security" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#schools" className="hover:text-foreground transition-colors">For Schools</a>
              <a href="#overview" className="hover:text-foreground transition-colors">For Parents</a>
              <a href="/press-releases" className="hover:text-foreground transition-colors">Press</a>
              <a href="/about" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © 2024 Guardian AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomeworkHelper;
