
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
  Quote,
  Globe,
  Gamepad2,
  Trophy,
  Sparkles,
  Rocket,
  FileCheck,
  Clock,
  Lock
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";

const HomeworkHelper = () => {
  const navigate = useNavigate();
  const [creatorTheme, setCreatorTheme] = useState<'light' | 'dark'>('light');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Guardian OS - AI Homework Helper",
    "description": "AI that teaches, not cheats. Guidance over answers, proof students did the work, and rewards for effort.",
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
    "description": "Building the world's first truly immersive learning OS for safe, adaptive AI education",
    "url": "https://guardianai.co.uk"
  };

  return (
    <>
      <SEOHead
        title="Guardian OS – AI Homework Helper | AI that teaches, not cheats"
        description="AI that teaches, not cheats. Guidance over answers, proof students did the work, and rewards for effort. Built for schools and parents."
        keywords="AI homework helper, educational AI, Guardian OS, adaptive learning, homework assistance, teaching AI"
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
                  alt="Guardian OS"
                  className="rounded"
                />
                <span className="font-semibold text-foreground">Guardian OS</span>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <a href="#overview" className="text-muted-foreground hover:text-foreground transition-colors">Overview</a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                <a href="#proof" className="text-muted-foreground hover:text-foreground transition-colors">Proof</a>
                <a href="#rewards" className="text-muted-foreground hover:text-foreground transition-colors">Rewards</a>
                <a href="#for-schools" className="text-muted-foreground hover:text-foreground transition-colors">For Schools</a>
                <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  AI that <span className="text-primary">teaches</span>, not cheats.
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Guidance over answers, proof students did the work, and rewards for effort.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    <Briefcase className="h-5 w-5 mr-2" />
                    For Schools & EdTech
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    <Users className="h-5 w-5 mr-2" />
                    For Parents
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/lovable-uploads/58833672-9824-49ce-9254-cf50498ec68a.png"
                  alt="Creator Mode with Google Education rail and AI Homework Helper explaining World War I; +20 points reward."
                  className="w-full rounded-lg shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Knowledge Tree Section */}
        <section id="overview" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <Gamepad2 className="h-10 w-10 text-primary inline-block mr-3" />
                  Knowledge grows like a skill tree.
                </h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Children earn points for trying. Each topic unlocks new branches — exploration becomes progression.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Branching topics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Visible mastery</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Curiosity loops</span>
                  </li>
                </ul>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/f04cf4cd-e92d-4d63-8bbb-9ecc04caeb61.png"
                  alt="Knowledge Tree UI showing branching topics like Ancient Civilisations, Greek Myths, and Egyptian Inventions."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Learning Modes Section */}
        <section id="how-it-works" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/lovable-uploads/5d732111-113e-4cf1-8fb1-f9c94c3fbe22.png"
                  alt="Homework Helper with four tabs — Show, Tell, Read, Try — guiding a volcano topic with a labelled diagram."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Show me. Tell me. Read. Try it.
                </h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge variant="outline" className="text-base px-4 py-2">Show</Badge>
                  <Badge variant="outline" className="text-base px-4 py-2">Tell</Badge>
                  <Badge variant="outline" className="text-base px-4 py-2">Read</Badge>
                  <Badge variant="outline" className="text-base px-4 py-2">Try</Badge>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  The assistant presents multiple representations so every learner can understand, then practice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Early Years Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Early Years, done gently.
                </h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Story-led prompts, big buttons, calm pacing, optional read‑aloud.
                </p>
                <Badge className="text-base px-4 py-2">
                  Kid-safe desktop
                </Badge>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/0bbd87f9-1a96-4406-a119-e2ce7a6b6352.png"
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <Trophy className="h-10 w-10 text-primary inline-block mr-3" />
                  Effort earns rewards.
                </h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Guardian Points for persistence and progress. Redeem for avatars, pets, and seasonal packs.
                </p>
                <div className="mb-6">
                  <Badge className="mb-4 text-base px-4 py-2">Exclusive challenge skins (e.g., Maths Hero)</Badge>
                </div>
                <Button variant="outline" className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4" />
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Guidance, not answers.
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  The sidebar explains steps and sources, then asks the learner to try. When they submit, they earn points — no penalties for mistakes.
                </p>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/85e329b1-1989-4e95-883b-5917e057ba13.png"
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
                  src="/lovable-uploads/7009c633-9f3f-40c2-9b56-1970ad26bee1.png"
                  alt="Avatar companions for different age groups and styles; supportive speech bubbles; reward level badges."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  A study buddy that grows with you.
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <Zap className="h-10 w-10 text-primary inline-block mr-3" />
                Creator Mode + Reflex
              </h2>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed max-w-4xl mx-auto">
                Auto‑tiling and low‑latency Reflex profiles for video editing, 3D, coding. Hardware‑aware: we auto‑select high‑performance settings when available.
              </p>
              <div className="flex justify-center gap-4 mb-8">
                <Button 
                  variant={creatorTheme === 'light' ? 'default' : 'outline'}
                  onClick={() => setCreatorTheme('light')}
                >
                  Light
                </Button>
                <Button 
                  variant={creatorTheme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setCreatorTheme('dark')}
                >
                  Dark
                </Button>
              </div>
            </div>
            <div className="max-w-4xl mx-auto">
              {creatorTheme === 'light' ? (
                <img 
                  src="/lovable-uploads/051dfeca-e81d-474a-b208-fc2c25dfcb93.png"
                  alt="Creator Mode (light theme) auto‑tiled windows: video editor, mixer, files, terminal; Reflex ON."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              ) : (
                <img 
                  src="/lovable-uploads/02ae15e6-11a9-4246-b700-391693ab29f3.png"
                  alt="Creator Mode (dark neon) with Blender, graphics editor, files, terminal; Reflex ON."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </section>

        {/* Proof of Original Work Section */}
        <section id="proof" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <Shield className="h-10 w-10 text-primary inline-block mr-3" />
              Proof they did the work.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
              <div className="flex flex-col items-center text-center">
                <FileCheck className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Signed proof bundle</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Timeline of effort</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <Lock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Private by default</h3>
              </div>
            </div>
            <p className="text-muted-foreground">
              Designed so teachers learn from homework — not scan it.
            </p>
          </div>
        </section>

        {/* Home Hub Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Everything in one kid‑safe desktop.
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Curated rails for Games, School, Media, Creativity, Comms.
                </p>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/6ee70be5-bcb2-464c-b22c-1b3f8ac991a5.png"
                  alt="Guardian OS home hub with large category icons: Games, School, Media, Creativity, Comms."
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* For Schools & EdTech Section */}
        <section id="for-schools" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <BookOpen className="h-10 w-10 text-primary inline-block mr-3" />
                For Schools & EdTech
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <Card className="p-8">
                <CardContent>
                  <Brain className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Learning Intelligence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Strengths, improvement areas, frustration signals, subject sentiment.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-8">
                <CardContent>
                  <Globe className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Drop-in Rollout</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Integrates with Google Education and Microsoft Classroom.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-12">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                <Briefcase className="h-5 w-5 mr-2" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
                <div className="flex flex-col items-center text-center">
                  <Eye className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AR avatar guidance on the desk</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Brain className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">VR timelines and 3D geometry</h3>
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

        {/* Final CTA Section */}
        <section id="contact" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Bring Guardian to your school.</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                <Rocket className="h-5 w-5 mr-2" />
                Talk to Sales
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/how-to-guide")}>
                <BookOpen className="h-5 w-5 mr-2" />
                See Parent Guide
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/brand-assets")}>
                <Briefcase className="h-5 w-5 mr-2" />
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
              <a href="#for-schools" className="hover:text-foreground transition-colors">For Schools</a>
              <a href="/auth" className="hover:text-foreground transition-colors">For Parents</a>
              <a href="/press-releases" className="hover:text-foreground transition-colors">Press</a>
              <a href="/about" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © 2024 Guardian AI. Guardian OS™ is a trademark of Guardian AI Ltd.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomeworkHelper;
