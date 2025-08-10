import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import { 
  Shield, 
  Volume2, 
  Brain, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Star,
  Quote,
  ArrowRight,
  Play,
  Zap,
  Eye,
  Clock,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gamingHeadsetAI from '@/assets/gaming-headset-ai.png';
import guardianDevice from '@/assets/guardian-device.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'audio',
      icon: Volume2,
      title: 'Immersive Audio Meets Intelligent Protection',
      subtitle: 'Built for Modern Gaming Setups',
      description: 'Game Guardian AI™ supports Dolby Atmos, delivering spatial audio that keeps players immersed—while our AI quietly listens in the background, analyzing voice chat in real time for signs of risk.',
      quote: 'Kids get the experience they love. Parents get the peace of mind they need.',
      details: 'Compatible with all major gaming platforms including PlayStation, Xbox, PC, and Nintendo Switch'
    },
    {
      id: 'ai',
      icon: Brain,
      title: 'Real-Time AI Voice Monitoring',
      subtitle: 'Patented voice intelligence, trained to detect:',
      description: 'All voice is processed locally and transcribed securely with multiple visibility options for parents.',
      features: [
        'Bullying & harassment',
        'Grooming & inappropriate contact', 
        'Profanity, threats, and emotional distress'
      ],
      quote: 'Your child\'s safety is never optional—and never invasive.',
      details: 'Advanced neural networks process speech patterns, tone analysis, and contextual understanding'
    },
    {
      id: 'protection',
      icon: Shield,
      title: 'Why It\'s Important',
      subtitle: 'Online gaming isn\'t just play—it\'s social.',
      description: 'Game Guardian AI™ acts as a real-time guardian, analyzing tone, keywords, and behavioral patterns to alert parents without eavesdropping or breaching trust.',
      risks: [
        'Strangers in open chat rooms',
        'Unmoderated voice channels',
        'Harmful language and manipulation tactics'
      ],
      details: '85% of online gaming incidents occur in unmoderated voice channels during peak gaming hours'
    },
    {
      id: 'family',
      icon: Users,
      title: 'How It Protects Kids',
      subtitle: 'Empowers parents. Protects privacy. Keeps kids safe where they play.',
      features: [
        'Instant alerts for concerning interactions',
        'Playback & summaries on the parent dashboard',
        'Optional headset monitoring or standalone inline detection',
        'Custom sensitivity settings per child profile',
        'Encrypted logs with 12-month retention, fully GDPR & COPPA compliant'
      ],
      details: 'Zero-trust architecture ensures all data remains encrypted and under your control'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Parent of two gamers',
      avatar: '👩‍💻',
      quote: 'Finally, technology that keeps up with how kids actually play today. My peace of mind is worth everything.',
      rating: 5
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Child Safety Expert',
      avatar: '👨‍⚕️',
      quote: 'Game Guardian AI represents the gold standard in proactive child protection without compromising privacy.',
      rating: 5
    },
    {
      name: 'Jennifer Walsh',
      role: 'Elementary School Principal',
      avatar: '👩‍🏫',
      quote: 'This tool helps parents have informed conversations about online safety. It\'s educational, not punitive.',
      rating: 5
    }
  ];

  const comparisonFeatures = [
    { feature: 'Real-time voice monitoring', without: false, with: true },
    { feature: 'AI-powered threat detection', without: false, with: true },
    { feature: 'Instant parent alerts', without: false, with: true },
    { feature: 'Privacy-first design', without: false, with: true },
    { feature: 'Conversation transcripts', without: false, with: true },
    { feature: 'Multi-platform support', without: false, with: true },
    { feature: 'Peace of mind', without: false, with: true },
    { feature: 'Hope and prayer', without: true, with: false },
    { feature: 'Reactive discovery', without: true, with: false },
    { feature: 'Manual supervision', without: true, with: false }
  ];

  const homePageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Game Guardian AI - AI-Powered Gaming Safety",
    "description": "Protect your child in online gaming with AI voice chat monitoring, real-time alerts, and smart safety controls.",
    "url": "https://gameguardianai.com",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Game Guardian AI",
      "applicationCategory": "ParentalControlSoftware",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free trial available"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Game Guardian AI™ - AI-Powered Gaming Safety for Kids"
        description="Introducing the Guardian Ecosystem: a connected safety network delivering 360° protection across gaming and digital life. AI voice monitoring with real-time alerts."
        keywords="gaming safety, child protection online, voice chat monitoring, AI safety, parental controls, online gaming, child safety technology, gaming parental controls"
        canonicalUrl="https://gameguardianai.com/"
        structuredData={homePageStructuredData}
      />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Game Guardian AI™</h1>
                <p className="text-xs text-muted-foreground">Intelligent Gaming Protection</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate('/products')}>Products</Button>
              <Button variant="ghost" onClick={() => navigate('/how-to-guide')}>How-to Guide</Button>
              <Button variant="ghost" onClick={() => navigate('/blog')}>Blog</Button>
              <Button variant="ghost" onClick={() => navigate('/about')}>About</Button>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Ecosystem Intro Section */}
      <section className="py-16 bg-card/40 border-t border-b border-border" aria-label="Guardian Ecosystem introduction">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Introducing the Guardian Ecosystem</h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            The Guardian Ecosystem is a world-first, fully connected safety network that protects children across every aspect of their digital and gaming life. More than just an app — it’s a complete suite of products working together for 360° safety.
          </p>
          <div className="flex justify-center">
            <div className="rounded-xl border border-border bg-background p-6 w-full">
              <svg viewBox="0 0 400 200" role="img" aria-labelledby="ecosystemTitle ecosystemDesc" className="mx-auto w-full max-w-3xl h-48">
                <title id="ecosystemTitle">Guardian Ecosystem Diagram</title>
                <desc id="ecosystemDesc">Guardian OS and the Game Guardian Device connect to deliver 360° safety</desc>
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-primary"></path>
                  </marker>
                </defs>
                <circle cx="120" cy="100" r="48" className="stroke-current text-primary fill-transparent" strokeWidth="2"></circle>
                <text x="120" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground text-sm">Guardian OS</text>
                <circle cx="280" cy="100" r="48" className="stroke-current text-secondary fill-transparent" strokeWidth="2"></circle>
                <text x="280" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground text-sm">Device</text>
                <path d="M168,100 L232,100" className="stroke-current text-primary" strokeWidth="2" markerEnd="url(#arrow)"></path>
                <circle cx="200" cy="100" r="80" className="stroke-current text-muted-foreground/50 fill-transparent" strokeDasharray="6 6" strokeWidth="1.5"></circle>
                <text x="200" y="24" textAnchor="middle" className="fill-current text-muted-foreground text-xs">360° Safety</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="text-primary border-primary/20">
              <Zap className="h-3 w-3 mr-1" />
              The Future of Safe Gaming Starts Here
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Protect Your Child's
              <span className="text-primary block">Gaming Experience</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced AI voice monitoring that detects risks in real-time while preserving 
              the immersive gaming experience your kids love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <section className="py-20 bg-background" aria-label="Products overview">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <article id="product-os" className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Guardian OS™</h2>
                <p className="text-muted-foreground mt-2">Free — launches September.</p>
              </div>
              <Badge variant="outline">Waitlist</Badge>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="outline" onClick={() => navigate('/products/os-full')}>Learn More</Button>
              <Button size="lg" onClick={() => navigate('/auth?intent=waitlist&product=os')}>
                Join the waitlist
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </article>

          <article id="product-device" className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Game Guardian™ Device</h2>
                <p className="text-muted-foreground mt-2">AI-powered inline monitoring. In beta testing.</p>
              </div>
              <Badge variant="outline">Beta</Badge>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="outline" onClick={() => navigate('/products/device')}>Learn More</Button>
              <Button size="lg" onClick={() => navigate('/auth?intent=beta&product=device')}>
                Join the beta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </article>

          <article id="product-headset" className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Guardian Headset</h2>
                <p className="text-muted-foreground mt-2">Immersive gaming headset — coming soon.</p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <div className="mt-6">
              <div className="aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted/30">
                <img 
                  src={gamingHeadsetAI}
                  alt="Guardian gaming headset coming soon"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </article>

          <article id="product-receiver" className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Game Guardian™ Receiver</h2>
                <p className="text-muted-foreground mt-2">Wireless controller headset jack plugin — in development.</p>
              </div>
              <Badge variant="outline">In Development</Badge>
            </div>
          </article>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {feature.features && (
                    <ul className="space-y-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-safe flex-shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {feature.risks && (
                    <ul className="space-y-3">
                      {feature.risks.map((risk, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                          <span className="text-foreground">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {feature.quote && (
                    <blockquote className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
                      <Quote className="h-5 w-5 text-primary mb-2" />
                      <p className="text-lg font-medium text-foreground italic">
                        {feature.quote}
                      </p>
                    </blockquote>
                  )}

                  {hoveredFeature === feature.id && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Technical Details:</span> {feature.details}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-[var(--shadow-neon)]">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                      {feature.id === 'audio' && (
                        <img 
                          src={gamingHeadsetAI} 
                          alt="Gaming headset with AI monitoring device" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      {feature.id === 'protection' && (
                        <img 
                          src={guardianDevice} 
                          alt="Guardian AI device with neon lighting" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      {feature.id !== 'audio' && feature.id !== 'protection' && (
                        <feature.icon className="h-24 w-24 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
        </section>

      {/* Comparison Section */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              With vs Without Game Guardian AI™
            </h2>
            <p className="text-xl text-muted-foreground">
              See the difference intelligent protection makes
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/30">
              <div className="p-6">
                <h3 className="font-semibold text-foreground">Feature</h3>
              </div>
              <div className="p-6 text-center bg-muted/50">
                <h3 className="font-semibold text-muted-foreground">Without Protection</h3>
              </div>
              <div className="p-6 text-center bg-primary/10">
                <h3 className="font-semibold text-primary">With Game Guardian AI™</h3>
              </div>
            </div>
            
            {comparisonFeatures.map((item, index) => (
              <div key={index} className="grid grid-cols-3 border-b border-border last:border-b-0">
                <div className="p-6">
                  <span className="text-foreground">{item.feature}</span>
                </div>
                <div className="p-6 text-center bg-muted/20">
                  {item.without ? (
                    <CheckCircle className="h-5 w-5 text-warning mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )}
                </div>
                <div className="p-6 text-center bg-primary/5">
                  {item.with ? (
                    <CheckCircle className="h-5 w-5 text-safe mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
        </section>

      {/* Products Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Complete Gaming Protection Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the solution that fits your family's gaming setup and protection needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/products/device')}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Game Guardian Device</h3>
                <p className="text-muted-foreground text-sm">AI-powered device for any PC or console with Bluetooth, USB, and headset support</p>
                <Button variant="outline" size="sm" className="w-full">Learn More</Button>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="p-6 text-center space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg w-fit mx-auto">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-muted-foreground">Game Guardian OS</h3>
                <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                <p className="text-muted-foreground text-sm">Full-featured Linux OS transforming gaming PCs into AI-powered safe zones</p>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="p-6 text-center space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg w-fit mx-auto">
                  <Volume2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-muted-foreground">Game Guardian Receiver</h3>
                <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                <p className="text-muted-foreground text-sm">Wireless controller headset jack plugin for seamless console integration</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/products')} className="text-lg px-8 py-6">
              View All Products
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Protect Your Family?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of families already using Game Guardian AI™ to keep their children safe online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Schedule Demo
              <Clock className="h-5 w-5 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              GDPR Compliant
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              COPPA Certified
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Privacy First
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">Game Guardian AI™</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Protecting children in online gaming with AI-powered voice monitoring and real-time alerts.
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-foreground">Products</h4>
              <div className="space-y-2 text-sm">
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/products/device')}>
                  Game Guardian Device
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/products/os-full')}>
                  OS Full
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/products/receiver')}>
                  Receiver
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <div className="space-y-2 text-sm">
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/how-to-guide')}>
                  How-to Guide
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/blog')}>
                  Blog
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/press-releases')}>
                  Press Releases
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <div className="space-y-2 text-sm">
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/about')}>
                  About Us
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 sm:pt-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2024 Game Guardian AI. All rights reserved. UK Patent Pending.
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden xs:inline">GDPR Compliant</span>
                <span className="xs:hidden">GDPR</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden xs:inline">COPPA Certified</span>
                <span className="xs:hidden">COPPA</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden xs:inline">Privacy First</span>
                <span className="xs:hidden">Privacy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default HomePage;