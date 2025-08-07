import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Volume2, Eye, EyeOff, Clock, Users, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationMessage {
  timestamp: string;
  speaker: string;
  message: string;
}

interface Conversation {
  id: string;
  child_id: string;
  session_start: string;
  session_end?: string;
  platform: string;
  participants: string[];
  sentiment_score: number;
  conversation_type: string;
  risk_assessment: string;
  transcript: ConversationMessage[];
}

interface ConversationViewerProps {
  conversation: Conversation;
  childName: string;
  onClose: () => void;
}

const getSentimentIcon = (score: number) => {
  if (score > 0.3) return '😊';
  if (score > 0) return '😐';
  if (score > -0.3) return '😟';
  return '😡';
};

const getSentimentColor = (score: number) => {
  if (score > 0.3) return 'text-safe';
  if (score > 0) return 'text-muted-foreground';
  if (score > -0.3) return 'text-warning';
  return 'text-critical';
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical': return 'critical';
    case 'high': return 'warning';
    case 'medium': return 'warning';
    case 'low': return 'safe';
    default: return 'muted';
  }
};

const ConversationViewer = ({ conversation, childName, onClose }: ConversationViewerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const duration = conversation.session_end 
    ? new Date(conversation.session_end).getTime() - new Date(conversation.session_start).getTime()
    : 0;
  
  const durationMinutes = Math.round(duration / (1000 * 60));

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Mock playback - in real app this would control audio playback
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{childName}'s Conversation</CardTitle>
              <Badge variant={getRiskColor(conversation.risk_assessment) === 'critical' ? 'destructive' : 'secondary'}>
                {conversation.risk_assessment.toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(conversation.session_start), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {conversation.participants.length} participants
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {conversation.platform}
              </span>
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            <EyeOff className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Summary & Sentiment */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="text-2xl">
                {getSentimentIcon(conversation.sentiment_score)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {conversation.sentiment_score > 0 ? (
                      <TrendingUp className={`h-4 w-4 ${getSentimentColor(conversation.sentiment_score)}`} />
                    ) : (
                      <TrendingDown className={`h-4 w-4 ${getSentimentColor(conversation.sentiment_score)}`} />
                    )}
                    <span className={`text-sm font-medium ${getSentimentColor(conversation.sentiment_score)}`}>
                      Sentiment: {(conversation.sentiment_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Badge variant="outline">
                    {conversation.conversation_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {conversation.risk_assessment === 'critical' && 
                    'This conversation contains concerning content that requires immediate attention. Multiple red flags detected including personal information sharing and meeting requests.'}
                  {conversation.risk_assessment === 'high' && 
                    'This conversation shows warning signs that should be discussed with your child. Monitor for similar interactions.'}
                  {conversation.risk_assessment === 'low' && 
                    'This conversation shows positive social interaction and healthy gaming behavior.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock Playback Controls */}
        {conversation.conversation_type === 'voice_chat' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant={isPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/3"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {durationMinutes} min
                </span>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        <div>
          <h3 className="font-semibold mb-3">Participants</h3>
          <div className="flex flex-wrap gap-2">
            {conversation.participants.map((participant, index) => (
              <Badge 
                key={index}
                variant={participant === childName ? "default" : "outline"}
              >
                {participant === childName ? `${participant} (Your Child)` : participant}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Transcript */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Conversation Transcript</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
            >
              {showFullTranscript ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Full Transcript
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="h-64 border rounded-md p-4">
            <div className="space-y-3">
              {(showFullTranscript ? conversation.transcript : conversation.transcript.slice(0, 3))
                .map((message, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-16 text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <Badge 
                        variant={message.speaker === childName ? "default" : "outline"}
                        className="text-xs"
                      >
                        {message.speaker}
                      </Badge>
                      <p className="text-sm leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {!showFullTranscript && conversation.transcript.length > 3 && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFullTranscript(true)}
                  >
                    ... {conversation.transcript.length - 3} more messages
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationViewer;