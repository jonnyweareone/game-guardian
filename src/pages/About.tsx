import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Target, Award, ArrowRight, Heart } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Shield,
      title: "Child Safety First",
      description: "Every decision we make is guided by our commitment to protecting children in digital environments"
    },
    {
      icon: Users,
      title: "Privacy Focused", 
      description: "We believe in strong privacy protections and giving families control over their data"
    },
    {
      icon: Target,
      title: "Innovation Driven",
      description: "We leverage cutting-edge AI technology to stay ahead of emerging online threats"
    },
    {
      icon: Heart,
      title: "Family Centered",
      description: "Our solutions are designed to strengthen family relationships, not replace communication"
    }
  ];

  const team = [
    {
      name: "Jonny Robinson",
      role: "Founder & CEO",
      background: "Father of 4 children, passionate about protecting families in the digital age",
      image: "/api/placeholder/150/150"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "Game Guardian AI established with mission to protect children in online gaming"
    },
    {
      year: "2024",
      title: "AI Engine Developed",
      description: "Breakthrough in real-time voice analysis for threat detection completed"
    },
    {
      year: "2024",
      title: "UK Patent Filed",
      description: "Patent pending status achieved for innovative AI voice analysis technology"
    },
    {
      year: "2024",
      title: "Product Launch",
      description: "Game Guardian ecosystem officially launched to protect families worldwide"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Game Guardian AI",
    "description": "AI-powered child safety technology for online gaming environments",
    "url": "https://guardianai.co.uk",
    "foundingDate": "2023",
    "founder": [
      {
        "@type": "Person",
        "name": "Jonny Robinson"
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="About Game Guardian AI - Protecting Children in Online Gaming"
        description="Learn about Game Guardian AI's mission to protect children in online gaming environments. Meet our team, values, and commitment to family digital safety."
        keywords="about game guardian ai, child safety company, gaming protection team, ai safety mission, family digital protection"
        canonicalUrl="https://guardianai.co.uk/about"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About Game Guardian AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to make online gaming safer for children while preserving the fun and connection that makes gaming special.
            </p>
          </div>

          {/* Mission Statement */}
          <section className="mb-20">
            <Card className="max-w-4xl mx-auto border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To protect children from online threats in gaming environments using advanced artificial intelligence, 
                  while empowering parents with the tools and insights they need to keep their families safe in the digital age. 
                  We believe that with the right technology, children can enjoy the benefits of online gaming without compromising their safety.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Our Story */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Game Guardian AI was founded in 2023 by Jonny Robinson, a father of 4 who recognized 
                    that existing online safety tools weren't designed for the unique challenges of gaming environments.
                  </p>
                  <p>
                    As a parent witnessing firsthand how children were being exposed to cyberbullying, grooming attempts, and 
                    inappropriate content during gaming sessions, Jonny set out to create a solution that could 
                    protect kids without destroying the social and educational benefits of online gaming.
                  </p>
                  <p>
                    Today, we're proud to offer the world's first AI-powered safety system specifically designed for 
                    gaming environments, backed by UK patent-pending technology and trusted by families across the globe.
                  </p>
                </div>
              </div>
              <div>
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Why We're Different</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Built specifically for gaming environments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Real-time AI analysis, not keyword blocking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Privacy-first approach to family data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Designed by parents, for parents</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="mx-auto p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Team */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Founder</h2>
            <div className="flex justify-center">
              <Card className="text-center hover:border-primary/50 transition-colors max-w-md">
                <CardHeader>
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{team[0].name}</CardTitle>
                  <Badge variant="outline">{team[0].role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{team[0].background}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {milestone.year}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-16 bg-border mt-4"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Patents & Recognition */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Patents & Recognition</h2>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Award className="mr-2 h-4 w-4" />
                UK Patent Pending
              </Badge>
            </div>
            <Card className="max-w-4xl mx-auto text-center p-8">
              <CardContent>
                <p className="text-lg text-muted-foreground">
                  Our innovative AI voice analysis technology has received UK Patent Pending status, 
                  recognizing the groundbreaking nature of our approach to real-time threat detection 
                  in gaming voice communications.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact CTA */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you're a parent looking to protect your family, a researcher interested in AI safety, 
              or a potential partner, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Protecting Your Family
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
