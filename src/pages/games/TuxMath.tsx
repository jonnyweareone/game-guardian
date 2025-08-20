import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function TuxMathGame() {
  const [searchParams] = useSearchParams();
  const childToken = searchParams.get('token');

  useEffect(() => {
    // Initialize Nova Game SDK if token is available
    if (childToken && window.NovaGame) {
      window.NovaGame.init({ bearerToken: childToken });
    }
  }, [childToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
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
          <h1 className="text-3xl font-bold text-blue-900">➕ TuxMath</h1>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mathematics Practice Game</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🎯 Complete levels with ≥90% accuracy for bonus XP</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-gray-100 p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">🧮</div>
                <h3 className="text-xl font-semibold">TuxMath Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're preparing an interactive mathematics game where you can practice arithmetic 
                  while helping Tux the penguin defend against falling math problems.
                </p>
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">How to Earn XP:</h4>
                  <ul className="text-sm text-left space-y-1">
                    <li>• Complete Level 1: 15 XP</li>
                    <li>• Complete Level 2 with ≥90% accuracy: 25 XP + 10 bonus</li>
                    <li>• Perfect accuracy (100%): Additional 5 XP bonus</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('https://tuxmath.sourceforge.net/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Learn More About TuxMath
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Load Nova Game SDK and TuxMath shim */}
        <script src="/nova-game.js"></script>
        <script src="/shims/tuxmath.js"></script>
      </div>
    </div>
  );
}