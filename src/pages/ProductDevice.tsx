import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, Bluetooth, Usb, Headphones, Wifi, Zap, ArrowRight, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";


const ProductDevice = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Monitoring",
      description: "Real-time analysis of voice chats using advanced AI to detect bullying, grooming, and harmful content"
    },
    {
      icon: Bluetooth,
      title: "Bluetooth Connectivity",
      description: "Seamless wireless connection to gaming headsets and devices"
    },
    {
      icon: Usb,
      title: "USB Integration",
      description: "Direct USB connection for stable, low-latency audio monitoring"
    },
    {
      icon: Headphones,
      title: "3.5mm Jack Output",
      description: "Universal headset compatibility with standard audio jack"
    },
    {
      icon: Wifi,
      title: "Instant Alerts",
      description: "Real-time notifications sent directly to parent dashboard"
    },
    {
      icon: Zap,
      title: "Low Power Design",
      description: "Energy-efficient operation for 24/7 monitoring"
    }
  ];

  const specs = [
    { label: "Dimensions", value: "120mm x 80mm x 25mm" },
    { label: "Power", value: "USB-C, 5V 2A" },
    { label: "Connectivity", value: "Wi-Fi 6, Bluetooth 5.2, USB 3.0" },
    { label: "Audio", value: "3.5mm jack, USB audio" },
    { label: "Processing", value: "ARM Cortex-A78 with AI accelerator" },
    { label: "Storage", value: "32GB internal, microSD expansion" }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Game Guardian Device",
    "description": "AI-powered hardware device that monitors gaming voice chats for child safety",
    "brand": {
      "@type": "Brand",
      "name": "Game Guardian"
    },
    "offers": {
      "@type": "Offer",
      "price": "59.99",
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SEOHead
        title="Game Guardian Device - AI-Powered Gaming Safety Hardware"
        description="The Game Guardian Device monitors gaming voice chats in real-time using AI to protect children from bullying, grooming, and harmful content online."
        keywords="game guardian device, ai gaming hardware, child safety monitor, voice chat protection, gaming safety device"
        canonicalUrl="https://guardianai.co.uk/products/device"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge className="mb-4">Hardware Solution</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Game Guardian Device
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                AI-powered hardware that connects to any PC or console. Features Bluetooth, USB, and 3.5mm jack output for headsets. 
                Monitors in-game voice chats for signs of bullying, grooming, and other potential harm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Order Now - £59.99
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/how-to-guide")}>
                  How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Badge variant="outline" className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm border-border" aria-label="Dolby Enabled">
                Dolby
              </Badge>
              <img 
                src="/lovable-uploads/02ae15e6-11a9-4246-b700-391693ab29f3.png" 
                alt="Game Guardian Device hardware unit with RGB edge lighting - AI gaming safety"
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl" loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
            </div>
          </div>

          {/* Features Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
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
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Why Protect at the Source? */}
          <section className="mb-12">
            <Card className="max-w-4xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-foreground">
                  Guardian sits on the audio path between console/PC and headset, detecting bullying and grooming in real time — blocking risk before kids ever hear it.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Creator Features for Kids */}
          <section className="mb-20" aria-labelledby="creator-kids-device-title">
            <h2 id="creator-kids-device-title" className="text-3xl font-bold text-center mb-8">Creator Features for Kids</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>Full editing of captured gameplay and clips</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>AI auto‑clips key moments (wins, boss fights, funny fails)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>YouTube & Twitch integration with safety checks</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>Parent approval required before publishing</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-safe mt-1" /><span>AI auto‑bleep + personal‑info removal</span></li>
                </ul>
                <div className="mt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="secondary" onClick={() => navigate('/products/os-full#creator-mode')}>
                      Enable Creator Mode
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/creator-mode')} aria-label="Creator Mode details">
                      Learn about Creator Mode
                    </Button>
                  </div>
                </div>
              </div>
              <Card className="bg-card/40 border-border">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Creator tools are designed with safety-first defaults and parent oversight, so kids can share confidently.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Technical Specifications</h2>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border-b border-border last:border-b-0">
                      <span className="font-medium text-foreground">{spec.label}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Plug into your gaming setup via USB, Bluetooth, or 3.5mm jack. Works with any PC, console, or gaming device.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <CardTitle>Monitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI analyzes voice chats in real-time, detecting potential threats, bullying, grooming attempts, and harmful content.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <CardTitle>Alert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Instant notifications sent to your parent dashboard with detailed summaries and recommended actions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Protect Your Child Today</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of parents who trust Game Guardian to keep their children safe in online gaming environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Order Now - £59.99
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/products")}>
                Compare Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDevice;