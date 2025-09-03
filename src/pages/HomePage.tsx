import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Gamepad2, 
  Brain, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Lock,
  PlayCircle,
  Download,
  Smartphone,
  Monitor,
  Wifi
} from 'lucide-react';
import EcosystemHero from '@/components/EcosystemHero';

const HomePage = () => {
  // Background: if admin is logged in, ensure books are ingested (no manual steps)
  useEffect(() => {
    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        if (!userRes?.user) return;
        const { data: isAdmin } = await supabase.rpc('is_admin');
        if (isAdmin) {
          await supabase.functions.invoke('books-batch-reingest', { body: { limit: 50, force: false } });
        }
      } catch (e) {
        console.error('Auto re-ingest batch failed (ignored):', e);
      }
    })();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              🚀 Now Available - Guardian AI™ Ecosystem
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              The Future of
              <span className="block text-primary">Gaming Protection</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground">
              Experience the world's first AI-powered gaming protection ecosystem. Real-time threat detection, 
              intelligent parental controls, and seamless device protection - all working together to keep your family safe.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth?intent=waitlist">
                  Join the Waitlist <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/products">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="aspect-video rounded-xl border overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/67143275-f588-4d5a-b92f-dae2b71b634c.png" 
                alt="Guardian AI™ Dashboard Preview - Real-time gaming protection interface showing child activity monitoring, alerts, and parental controls"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-1">Guardian AI™ Dashboard V2</h3>
                  <p className="text-sm opacity-90">Real-time monitoring • AI-powered insights • Family protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guardian Ecosystem Section */}
      <EcosystemHero />

      {/* Key Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Guardian AI™?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The only gaming protection platform that learns, adapts, and evolves with your family's needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Intelligence</h3>
              <p className="text-muted-foreground">
                Advanced machine learning algorithms that understand gaming patterns and detect threats in real-time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Complete Protection</h3>
              <p className="text-muted-foreground">
                From device security to content filtering, we've got every aspect of your family's digital safety covered.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Family-First Design</h3>
              <p className="text-muted-foreground">
                Built specifically for modern families who want to embrace technology while staying safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to protect your family's gaming experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Real-Time Threat Detection</CardTitle>
                <CardDescription>
                  AI-powered analysis identifies and neutralizes threats before they can cause harm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Malware protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Phishing detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Suspicious activity monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Gamepad2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Smart Gaming Controls</CardTitle>
                <CardDescription>
                  Intelligent parental controls that adapt to your child's age and maturity level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Age-appropriate content filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Screen time management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    In-game purchase protection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>24/7 Monitoring</CardTitle>
                <CardDescription>
                  Continuous protection that never sleeps, ensuring your family's safety around the clock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Always-on protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instant threat response
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Adaptive Learning</CardTitle>
                <CardDescription>
                  AI that learns your family's patterns and preferences for personalized protection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Behavioral analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Personalized recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Evolving protection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Family Dashboard</CardTitle>
                <CardDescription>
                  Centralized control panel for managing all family members and devices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multi-device management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Individual profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Activity insights
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Zero Performance Impact</CardTitle>
                <CardDescription>
                  Lightweight protection that doesn't slow down games or devices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Optimized for gaming
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Minimal resource usage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Seamless experience
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get Early Access</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Be among the first to experience the future of gaming protection. 
            Join our exclusive waitlist and get priority access when we launch.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/auth?intent=waitlist">
                <Download className="mr-2 h-5 w-5" />
                Join the Waitlist
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/products">
                Learn More
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Early bird pricing
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Beta access included
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Protect Your Family?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of families who trust Guardian AI™ to keep their gaming experiences safe and secure.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
