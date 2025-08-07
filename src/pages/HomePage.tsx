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
        description="Protect your child in online gaming with AI voice chat monitoring. Real-time alerts, conversation analysis, and smart safety controls for peace of mind."
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Game Guardian AI™</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Game Guardian AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default HomePage;