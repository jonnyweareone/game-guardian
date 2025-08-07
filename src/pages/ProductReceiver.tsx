import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Headphones, Wifi, Gamepad2, Cable, ArrowRight, Bell } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ProductReceiver = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Gamepad2,
      title: "Controller Integration",
      description: "Plugs directly into controller headset jacks for seamless audio capture"
    },
    {
      icon: Wifi,
      title: "Wireless Transmission",
      description: "Sends audio wirelessly to your Game Guardian unit for AI analysis"
    },
    {
      icon: Cable,
      title: "Cable-Free Setup",
      description: "Eliminates the need for wired connections between controller and monitoring device"
    },
    {
      icon: Headphones,
      title: "Universal Compatibility",
      description: "Works with any gaming controller that has a standard 3.5mm headset jack"
    }
  ];

  const compatibility = [
    "PlayStation 4 & 5 Controllers",
    "Xbox One & Series X/S Controllers", 
    "Nintendo Switch Pro Controller",
    "Steam Deck",
    "Most Third-Party Controllers",
    "Any Controller with 3.5mm Jack"
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Game Guardian Receiver",
    "description": "Wireless plug-in device for controller headset jacks that enables cable-free audio monitoring",
    "brand": {
      "@type": "Brand",
      "name": "Game Guardian"
    }
  };

  return (
    <>
      <SEOHead
        title="Game Guardian Receiver - Wireless Controller Audio Capture (Coming Soon)"
        description="Wireless plug-in device for controller headset jacks. Captures audio directly from gaming controllers and wirelessly transmits to Game Guardian units for seamless monitoring."
        keywords="game guardian receiver, wireless controller audio, gaming headset monitor, controller jack adapter"
        canonicalUrl="https://guardianai.co.uk/products/receiver"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Game Guardian Receiver
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              A wireless plug-in device for controller headset jacks that captures audio directly from the game controller 
              and wirelessly links it to the Game Guardian unit, enabling clean, cable-free integration with consoles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                <Bell className="mr-2 h-4 w-4" />
                Notify Me When Available
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/products")}>
                View Available Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-card border border-warning/20 rounded-lg p-6 mb-16 text-center">
            <h2 className="text-2xl font-bold text-warning mb-2">Development in Progress</h2>
            <p className="text-muted-foreground">
              The Game Guardian Receiver is currently in development. Sign up to be notified when it becomes available 
              and get early access pricing.
            </p>
          </div>

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Planned Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="hover:border-primary/50 transition-colors opacity-75">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* How It Will Work */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">How It Will Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center opacity-75">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <CardTitle>Plug In</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Simply plug the receiver into your controller's headset jack alongside your gaming headset.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center opacity-75">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <CardTitle>Pair Wirelessly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The receiver automatically pairs with your Game Guardian device and begins transmitting audio.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center opacity-75">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <CardTitle>Monitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI analyzes all voice communications without any cables or complex setup requirements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Expected Compatibility */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Expected Compatibility</h2>
            <Card className="max-w-2xl mx-auto opacity-75">
              <CardHeader>
                <CardTitle className="text-center">Supported Controllers</CardTitle>
                <CardDescription className="text-center">
                  The receiver will work with any gaming controller that has a standard 3.5mm headset jack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {compatibility.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2">
                      <Gamepad2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Benefits */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Why We're Building This</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 opacity-75">
                <h3 className="text-lg font-semibold mb-2">Cleaner Setup</h3>
                <p className="text-muted-foreground">
                  Eliminates cable clutter and provides a more streamlined gaming experience
                </p>
              </Card>
              <Card className="text-center p-6 opacity-75">
                <h3 className="text-lg font-semibold mb-2">Better Integration</h3>
                <p className="text-muted-foreground">
                  Works seamlessly with existing gaming setups without any modifications
                </p>
              </Card>
              <Card className="text-center p-6 opacity-75">
                <h3 className="text-lg font-semibold mb-2">Enhanced Mobility</h3>
                <p className="text-muted-foreground">
                  Perfect for couch gaming and living room setups where cables are impractical
                </p>
              </Card>
            </div>
          </section>

          {/* Notify CTA */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Be the First to Know</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Sign up to receive updates on the Game Guardian Receiver development and get notified when it becomes available. 
              Early subscribers will receive special pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                <Bell className="mr-2 h-4 w-4" />
                Get Notified
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/products/device")}>
                View Available Hardware
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductReceiver;