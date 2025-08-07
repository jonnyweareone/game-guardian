import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { PlayCircle, CheckCircle, AlertTriangle, Settings, ArrowRight, Download } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const HowToGuide = () => {
  const navigate = useNavigate();

  const setupSteps = [
    {
      title: "Create Your Account",
      description: "Sign up for a free Game Guardian account to access the parent dashboard",
      icon: CheckCircle,
      details: [
        "Visit guardianai.co.uk and click 'Get Started'",
        "Enter your email and create a secure password",
        "Verify your email address",
        "Complete the parent profile setup"
      ]
    },
    {
      title: "Add Your Child's Profile",
      description: "Set up monitoring preferences and safety settings for each child",
      icon: Settings,
      details: [
        "Click 'Add Child' in your dashboard",
        "Enter your child's name and age",
        "Set appropriate content filters",
        "Configure notification preferences",
        "Review and save the profile"
      ]
    },
    {
      title: "Choose Your Protection Method",
      description: "Select and set up the Game Guardian solution that fits your needs",
      icon: PlayCircle,
      details: [
        "Game Guardian Device: Connect via USB or Bluetooth",
        "OS Mini: Install on Raspberry Pi or compact hardware",
        "OS Full: Replace or dual-boot on gaming PC",
        "Follow device-specific setup instructions"
      ]
    },
    {
      title: "Connect and Monitor",
      description: "Link your device and start receiving real-time protection",
      icon: AlertTriangle,
      details: [
        "Pair your device with your account",
        "Test the audio monitoring connection",
        "Verify notifications are working",
        "Begin monitoring your child's gaming sessions"
      ]
    }
  ];

  const commonQuestions = [
    {
      question: "How do I set up my first Game Guardian device?",
      answer: "After creating your account and child profile, connect your Game Guardian device via USB or Bluetooth. Follow the pairing wizard in your dashboard to link the device to your child's profile. The AI will begin monitoring immediately after setup is complete."
    },
    {
      question: "What should I do when I receive an alert?",
      answer: "Review the alert details in your dashboard, which include context and AI analysis. For high-priority alerts, consider having a conversation with your child about what happened. Use this as an opportunity to educate about online safety rather than punish."
    },
    {
      question: "How do I adjust sensitivity settings?",
      answer: "Go to Settings > Monitoring Preferences in your dashboard. You can adjust the AI sensitivity for different types of threats, set custom keywords to monitor, and configure which types of incidents trigger immediate alerts versus summary reports."
    },
    {
      question: "Can I monitor multiple children with one account?",
      answer: "Yes! You can add multiple child profiles to your account. Each child can have their own monitoring preferences, and you can pair multiple devices to monitor different gaming setups or locations."
    },
    {
      question: "How do I install Game Guardian OS on my child's PC?",
      answer: "Download the Game Guardian OS installer from your dashboard. You can choose to replace the existing OS or set up dual-boot. The installation wizard will guide you through the process, including automatic driver detection and child profile setup."
    },
    {
      question: "What games and platforms are supported?",
      answer: "Game Guardian works with any game or platform that uses voice chat, including PC games, console games, Discord, Steam, Xbox Live, PlayStation Network, and more. The AI monitors audio regardless of the specific application."
    },
    {
      question: "How do I update my notification preferences?",
      answer: "Visit Settings > Notifications in your dashboard. You can choose to receive alerts via email, SMS, push notification, or all three. Set quiet hours, emergency override settings, and customize which types of alerts require immediate notification."
    },
    {
      question: "What if my child tries to bypass the system?",
      answer: "Game Guardian OS includes tamper protection that prevents unauthorized changes. The system continues monitoring even if your child attempts to disable protection. You'll receive alerts about any bypass attempts."
    }
  ];

  const troubleshooting = [
    {
      issue: "Device won't pair with my account",
      solution: "Ensure your device is connected to Wi-Fi and try resetting the device by holding the power button for 10 seconds. Check that you're using the correct device ID from the activation screen."
    },
    {
      issue: "Not receiving audio from gaming sessions",
      solution: "Verify your headset is properly connected and that audio levels are sufficient. Check the audio input settings in your dashboard and ensure the correct audio source is selected."
    },
    {
      issue: "Missing or delayed notifications",
      solution: "Check your notification settings and ensure your contact information is up to date. Verify that emails aren't going to spam and that SMS notifications are enabled for your phone number."
    },
    {
      issue: "Child complains about audio quality issues",
      solution: "Game Guardian should not affect audio quality. Check all connections are secure and that the device has the latest firmware. Contact support if audio quality problems persist."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Set Up Game Guardian Child Safety Monitoring",
    "description": "Complete guide for parents on setting up and using Game Guardian AI-powered child safety monitoring for online gaming",
    "totalTime": "PT30M",
    "supply": [
      "Game Guardian device or OS installation",
      "Gaming setup (PC, console, or mobile)",
      "Internet connection"
    ]
  };

  return (
    <>
      <SEOHead
        title="How to Use Game Guardian - Complete Parent Setup Guide"
        description="Step-by-step guide for parents on setting up Game Guardian AI-powered child safety monitoring. Learn how to protect your children in online gaming environments."
        keywords="game guardian setup guide, child safety monitoring, gaming protection tutorial, parent guide ai safety, how to protect kids gaming"
        canonicalUrl="https://guardianai.co.uk/how-to-guide"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Parent's Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Everything you need to know to protect your children in online gaming environments with Game Guardian AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started Free
              </Button>
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Guide
              </Button>
            </div>
          </div>

          {/* Quick Start Video */}
          <section className="mb-20">
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Quick Start Video</CardTitle>
                <CardDescription>
                  Watch this 5-minute overview to get started with Game Guardian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Coming Soon: Setup Tutorial Video</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Setup Steps */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Getting Started in 4 Simple Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {setupSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={index} className="text-center hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                        {index + 1}
                      </div>
                      <IconComponent className="h-8 w-8 text-primary mx-auto mb-4" />
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground text-left space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-safe mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {commonQuestions.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Troubleshooting Common Issues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {troubleshooting.map((item, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      {item.issue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.solution}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Best Practices */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Best Practices for Parents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <h3 className="text-lg font-semibold mb-4">Open Communication</h3>
                <p className="text-muted-foreground">
                  Discuss online safety with your children regularly. Use alerts as conversation starters rather than punishment triggers.
                </p>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-lg font-semibold mb-4">Review Settings Monthly</h3>
                <p className="text-muted-foreground">
                  Adjust monitoring sensitivity and review your child's gaming patterns to ensure appropriate protection levels.
                </p>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
                <p className="text-muted-foreground">
                  Keep your Game Guardian system updated and review our blog for the latest online safety tips and threats.
                </p>
              </Card>
            </div>
          </section>

          {/* Support CTA */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Need Additional Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is here to help you protect your family. Get personalized assistance with setup, 
              configuration, and ongoing monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/blog")}>
                Read Safety Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowToGuide;