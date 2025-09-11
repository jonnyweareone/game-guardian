import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SafetyGuideRegistrationFormProps {
  variant?: 'full' | 'compact';
  onSuccess?: () => void;
}

export default function SafetyGuideRegistrationForm({ 
  variant = 'full',
  onSuccess 
}: SafetyGuideRegistrationFormProps) {
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
    
    try {
      const { error } = await supabase
        .from('safety_guide_registrations')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          parent_type: formData.parentType,
          children_ages: formData.childrenAges,
          primary_concerns: formData.primaryConcerns,
          communication_preference: formData.communicationPreference,
          agreed_to_terms: formData.agreedToTerms
        });

      if (error) {
        console.error('Registration error:', error);
        toast.error("Registration failed. Please try again.");
        return;
      }

      setIsSubmitted(true);
      toast.success("Registration successful! You'll receive your safety guide soon.");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold">Registration Complete!</h3>
          <p className="text-muted-foreground">
            Thank you for registering for our comprehensive online safety guide. 
            You'll receive your digital guide within the next 24 hours.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-left">What's Next?</h4>
            <div className="space-y-2 text-left">
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
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Get Your Free Safety Guide</CardTitle>
          <CardDescription>
            Register to receive expert tips and strategies for keeping your children safe online.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="parentType" className="text-sm">I am a...</Label>
              <Select value={formData.parentType} onValueChange={(value) => handleInputChange("parentType", value)}>
                <SelectTrigger className="h-9">
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
              />
              <Label htmlFor="terms" className="text-xs leading-tight">
                I agree to receive the safety guide and occasional updates about child online safety
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? "Registering..." : "Get My Safety Guide"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
}