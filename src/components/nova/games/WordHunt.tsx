import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WordHuntProps {
  pageText: string;
  childId: string;
  bookId: string;
}

function pickDifficultWord(text: string): string {
  // Extract words, filter for interesting ones
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 4 && word.length <= 8)
    .filter(word => !/^(the|and|that|this|with|have|for|not|you|all|can|but|are|they|one|was|her|his|she|him|our|out|day|get|may|new|now|old|see|two|way|who|boy|did|its|let|put|say|she|too|use)$/.test(word));
  
  // Return a random word or fallback
  return words.length > 0 ? words[Math.floor(Math.random() * words.length)] : 'word';
}

export function WordHunt({ pageText, childId, bookId }: WordHuntProps) {
  const [sessionId, setSessionId] = useState<string>();
  const [targetWord, setTargetWord] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [found, setFound] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize game session
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase
          .from('nova_games_sessions')
          .insert({
            child_id: childId,
            book_id: bookId,
            game_code: 'word_hunt'
          })
          .select('id')
          .single();

        if (error) throw error;
        setSessionId(data.id);
        setTargetWord(pickDifficultWord(pageText));
      } catch (error) {
        console.error('Error creating game session:', error);
      }
    };

    if (childId && bookId && pageText) {
      initSession();
    }
  }, [childId, bookId, pageText]);

  const startHunt = useCallback(() => {
    setIsActive(true);
    setFound(false);
    setStartTime(Date.now());
  }, []);

  const handleWordFound = useCallback(async () => {
    if (!isActive || !sessionId) return;

    const seconds = Math.round((Date.now() - startTime) / 1000);
    setFound(true);
    setIsActive(false);
    setScore(prev => prev + Math.max(1, 10 - seconds)); // Bonus for speed

    try {
      // Record the round
      await supabase.from('nova_games_rounds').insert({
        session_id: sessionId,
        round_no: 1,
        target_word: targetWord,
        success: true,
        seconds
      });

      // Award coins through rewards system
      await supabase.from('rewards_ledger').insert({
        child_id: childId,
        source: 'word_hunt_game',
        points: 1,
        meta: { word: targetWord, seconds, book_id: bookId }
      });
    } catch (error) {
      console.error('Error recording game result:', error);
    }
  }, [isActive, sessionId, targetWord, startTime, childId, bookId]);

  const newWord = useCallback(() => {
    setTargetWord(pickDifficultWord(pageText));
    setFound(false);
    setIsActive(false);
  }, [pageText]);

  if (!targetWord) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading word hunt...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Word Hunt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Find this word on the page:</div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {targetWord}
          </Badge>
        </div>

        <div className="flex gap-2 justify-center">
          {!isActive && !found && (
            <Button onClick={startHunt} className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Start Hunt
            </Button>
          )}
          
          {isActive && (
            <Button onClick={handleWordFound} variant="outline">
              Found It!
            </Button>
          )}

          {found && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-green-600">
                <Trophy className="h-4 w-4" />
                Great job! +1 coin
              </div>
              <Button onClick={newWord} size="sm">
                New Word
              </Button>
            </div>
          )}
        </div>

        {score > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Score: {score} points
          </div>
        )}
      </CardContent>
    </Card>
  );
}