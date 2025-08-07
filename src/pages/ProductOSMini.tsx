import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Cpu, Download, HardDrive, Container, ArrowRight, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ProductOSMini = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Download,
      title: "USB Bootable Image",
      description: "Create a bootable USB drive and run Game Guardian OS on any compatible hardware"
    },
    {
      icon: HardDrive,
      title: "Pre-installed Option",
      description: "Available pre-installed on Game Guardian hardware for immediate deployment"
    },
    {
      icon: Container,
      title: "Virtualized Mode",
      description: "Run as VM or container for flexible deployment in existing infrastructure"
    },
    {
      icon: Cpu,
      title: "Low Resource Usage",
      description: "Optimized for compact hardware like Raspberry Pi, Orange Pi, and Jetson Nano"
    }
  ];

  const compatibleHardware = [
    { name: "Raspberry Pi 4/5", specs: "4GB+ RAM recommended" },
    { name: "Orange Pi 5", specs: "High performance ARM board" },
    { name: "NVIDIA Jetson Nano", specs: "AI acceleration support" },
    { name: "Rock Pi 4", specs: "ARM64 with 4GB+ RAM" },
    { name: "Odroid N2+", specs: "High-end SBC option" },
    { name: "Generic x86_64", specs: "2GB+ RAM minimum" }
  ];

  const deploymentOptions = [
    {
      title: "USB Bootable",
      description: "Flash to USB drive and boot from any compatible system",
      useCase: "Perfect for testing or temporary deployments"
    },
    {
      title: "SD Card Image",
      description: "Write directly to microSD for single-board computers",
      useCase: "Ideal for Raspberry Pi and similar devices"
    },
    {
      title: "Container Image",
      description: "Docker/Podman container for existing Linux systems",
      useCase: "Integrate with existing server infrastructure"
    },
    {
      title: "Virtual Machine",
      description: "VM image for VMware, VirtualBox, or Proxmox",
      useCase: "Run alongside other services on virtualized hardware"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Game Guardian OS Mini",
    "description": "Lightweight Linux-based operating system for compact hardware that runs Guardian AI engine",
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
        title="Game Guardian OS Mini - Lightweight Linux OS for Compact Hardware"
        description="Full Linux-based operating system optimized for Raspberry Pi, Orange Pi, and compact hardware. Run the Guardian AI engine independently with USB bootable, VM, and container support."
        keywords="game guardian os mini, linux os gaming, raspberry pi safety, ai monitoring os, compact hardware protection"
        canonicalUrl="https://guardianai.co.uk/products/os-mini"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4">Operating System</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Game Guardian OS Mini
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              A full Linux-based operating system for compact hardware like Jetson Nano, Orange Pi, or Raspberry Pi. 
              Runs the Guardian AI engine in a lightweight, secure environment with multiple deployment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Download Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/how-to-guide")}>
                Installation Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="hover:border-primary/50 transition-colors">
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

          {/* Deployment Options */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Deployment Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deploymentOptions.map((option, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-base">{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">{option.useCase}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Compatible Hardware */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Compatible Hardware</h2>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {compatibleHardware.map((hardware, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{hardware.name}</h3>
                        <p className="text-sm text-muted-foreground">{hardware.specs}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-safe" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  <p><strong>CPU:</strong> ARM64 or x86_64</p>
                  <p><strong>RAM:</strong> 2GB</p>
                  <p><strong>Storage:</strong> 8GB</p>
                  <p><strong>Network:</strong> Wi-Fi or Ethernet</p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary">
                <CardHeader>
                  <Badge className="mx-auto mb-2">Recommended</Badge>
                  <CardTitle className="text-xl">Optimal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>CPU:</strong> ARM Cortex-A76+</p>
                  <p><strong>RAM:</strong> 4GB+</p>
                  <p><strong>Storage:</strong> 32GB+ SSD</p>
                  <p><strong>Network:</strong> Gigabit Ethernet</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">High Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>CPU:</strong> AI accelerator</p>
                  <p><strong>RAM:</strong> 8GB+</p>
                  <p><strong>Storage:</strong> NVMe SSD</p>
                  <p><strong>Network:</strong> Wi-Fi 6</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Why Choose OS Mini */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose OS Mini?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Perfect for parents who want to run the Guardian AI stack independently on dedicated monitoring hardware.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Cost Effective</h3>
                <p className="text-muted-foreground">Free OS that runs on affordable hardware starting from £50</p>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Complete Control</h3>
                <p className="text-muted-foreground">Full ownership and control of your family's safety monitoring</p>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">Easy Setup</h3>
                <p className="text-muted-foreground">Pre-configured with all Guardian AI services ready to activate</p>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Download Game Guardian OS Mini for free and start protecting your family today. 
              Complete installation guide and support included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Download Now - Free
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

export default ProductOSMini;