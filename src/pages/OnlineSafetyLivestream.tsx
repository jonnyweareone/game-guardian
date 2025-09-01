
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import speakers from '@/data/livestreamSpeakers';

export default function OnlineSafetyLivestream() {
  return (
    <div className="min-h-screen bg-background">
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

      {/* Streaming Links Section */}
      <div className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Watch Live or Catch the Replay</h2>
            <p className="text-muted-foreground">Streaming links coming soon</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                id="btnLinkedInStream"
                disabled 
                className="opacity-50 cursor-not-allowed"
                title="Links available closer to the event"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                LinkedIn (coming soon)
              </Button>
              <Button 
                id="btnFacebookStream"
                disabled 
                className="opacity-50 cursor-not-allowed"
                title="Links available closer to the event"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Facebook (coming soon)
              </Button>
              <Button 
                id="btnYouTubeStream"
                disabled 
                className="opacity-50 cursor-not-allowed"
                title="Links available closer to the event"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                YouTube (coming soon)
              </Button>
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
                    <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary" />
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
