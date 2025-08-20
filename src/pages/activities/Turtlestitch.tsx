import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function TurtlestitchActivity() {
  const [searchParams] = useSearchParams();
  const childToken = searchParams.get('token');

  useEffect(() => {
    // Initialize Nova Game SDK if token is available
    if (childToken && window.NovaGame) {
      window.NovaGame.init({ bearerToken: childToken });
    }
  }, [childToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Education
          </Button>
          <h1 className="text-3xl font-bold text-green-900">🎨 Turtlestitch</h1>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Creative Coding & Embroidery</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🎯 Export patterns with ≥100 stitches for XP</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-gray-100 p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">🧵</div>
                <h3 className="text-xl font-semibold">Turtlestitch Coming Soon</h3>
                <p className="text-muted-foreground">
                  Combine coding with creativity! Use visual programming to create beautiful 
                  embroidery patterns that can be exported for real stitching machines.
                </p>
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">How to Earn XP:</h4>
                  <ul className="text-sm text-left space-y-1">
                    <li>• Export a pattern (≥100 stitches): 25 XP</li>
                    <li>• Complex patterns (≥500 stitches): +10 bonus XP</li>
                    <li>• Creative use of loops and functions: +5 XP</li>
                    <li>• Share your pattern: +5 XP</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('https://www.turtlestitch.org/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Explore Turtlestitch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Load Nova Game SDK and Turtlestitch shim */}
        <script src="/nova-game.js"></script>
        <script src="/shims/turtlestitch.js"></script>
      </div>
    </div>
  );
}