
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Lock
} from 'lucide-react';
import EcosystemHero from '@/components/EcosystemHero';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Intelligent Gaming Protection
          </h1>
          <p className="mt-4 text-muted-foreground">
            Protect your gaming experience with AI-powered security. Game Guardian AI™ provides real-time threat detection and prevention, ensuring a safe and enjoyable gaming environment.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/products">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Guardian Ecosystem Section */}
      <EcosystemHero />

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-foreground mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card>
              <CardHeader>
                <Shield className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Real-Time Threat Detection</CardTitle>
                <CardDescription>AI-powered analysis to identify and neutralize threats instantly.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Protects against malware and unauthorized access
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card>
              <CardHeader>
                <Gamepad2 className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Game Integrity Monitoring</CardTitle>
                <CardDescription>Ensures fair play by detecting cheating and game manipulation.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Maintains a level playing field for all gamers
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card>
              <CardHeader>
                <Brain className="h-6 w-6 text-primary mb-2" />
                <CardTitle>AI-Driven Security</CardTitle>
                <CardDescription>Advanced algorithms that learn and adapt to new threats.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Continuously evolving protection against emerging threats
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card>
              <CardHeader>
                <Users className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Community Protection</CardTitle>
                <CardDescription>Leverages community insights to enhance security for all users.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Collective intelligence for a safer gaming environment
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card>
              <CardHeader>
                <Clock className="h-6 w-6 text-primary mb-2" />
                <CardTitle>24/7 Monitoring</CardTitle>
                <CardDescription>Round-the-clock protection to keep your gaming secure at all times.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Uninterrupted security for peace of mind
              </CardContent>
            </Card>

            {/* Feature Card 6 */}
            <Card>
              <CardHeader>
                <Star className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Optimized Performance</CardTitle>
                <CardDescription>Lightweight design ensures minimal impact on game performance.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Enjoy seamless gaming without sacrificing security
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-foreground mb-8">Our Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Game Guardian AI™ Device Protection
                </CardTitle>
                <CardDescription>Comprehensive security for your gaming devices.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>Real-time threat detection</li>
                  <li>AI-powered security</li>
                  <li>Optimized performance</li>
                </ul>
                <Button variant="secondary" size="sm" className="mt-4" asChild>
                  <Link to="/products/device">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Product Card 2 */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Game Guardian AI™ OS Full Protection
                </CardTitle>
                <CardDescription>Full operating system protection for enhanced security.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>Advanced threat analysis</li>
                  <li>System-wide security</li>
                  <li>Proactive protection</li>
                </ul>
                <Button variant="secondary" size="sm" className="mt-4" asChild>
                  <Link to="/products/os-full">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Product Card 3 */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Game Guardian AI™ Receiver
                </CardTitle>
                <CardDescription>Secure receiver for protected gaming environments.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>Encrypted communication</li>
                  <li>Secure data transfer</li>
                  <li>Tamper-proof design</li>
                </ul>
                <Button variant="secondary" size="sm" className="mt-4" asChild>
                  <Link to="/products/receiver">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            Join Game Guardian AI™ today and experience the ultimate gaming protection.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth">Sign Up Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
