
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import speakers from '@/data/livestreamSpeakers';
import SEOHead from '@/components/SEOHead';
import shareImage from '@/assets/online-safety-livestream-share.jpg';

export default function OnlineSafetyLivestream() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Online Safety For Children Live Panel",
    "description": "A live-streamed discussion giving parents, carers, and professionals clear, practical advice on keeping children safe online.",
    "startDate": "2024-09-11T19:30:00+01:00",
    "endDate": "2024-09-11T20:30:00+01:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": "https://gameguardianai.com/online-safety-livestream"
    },
    "organizer": {
      "@type": "Organization",
      "name": "Guardian OS"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Online Safety For Children Live Panel | Guardian OS"
        description="Join our live panel discussion on children's online safety. Expert insights from safeguarding professionals, tech experts, and ISP leaders. Thursday 11th September 7:30-8:30 PM BST."
        keywords="online safety, children, parental controls, digital safety, livestream, panel discussion, Online Safety Act, safeguarding"
        canonicalUrl="https://gameguardianai.com/online-safety-livestream"
        ogImage={shareImage}
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Children's Online Safety: What Tech Can Do to Help
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A live-streamed discussion giving parents, carers, and professionals clear, practical advice on keeping children safe online. We'll explore current risks, the Online Safety Act, and how technology, safeguarding, and ISPs can work together.
            </p>
            
            {/* Event Details */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Thursday 11th September</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                <span>7:30–8:30 PM BST</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                <span>Live on LinkedIn, Facebook & YouTube</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Section */}
      <div className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">Watch Live</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative w-full" style={{paddingBottom: '56.25%'}}>
                <iframe 
                  src="https://streamyard.com/watch/ksTWs6r6XpXV?embed=true" 
                  className="absolute top-0 left-0 w-full h-full rounded-lg border"
                  frameBorder="0" 
                  allow="autoplay; fullscreen; camera; microphone; encrypted-media"
                  allowFullScreen
                  title="Online Safety For Children Live Panel"
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  If the stream doesn't load above, 
                  <Button variant="link" asChild className="p-0 h-auto text-sm">
                    <a href="https://streamyard.com/watch/ksTWs6r6XpXV" target="_blank" rel="noopener noreferrer">
                      watch directly on StreamYard
                    </a>
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Speakers Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Expert Panel</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leading voices in online safety, technology, regulation, and safeguarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {speakers.map((speaker) => (
              <Link key={speaker.slug} to={`/online-safety-livestream/speakers/${speaker.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-primary/10 flex items-center justify-center">
                      {speaker.headshotUrl ? (
                        <img 
                          src={speaker.headshotUrl} 
                          alt={`${speaker.name} headshot`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-12 w-12 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{speaker.name}</h3>
                      <p className="text-muted-foreground">{speaker.tagline}</p>
                    </div>
                    <p className="text-sm leading-relaxed">{speaker.bio}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Join Us Live — Ask Questions, Get Answers</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            This interactive discussion will provide practical steps you can take today to keep your children safer online.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Replay available after the event
          </Badge>
        </div>
      </div>

      {/* Guardian OS Footer Banner */}
      <div className="py-8 bg-secondary">
        <div className="container mx-auto px-4 text-center">
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
