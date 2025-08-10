import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Monitor, Shield, Clock, Lock, BookOpen, Settings, ArrowRight, CheckCircle, Mic, Bell, Power, RefreshCcw, Filter } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ProductOSFull = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Filter,
      title: "NextDNS Content Filtering",
      description: "Age-rated profiles, custom allow/deny lists, and instant toggles from the parent dashboard"
    },
    {
      icon: Settings,
      title: "App & Game Controls",
      description: "Disable specific apps, set time limits, or block entire categories like gambling, adult, or social media"
    },
    {
      icon: Mic,
      title: "Real-Time Voice Monitoring",
      description: "Guardian AI listens for harmful language or suspicious contact in game and voice chats"
    },
    {
      icon: Bell,
      title: "Parental Alerts & Reports",
      description: "Instant alerts when risky activity is detected, plus weekly activity summaries"
    },
    {
      icon: Power,
      title: "Sleep & Lock Mode",
      description: "Shut down or lock the device remotely from anywhere"
    },
    {
      icon: RefreshCcw,
      title: "Cross-Device Profile Switching",
      description: "Your child's safety profile follows them automatically when they log into another device"
    },
    {
      icon: Lock,
      title: "Tamper Protection",
      description: "Built-in security prevents uninstallation or bypass attempts"
    },
    {
      icon: Shield,
      title: "Protect at the Source (OS-level)",
      description: "OS‑level enforcement works across apps, browsers, and networks. No router or extension bypasses; tamper‑resistant."
    }
  ];

  const capabilities = [
    {
      category: "Gaming Protection",
      items: [
        "Real-time voice chat monitoring",
        "Game content filtering",
        "Multiplayer safety controls",
        "Gaming time limits by title",
        "Automatic threat detection"
      ]
    },
    {
      category: "Web & Content",
      items: [
        "Advanced web filtering",
        "Social media monitoring",
        "App usage tracking",
        "Content age verification",
        "Safe search enforcement"
      ]
    },
    {
      category: "Learning Environment",
      items: [
        "Homework-only kiosk mode",
        "Educational app allowlist",
        "Distraction blocking",
        "Study time scheduling",
        "Progress reporting"
      ]
    },
    {
      category: "Parental Controls",
      items: [
        "Remote device management",
        "Real-time activity monitoring",
        "Instant alert system",
        "Detailed usage reports",
        "Emergency lockout features"
      ]
    }
  ];

  const useCases = [
    {
      title: "Gaming Safety",
      description: "Protect children from online predators, cyberbullying, and inappropriate content during gaming sessions",
      icon: Shield
    },
    {
      title: "Study Time",
      description: "Create a distraction-free learning environment with educational apps and resources only",
      icon: BookOpen
    },
    {
      title: "Balanced Screen Time",
      description: "Enforce healthy gaming habits with automated time limits and scheduling",
      icon: Clock
    },
    {
      title: "Complete Peace of Mind",
      description: "Monitor and control all PC activity with comprehensive reporting and alerts",
      icon: Monitor
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Guardian OS",
    "description": "On-device child safety that stops harmful content and risky interactions at the source across apps, games, and chats",
    "operatingSystem": "Linux",
    "applicationCategory": "SecurityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    }
  };

  return (
    <>
      <SEOHead
        title="Guardian OS — Child Safety Built Into Your Device"
        description="On-device protection blocks harmful content and risky interactions at the source, across apps, games, and chats."
        keywords="guardian os, on-device child safety, parental controls, voice monitoring, app blocking"
        canonicalUrl="https://guardianai.co.uk/products/os-full"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4">Launches September 1 • Free for all users</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Guardian OS™ — Child Safety Built Into the Heart of Your Device
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              On-device protection means your child is safe before harmful content or risky interactions ever reach them. Guardian OS works at the source, stopping dangers before they appear on screen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?intent=waitlist&product=os")}>
                Join Waitlist
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/how-to-guide")}>
                Installation Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Product mockup image (reference UI) */}
            <figure className="mt-10 max-w-4xl mx-auto">
              <img
                src="/lovable-uploads/0ffa1e7f-623a-454b-8253-a26ef3fdbcd0.png"
                alt="Guardian OS parent dashboard showing controls, scheduling, game and app safety settings"
                className="w-full rounded-xl border shadow-lg"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <figcaption className="sr-only">Guardian OS on-device controls interface</figcaption>
            </figure>
          </div>

          {/* Why Protect at the Source? */}
          <section className="mb-20" aria-labelledby="why-source">
            <h2 id="why-source" className="text-3xl font-bold text-center mb-6">Why Protect at the Source?</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-center mb-6">
              Most parental controls work after the fact, filtering only what's already reached your home network or browser. Guardian OS works directly inside the device's operating system, so it can:
            </p>
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-safe mt-1" />
                  <span>Block harmful content instantly — even in apps, games, and private chats</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-safe mt-1" />
                  <span>Detect dangerous behaviour in real-time, from grooming to bullying</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-safe mt-1" />
                  <span>Enforce age-appropriate rules anywhere — home, school, or public Wi‑Fi</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-6 text-center">
                By working on the device itself, Guardian OS is tamper-resistant and always active, without relying on cloud delays or router settings that kids can bypass.
              </p>
            </div>
          </section>

          {/* Ecosystem Intro */}
          <section className="mb-20 bg-card/40 border border-border rounded-lg p-8" aria-label="Guardian Ecosystem introduction">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">The Guardian Ecosystem</h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
              The Guardian Ecosystem is a world-first, fully connected safety network that protects children across every aspect of their digital and gaming life. More than just an app — it’s a complete suite of products working together for 360° safety.
            </p>
            <div className="mt-6">
              <svg viewBox="0 0 400 200" role="img" aria-labelledby="osEcoTitle osEcoDesc" className="mx-auto w-full max-w-3xl h-48">
                <title id="osEcoTitle">Guardian Ecosystem Diagram</title>
                <desc id="osEcoDesc">Guardian OS and the Game Guardian Device connect to deliver 360° safety</desc>
                <defs>
                  <marker id="arrow-os" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-primary"></path>
                  </marker>
                </defs>
                <circle cx="120" cy="100" r="48" className="stroke-current text-primary fill-transparent" strokeWidth="2"></circle>
                <text x="120" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground text-sm">Guardian OS</text>
                <circle cx="280" cy="100" r="48" className="stroke-current text-secondary fill-transparent" strokeWidth="2"></circle>
                <text x="280" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground text-sm">Device</text>
                <path d="M168,100 L232,100" className="stroke-current text-primary" strokeWidth="2" markerEnd="url(#arrow-os)"></path>
                <circle cx="200" cy="100" r="80" className="stroke-current text-muted-foreground/50 fill-transparent" strokeDasharray="6 6" strokeWidth="1.5"></circle>
                <text x="200" y="24" textAnchor="middle" className="fill-current text-muted-foreground text-xs">360° Safety</text>
              </svg>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="text-center hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="mx-auto p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => {
                const IconComponent = useCase.icon;
                return (
                  <Card key={index} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{useCase.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{useCase.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Capabilities */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {capabilities.map((capability, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{capability.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {capability.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-safe flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* System Requirements */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">System Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">Minimum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>CPU:</strong> Intel i5 / AMD Ryzen 5</p>
                  <p><strong>RAM:</strong> 8GB</p>
                  <p><strong>Storage:</strong> 64GB SSD</p>
                  <p><strong>Graphics:</strong> Integrated</p>
                  <p><strong>Network:</strong> Wi-Fi or Ethernet</p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary">
                <CardHeader>
                  <Badge className="mx-auto mb-2">Recommended</Badge>
                  <CardTitle className="text-xl">Gaming Ready</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>CPU:</strong> Intel i7 / AMD Ryzen 7</p>
                  <p><strong>RAM:</strong> 16GB</p>
                  <p><strong>Storage:</strong> 256GB NVMe SSD</p>
                  <p><strong>Graphics:</strong> GTX 1660 / RX 580</p>
                  <p><strong>Network:</strong> Gigabit Ethernet</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">High Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>CPU:</strong> Intel i9 / AMD Ryzen 9</p>
                  <p><strong>RAM:</strong> 32GB+</p>
                  <p><strong>Storage:</strong> 1TB NVMe SSD</p>
                  <p><strong>Graphics:</strong> RTX 3070 / RX 6700 XT</p>
                  <p><strong>Network:</strong> Wi-Fi 6</p>
                </CardContent>
              </Card>
            </div>
          </section>

           {/* Creator Mode — Safe by Design */}
           <section id="creator-mode" className="mb-20" aria-labelledby="creator-mode-title">
             <h2 id="creator-mode-title" className="text-3xl font-bold text-center mb-6">Creator Mode — Safe by Design</h2>
             <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
               Guardian OS builds safe creation into the system, so kids can make and share confidently.
             </p>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
               <div>
                 <ul className="space-y-3">
                   <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>Full editing of captured gameplay/content</span></li>
                   <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>AI detection of in‑game moments → auto highlight reels</span></li>
                   <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>YouTube & Twitch integration with pre‑publish safety checks</span></li>
                   <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>Parent approval gate before publishing</span></li>
                   <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>AI auto‑bleep + personal‑info removal (PII scrub)</span></li>
                 </ul>
               </div>
               <div className="flex flex-col items-start justify-center gap-4">
                 <Card className="w-full bg-card/40">
                   <CardContent className="p-6">
                     <p className="text-foreground">Creator Mode integrates with your family's rules and device profiles for consistent protection across apps and networks.</p>
                   </CardContent>
                 </Card>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="secondary" onClick={() => navigate('/how-to-guide')} aria-label="Turn on Creator Mode">
                      Turn on Creator Mode
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/creator-mode')} aria-label="Creator Mode details">
                      Learn about Creator Mode
                    </Button>
                  </div>
               </div>
             </div>
           </section>

           {/* How It Works */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <CardTitle className="text-lg">Install OS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Replace existing OS or dual-boot with our secure Linux distribution
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <CardTitle className="text-lg">Configure Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Set up monitoring rules, time limits, and content filters
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <CardTitle className="text-lg">Monitor Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI continuously analyzes all activity and communications
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    4
                  </div>
                  <CardTitle className="text-lg">Receive Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications and detailed reports on parent dashboard
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Transform Your Child's Gaming PC</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Create the ultimate safe gaming environment with comprehensive AI-powered protection. 
              Free for families, professional licensing available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?intent=waitlist&product=os")}>
                Join Waitlist
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/products")}>
                Compare All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductOSFull;