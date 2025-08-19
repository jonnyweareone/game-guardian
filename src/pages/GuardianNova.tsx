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
  Rocket
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";

const GuardianNova = () => {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Guardian Nova - AI Learning Companion",
    "description": "The world's first safe AI learning companion that grows with your child, featuring immersive VR experiences and adaptive learning",
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
        title="Guardian Nova – A Galaxy of Adaptive Learning | AI Learning Companion"
        description="The world's first safe AI learning companion that grows with your child. Immersive VR experiences, adaptive learning, and rewards that motivate exploration."
        keywords="Guardian Nova, AI learning companion, VR education, adaptive learning, immersive education, safe AI for children"
        canonicalUrl="https://guardianai.co.uk/guardian-nova"
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
                  alt="Guardian Nova"
                  className="rounded"
                />
                <span className="font-semibold text-foreground">Guardian Nova</span>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <a href="#overview" className="text-muted-foreground hover:text-foreground transition-colors">Overview</a>
                <a href="#for-parents" className="text-muted-foreground hover:text-foreground transition-colors">For Parents</a>
                <a href="#for-schools" className="text-muted-foreground hover:text-foreground transition-colors">For Schools</a>
                <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
                <a href="#join" className="text-muted-foreground hover:text-foreground transition-colors">Join Us</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Galaxy Theme */}
        <section className="py-20 bg-gradient-to-br from-background via-primary/10 to-secondary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <Badge className="text-sm px-3 py-1">Guardian Nova™</Badge>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  A Whole Galaxy of <span className="text-primary">Adaptive Learning</span> Experiences
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  The world's first safe AI learning companion that grows with your child. From storytelling to VR exploration — Nova adapts, guides, and rewards every journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    <Rocket className="h-5 w-5 mr-2" />
                    For Schools & EdTech
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    <Star className="h-5 w-5 mr-2" />
                    For Parents
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/lovable-uploads/d517d7c2-5de6-40a5-a7c8-2a1d1c65916d.png"
                  alt="VR student exploring Ancient Rome timeline in immersive 3D environment with Guardian Nova AI guide"
                  className="w-full rounded-lg shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section id="overview" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">More than homework help — a learning universe</h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Guardian Nova is a safe, adaptive AI designed to guide, support, and reward every child's learning journey. 
                From early years storytelling to KS4 assignments, Nova adapts to each child's strengths, frustrations, and learning style. 
                Built into Guardian OS, Nova combines fun, curiosity, and safe AI in a way no other platform can.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/lovable-uploads/0bbd87f9-1a96-4406-a119-e2ce7a6b6352.png"
                  alt="Guardian Nova desktop showing adaptive AI companion with personalized learning interface"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <img 
                  src="/lovable-uploads/5d732111-113e-4cf1-8fb1-f9c94c3fbe22.png"
                  alt="Four adaptive learning modes: Show, Tell, Read, Try - personalized for every learning style"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* VR Immersive Learning Section */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <Eye className="h-10 w-10 text-primary inline-block mr-3" />
                  Immersive Learning in VR
                </h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Guardian is building the world's first truly immersive learning OS, where trying is winning, and curiosity opens entire worlds. 
                  With VR integration, children can explore history, science, and creativity in fully interactive environments.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Walk through Ancient Rome with AI guides</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Explore molecular structures in 3D space</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Create art in boundless virtual studios</span>
                  </li>
                </ul>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/d517d7c2-5de6-40a5-a7c8-2a1d1c65916d.png"
                  alt="VR student exploring Ancient Rome timeline in immersive 3D environment with Guardian Nova AI guide"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Knowledge Packs & Skill Trees Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/lovable-uploads/f04cf4cd-e92d-4d63-8bbb-9ecc04caeb61.png"
                  alt="Knowledge Packs skill tree showing branching topics unlocking like gaming achievements"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <Gamepad2 className="h-10 w-10 text-primary inline-block mr-3" />
                  Knowledge Packs & Skill Trees
                </h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Explore the universe past and present while earning rewards through skill-tree style learning. 
                  Knowledge Packs unlock like gaming achievements — turning study into a branching journey of discovery, progress, and mastery.
                </p>
                <div className="space-y-4">
                  <Badge variant="outline" className="text-base px-4 py-2 mr-3">Ancient Civilizations Pack</Badge>
                  <Badge variant="outline" className="text-base px-4 py-2 mr-3">Space Exploration Pack</Badge>
                  <Badge variant="outline" className="text-base px-4 py-2">Creative Arts Pack</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards & Store Section */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <Trophy className="h-10 w-10 text-primary inline-block mr-3" />
                  Rewards That Motivate
                </h2>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Guardian Points, skins, avatars, and badges make learning exciting. 
                  Every attempt earns progress — effort and resilience are celebrated, not just right answers.
                </p>
                <div className="mb-6">
                  <Badge className="mb-4 text-base px-4 py-2">Nova Explorer Badge</Badge>
                  <p className="text-muted-foreground">Exclusive challenge skins, seasonal avatar packs, and companion pets</p>
                </div>
                <Button variant="outline" className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Explore the Nova Store
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <img 
                  src="/lovable-uploads/ee1450ca-fb1e-43eb-b265-85c565368d6f.png"
                  alt="Guardian Nova Store showing avatars, skins, and seasonal packs with Nova Explorer rewards"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* For Parents Section */}
        <section id="for-parents" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <Shield className="h-10 w-10 text-primary inline-block mr-3" />
                For Parents
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Guardian Nova is designed with safety, encouragement, and transparency at its heart. 
                  Parents get clear insights into their child's learning journey: strengths, areas for improvement, and emotional signals like frustration points.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-safe" />
                    <span>Real-time learning insights and progress tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-safe" />
                    <span>Emotional wellbeing indicators and support alerts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-safe" />
                    <span>Custom reward systems that matter to your child</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <img 
                  src="/lovable-uploads/42bf6b0e-e9ce-45f0-90b2-2c27f7aa189e.png"
                  alt="Parent dashboard showing child's learning progress and emotional wellbeing indicators"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
                <img 
                  src="/lovable-uploads/f6f9c6a3-42c1-4c9a-927d-a6485c6705e0.png"
                  alt="Custom reward system interface for parents to set meaningful incentives"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* For Schools Section */}
        <section id="for-schools" className="py-20 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <BookOpen className="h-10 w-10 text-primary inline-block mr-3" />
                For Schools
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <img 
                  src="/lovable-uploads/a2953e55-2e79-447e-ab03-e87dac269248.png"
                  alt="Google Education integration showing seamless classroom workflow with Guardian Nova"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
                <img 
                  src="/lovable-uploads/aee070be-6bae-49ef-9730-9a2257142451.png"
                  alt="Teacher dashboard with anonymised class insights and neurodiverse learning support tools"
                  className="w-full rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Guardian Nova integrates directly with Google Education and leading EdTech platforms. 
                  Teachers can see anonymised class insights, track student engagement, and support neurodiverse learners with personalised strategies.
                </p>
                <div className="grid grid-cols-1 gap-8">
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <Brain className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Learning Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Class insights, engagement patterns, and neurodiverse support strategies
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <Zap className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Seamless Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Direct integration with Google Education and Microsoft Classroom
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-8">
                  <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                    <Globe className="h-5 w-5 mr-2" />
                    Partner with Guardian Nova
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Roadmap Section */}
        <section id="roadmap" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">From desktop to AR & VR galaxies</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Guardian is building the world's first truly immersive learning OS. Nova will expand into AR and VR, 
                giving children access to interactive classrooms, historical worlds, and scientific exploration in 3D.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="flex flex-col items-center text-center">
                <Eye className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">AR Avatar Guidance</h3>
                <p className="text-muted-foreground text-sm">Nova companions appear on your desk to guide learning</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Brain className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">VR World Exploration</h3>
                <p className="text-muted-foreground text-sm">Step inside historical worlds and scientific environments</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Star className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cross-Platform Continuity</h3>
                <p className="text-muted-foreground text-sm">Points, skins, and pets travel across all experiences</p>
              </div>
            </div>
            <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="text-center">
                <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
                <p className="text-lg italic text-foreground mb-4">
                  "Guardian Nova is building the world's first truly immersive learning OS, where trying is winning, and curiosity opens entire galaxies."
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
                  "Every child deserves to feel like an explorer in their own learning journey. Nova makes that possible — turning curiosity into confidence, one discovery at a time."
                </blockquote>
                <footer className="text-muted-foreground">
                  — Jonny Robinson, Founder
                </footer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="join" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Guardian Nova journey</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the learning revolution. Bring adaptive AI and immersive experiences to your school or home.
            </p>
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
                Download Nova Brief
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
              <a href="#for-parents" className="hover:text-foreground transition-colors">For Parents</a>
              <a href="/press-releases" className="hover:text-foreground transition-colors">Press</a>
              <a href="/about" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © 2024 Guardian AI. Guardian Nova™ is a trademark of Guardian AI Ltd.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default GuardianNova;
