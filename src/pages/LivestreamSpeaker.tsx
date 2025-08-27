
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import speakers from '@/data/livestreamSpeakers';

export default function LivestreamSpeaker() {
  const { speakerSlug } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    comfortable: true,
    notes: '',
    preferredIntro: '',
    techNotes: '',
    headshot: null as File | null,
  });

  const speaker = speakers.find(s => s.slug === speakerSlug);

  if (!speaker) {
    return <Navigate to="/online-safety-livestream" replace />;
  }

  // Initialize preferred intro if not set
  React.useEffect(() => {
    if (!formData.preferredIntro && speaker.preferredIntro) {
      setFormData(prev => ({
        ...prev,
        preferredIntro: speaker.preferredIntro
      }));
    }
  }, [speaker.preferredIntro, formData.preferredIntro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('speakerSlug', speaker.slug);
      formDataToSend.append('comfortable', formData.comfortable.toString());
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('preferredIntro', formData.preferredIntro);
      formDataToSend.append('techNotes', formData.techNotes);
      formDataToSend.append('userAgent', navigator.userAgent);
      
      if (formData.headshot) {
        formDataToSend.append('headshot', formData.headshot);
      }

      const response = await fetch('/api/livestream/feedback', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for your input. We'll be in touch with any updates.",
      });

      // Clear form
      setFormData({
        comfortable: true,
        notes: '',
        preferredIntro: speaker.preferredIntro,
        techNotes: '',
        headshot: null,
      });

    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/online-safety-livestream" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event Page
        </Link>

        {/* Speaker Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{speaker.name}</h1>
            <p className="text-xl text-muted-foreground">{speaker.tagline}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Speaker Briefing & Feedback
          </Badge>
        </div>

        {/* Bio Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About You</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{speaker.bio}</p>
          </CardContent>
        </Card>

        {/* Agenda Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Event Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {speaker.agenda.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Seed Questions Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Discussion Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {speaker.seedQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Badge variant="secondary" className="min-w-6 h-6 flex items-center justify-center text-xs">
                    Q{index + 1}
                  </Badge>
                  <p className="font-medium">{question}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prep Notes Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preparation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {speaker.prepNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feedback & Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Comfortable with questions */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Are you comfortable with these questions?</Label>
                  <p className="text-sm text-muted-foreground">
                    Let us know if you'd like any adjustments
                  </p>
                </div>
                <Switch
                  checked={formData.comfortable}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, comfortable: checked }))
                  }
                />
              </div>

              {/* Notes / suggested edits */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Suggested Edits</Label>
                <Textarea
                  id="notes"
                  placeholder="Any questions you'd like to add, remove, or modify?"
                  value={formData.notes}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              {/* Preferred intro */}
              <div className="space-y-2">
                <Label htmlFor="preferredIntro">Preferred Introduction</Label>
                <Textarea
                  id="preferredIntro"
                  placeholder="How would you like to be introduced?"
                  value={formData.preferredIntro}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, preferredIntro: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* Headshot upload */}
              <div className="space-y-2">
                <Label htmlFor="headshot">Upload Updated Headshot (Optional)</Label>
                <Input
                  id="headshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      headshot: e.target.files?.[0] || null 
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Square photos work best. We'll use your existing headshot if none provided.
                </p>
              </div>

              {/* Tech notes */}
              <div className="space-y-2">
                <Label htmlFor="techNotes">Tech/Logistics Notes</Label>
                <Textarea
                  id="techNotes"
                  placeholder="Any questions about microphone, camera, timing, or other logistics?"
                  value={formData.techNotes}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, techNotes: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guardian OS Footer Banner */}
        <div className="py-8 text-center border-t">
          <div className="flex items-center justify-center gap-4">
            <span className="text-lg font-medium">Powered by Guardian OS — Technology for Safer Digital Lives</span>
            <Link to="/products">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
