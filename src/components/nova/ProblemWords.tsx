import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Volume2, BookOpen, Lightbulb, Play } from 'lucide-react';

interface ProblemWordsProps {
  sessionId: string;
  childId: string;
}

export const ProblemWords: React.FC<ProblemWordsProps> = ({ sessionId, childId }) => {
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());

  // Fetch problem words for this session
  const { data: problemWords } = useQuery({
    queryKey: ['nova-problem-words', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nova_problem_words')
        .select('*')
        .eq('session_id', sessionId)
        .order('count', { ascending: false });
      
      if (error) {
        console.error('Error fetching problem words:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!sessionId,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const toggleWordExpansion = (wordId: string) => {
    const newExpanded = new Set(expandedWords);
    if (newExpanded.has(wordId)) {
      newExpanded.delete(wordId);
    } else {
      newExpanded.add(wordId);
    }
    setExpandedWords(newExpanded);
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!problemWords || problemWords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Problem Words
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Great reading! No tricky words detected yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Problem Words ({problemWords.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {problemWords.map((word: any) => (
          <Collapsible 
            key={word?.id}
            open={expandedWords.has(word?.id)}
            onOpenChange={() => toggleWordExpansion(word?.id)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{word?.word}</span>
                  {word?.count > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {word.count}x
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(word?.word);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-background rounded-lg border space-y-3">
                {/* Phonetics */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Phonetics
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {word?.phonetics && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {word.phonetics}
                      </Badge>
                    )}
                    {word?.syllables && word.syllables.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {word.syllables.join('-')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Sounds */}
                {word?.sounds && word.sounds.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Sounds
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {word.sounds.map((sound: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs font-mono">
                          {sound}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Definition */}
                {word?.definition && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Definition
                    </div>
                    <p className="text-xs text-muted-foreground">{word.definition}</p>
                  </div>
                )}

                {/* Hints */}
                {word?.hints && word.hints.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Hints
                    </div>
                    <div className="space-y-1">
                      {word.hints.map((hint: string, index: number) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Future: Could open practice modal or navigate to practice page
                    speakWord(word?.word);
                  }}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Practice Word
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}