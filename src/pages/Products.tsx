import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, Cpu, Monitor, Headphones, ArrowRight, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Products = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: "device",
      name: "Game Guardian Device", 
      description: "AI-powered hardware that monitors gaming voice chats in real-time",
      icon: Shield,
      features: ["Real-time voice monitoring", "Bluetooth & USB connectivity", "3.5mm headset output", "Instant parent alerts"],
      status: "available",
      price: "Starting at £59.99",
      link: "/products/device"
    },
    {
      id: "os-mini",
      name: "Game Guardian OS Mini",
      description: "Game Guardian OS Mini is available for free install on your own hardware while we're in beta",
      icon: Cpu,
      features: ["USB bootable image", "Pre-installed option", "VM/Container support", "Low power consumption"],
      status: "available",
      price: "Free download",
      link: "/products/os-mini"
    },
    {
      id: "os-full",
      name: "Game Guardian OS",
      description: "Full-featured Linux OS that transforms gaming PCs into AI-powered safe zones",
      icon: Monitor,
      features: ["Complete PC protection", "Content controls", "Screen time limits", "Kiosk mode"],
      status: "available",
      price: "Free for families",
      link: "/products/os-full"
    },
    {
      id: "receiver",
      name: "Game Guardian Receiver",
      description: "Wireless plug-in device for controller headset jacks",
      icon: Headphones,
      features: ["Controller integration", "Wireless transmission", "Cable-free setup", "Universal compatibility"],
      status: "coming-soon",
      price: "Coming soon",
      link: null
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Game Guardian Products - AI-Powered Child Safety Solutions",
    "description": "Explore our complete ecosystem of AI-powered gaming safety solutions including hardware devices, operating systems, and wireless receivers.",
    "url": "https://guardianai.co.uk/products"
  };

  return (
    <>
      <SEOHead
        title="Game Guardian Products - AI-Powered Gaming Safety Solutions"
        description="Discover our complete ecosystem of AI-powered child safety solutions for gaming, including hardware devices, Linux operating systems, and wireless receivers."
        keywords="game guardian products, ai gaming safety, child protection hardware, gaming monitoring device, linux os gaming"
        canonicalUrl="https://guardianai.co.uk/products"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Game Guardian Ecosystem
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete AI-powered solutions to protect children in online gaming environments. 
              Choose the perfect solution for your family's needs.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {products.map((product) => {
              const IconComponent = product.icon;
              
              return (
                <Card key={product.id} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{product.name}</CardTitle>
                          {product.status === "coming-soon" && (
                            <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{product.price}</div>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-safe" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {product.link ? (
                      <Button 
                        onClick={() => navigate(product.link)}
                        className="w-full group"
                        variant="outline"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button disabled className="w-full" variant="outline">
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Child?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start with our free dashboard or explore our hardware solutions. 
              Every product works together to create a comprehensive safety ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/auth")} size="lg">
                Start Free Trial
              </Button>
              <Button onClick={() => navigate("/contact")} variant="outline" size="lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
