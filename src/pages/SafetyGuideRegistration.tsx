import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Shield, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

export default function SafetyGuideRegistration() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    childrenAges: "",
    primaryConcerns: "",
    parentType: "",
    communicationPreference: "email",
    agreedToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast.error("Please agree to the terms to continue");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Registration successful! You'll receive your safety guide soon.");
    }, 1500);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SEOHead 
          title="Registration Complete - Online Safety Guide"
          description="Thank you for registering for our comprehensive online safety guide for children"
          keywords="online safety guide, child protection, digital parenting, internet safety"
        />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Registration Complete!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for registering for our comprehensive online safety guide. 
              You'll receive your digital guide within the next 24 hours.
            </p>
            
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">1</span>
                  </div>
                  <p className="text-sm">Check your email for a confirmation message</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">2</span>
                  </div>
                  <p className="text-sm">Receive your personalized online safety guide</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">3</span>
                  </div>
                  <p className="text-sm">Implement the safety strategies with your family</p>
                </div>
              </CardContent>
            </Card>
            
            <Button asChild>
              <a href="/online-safety-livestream">Back to Livestream</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SEOHead 
        title="Get Your Free Online Safety Guide - Protecting Children Online"
        description="Register to receive a comprehensive guide on keeping your children safe online. Expert tips, practical advice, and actionable strategies for digital parenting."
        keywords="online safety guide, child protection, digital parenting, internet safety, cyberbullying prevention"
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="flex justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground">
              Get Your Free Online Safety Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Receive a comprehensive guide with expert strategies, practical tips, and actionable steps 
              to keep your children safe in the digital world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Register for Your Safety Guide</CardTitle>
                <CardDescription>
                  Fill out the form below to receive your personalized online safety guide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentType">I am a...</Label>
                    <Select value={formData.parentType} onValueChange={(value) => handleInputChange("parentType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="educator">Educator/Teacher</SelectItem>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childrenAges">Children's Ages (optional)</Label>
                    <Input
                      id="childrenAges"
                      placeholder="e.g., 8, 12, 15"
                      value={formData.childrenAges}
                      onChange={(e) => handleInputChange("childrenAges", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryConcerns">Primary Online Safety Concerns (optional)</Label>
                    <Textarea
                      id="primaryConcerns"
                      placeholder="What are your main concerns about your children's online safety?"
                      value={formData.primaryConcerns}
                      onChange={(e) => handleInputChange("primaryConcerns", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to receive the safety guide and occasional updates about child online safety
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Get My Safety Guide"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* What You'll Receive */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    What You'll Receive
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Comprehensive Safety Checklist</h4>
                      <p className="text-sm text-muted-foreground">Step-by-step actions to secure your home network and devices</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Age-Appropriate Guidelines</h4>
                      <p className="text-sm text-muted-foreground">Tailored advice for different age groups and developmental stages</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Communication Scripts</h4>
                      <p className="text-sm text-muted-foreground">Ready-to-use conversation starters about online safety</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Emergency Response Plan</h4>
                      <p className="text-sm text-muted-foreground">What to do if something goes wrong online</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Recommended Tools & Apps</h4>
                      <p className="text-sm text-muted-foreground">Curated list of safety tools and parental control options</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="font-medium">📧 Delivered to your inbox</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive your guide within 24 hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}