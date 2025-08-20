import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play } from 'lucide-react';

interface GameActivityItem {
  id: string;
  title: string;
  kind: 'game' | 'activity';
  subject: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  xpReward: string;
  launchUrl: string;
}

const GAME_ACTIVITIES: GameActivityItem[] = [
  {
    id: 'tuxmath',
    title: 'TuxMath',
    kind: 'game',
    subject: 'Maths', 
    description: 'Help Tux the penguin by solving math problems before they hit the ground!',
    icon: '➕',
    difficulty: 'Easy',
    estimatedTime: '10-15 min',
    xpReward: '15-35 XP',
    launchUrl: '/games/tuxmath'
  },
  {
    id: 'blockly-maze',
    title: 'Blockly: Maze',
    kind: 'game',
    subject: 'Computing',
    description: 'Learn programming by dragging blocks to guide a character through mazes.',
    icon: '💻',
    difficulty: 'Medium',
    estimatedTime: '15-20 min', 
    xpReward: '20-35 XP',
    launchUrl: '/games/blockly/maze'
  },
  {
    id: 'turtlestitch',
    title: 'Turtlestitch',
    kind: 'activity',
    subject: 'Art',
    description: 'Create beautiful embroidery patterns using visual programming blocks.',
    icon: '🎨',
    difficulty: 'Medium',
    estimatedTime: '20-30 min',
    xpReward: '25-35 XP', 
    launchUrl: '/activities/turtlestitch'
  },
  {
    id: 'novabooks',
    title: 'Nova Books',
    kind: 'activity', 
    subject: 'Reading',
    description: 'Read interactive books with AI-powered illustrations and voice narration.',
    icon: '📖',
    difficulty: 'Easy',
    estimatedTime: '15-45 min',
    xpReward: '4 XP per page',
    launchUrl: '/novalearning'
  }
];

interface GameActivityGridProps {
  filter?: 'all' | 'games' | 'activities';
  childId?: string;
}

export default function GameActivityGrid({ filter = 'all', childId }: GameActivityGridProps) {
  const filteredItems = GAME_ACTIVITIES.filter(item => {
    if (filter === 'all') return true;
    return filter === 'games' ? item.kind === 'game' : item.kind === 'activity';
  });

  const handleLaunch = async (item: GameActivityItem) => {
    let url = item.launchUrl;
    
    // For games/activities that need child authentication, mint a token
    if (childId && item.id !== 'novabooks') {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('nova-mint-child-token', {
          body: { child_id: childId }
        });
        
        if (!error && data?.token) {
          url += `?token=${data.token}`;
        }
      } catch (error) {
        console.error('Error minting child token:', error);
      }
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.subject}</p>
                </div>
              </div>
              <Badge 
                variant={item.kind === 'game' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {item.kind}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{item.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {item.difficulty}
                </span>
                <span>⏱️ {item.estimatedTime}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.xpReward}
              </Badge>
            </div>
            
            <Button 
              onClick={() => handleLaunch(item)}
              className="w-full flex items-center gap-2"
              variant={item.kind === 'game' ? 'default' : 'secondary'}
            >
              {item.kind === 'game' ? <Play className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
              {item.kind === 'game' ? 'Play Game' : 'Start Activity'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}