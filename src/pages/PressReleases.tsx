import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Download, ExternalLink, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PressReleases = () => {
  const navigate = useNavigate();

  const pressReleases = [
    {
      title: "Game Guardian AI Launches Revolutionary Child Safety Technology for Online Gaming",
      excerpt: "UK-based startup introduces the first AI-powered system specifically designed to protect children from online threats during gaming sessions, addressing growing concerns about digital safety.",
      date: "2024-12-15",
      category: "Product Launch",
      slug: "game-guardian-ai-launch",
      featured: true
    },
    {
      title: "Game Guardian Receives UK Patent Pending Status for AI Voice Analysis Technology",
      excerpt: "Innovative artificial intelligence algorithms for real-time voice threat detection in gaming environments receive intellectual property protection.",
      date: "2024-11-20",
      category: "IP & Patents",
      slug: "uk-patent-pending"
    },
    {
      title: "Gaming Safety Study Reveals 78% of Parents Concerned About Online Threats",
      excerpt: "New research commissioned by Game Guardian highlights urgent need for better protection systems in online gaming environments.",
      date: "2024-10-15",
      category: "Research",
      slug: "gaming-safety-study"
    },
    {
      title: "Game Guardian OS Mini Now Available for Raspberry Pi and Compact Hardware",
      excerpt: "Free Linux-based operating system enables parents to deploy AI-powered gaming protection on affordable hardware platforms.",
      date: "2024-09-28",
      category: "Product Update",
      slug: "os-mini-release"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Game Guardian Press Releases",
    "description": "Latest news and announcements from Game Guardian AI",
    "url": "https://guardianai.co.uk/press-releases"
  };

  return (
    <>
      <SEOHead
        title="Guardian AI Press Releases - Latest News & Announcements"
        description="Get the latest news from Guardian AI Limited about Guardian OS launch, child online safety innovations, and family protection technology updates. Official press releases and media resources."
        keywords="Guardian AI press releases, Guardian OS news, child safety technology, parental controls, online safety announcements, media resources"
        canonicalUrl="https://gameguardian.ai/press-releases"
        ogImage="/lovable-uploads/guardian-logo-shield-text-dark.png"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Guardian AI Press Releases",
          "description": "Latest news and announcements from Guardian AI Limited about Guardian OS and child online safety technology",
          "url": "https://gameguardian.ai/press-releases",
          "publisher": {
            "@type": "Organization",
            "name": "Guardian AI Limited",
            "logo": {
              "@type": "ImageObject",
              "url": "https://gameguardian.ai/lovable-uploads/guardian-logo-shield-text-dark.png"
            }
          }
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Press Releases
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Latest news, product announcements, and company updates from Game Guardian AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/contact")}>
                Media Inquiries
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Press Kit
              </Button>
            </div>
          </div>

          {/* Featured Press Release */}
          {pressReleases.filter(pr => pr.featured).map((release) => (
            <section key={release.slug} className="mb-16">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer border-primary/20" onClick={() => navigate(`/press-releases/${release.slug}`)}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="default">Latest Release</Badge>
                    <Badge variant="outline">{release.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl">{release.title}</CardTitle>
                  <CardDescription className="text-lg mt-4">{release.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(release.date).toLocaleDateString()}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Read Full Release
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          ))}

          {/* All Press Releases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">All Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/press-releases/${release.slug}`)}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline">{release.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(release.date).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-2">{release.title}</CardTitle>
                        <CardDescription>{release.excerpt}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Read More
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Media Resources */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Media Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Press Kit</CardTitle>
                  <CardDescription>
                    High-resolution logos, product images, and company information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Kit
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Executive Bios</CardTitle>
                  <CardDescription>
                    Leadership team profiles and professional headshots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Bios
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Product Demos</CardTitle>
                  <CardDescription>
                    Video demonstrations and technical specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Demos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Media Contact */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              For media inquiries, interview requests, or additional information, please contact our press team.
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Press Contact</p>
                <p className="text-muted-foreground">press@guardianai.co.uk</p>
              </div>
              <div>
                <p className="font-semibold">Response Time</p>
                <p className="text-muted-foreground">We typically respond within 24 hours</p>
              </div>
            </div>
            <Button className="mt-6" onClick={() => navigate("/contact")}>
              Contact Press Team
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PressReleases;