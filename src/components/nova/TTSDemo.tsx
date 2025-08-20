import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Mic, Sparkles } from 'lucide-react';
import { EnhancedTextToSpeechPlayer } from './EnhancedTextToSpeechPlayer';

const demoTexts = {
  multiVoice: `"Look at that amazing rainbow!" said little Emma, jumping with excitement.

The wise old wizard nodded slowly. "Indeed, young one. Each color holds a special magic," he explained in his deep, knowing voice.

"Can I touch it?" the curious teenager Jake asked, reaching toward the shimmering arc.

"Patience, my children," the gentle grandmother smiled. "Some wonders are meant to be admired from afar."

The magical unicorn whinnied softly, its horn glowing with ethereal light.`,
  
  singleVoice: `Once upon a time, in a land far away, there lived a kind princess who loved to read books. Every day, she would sit by her castle window and read wonderful stories about brave knights, friendly dragons, and magical adventures.

One sunny morning, she discovered a mysterious book that glowed with golden light. As she opened it, the words began to dance off the pages, creating a magical world around her.`
};

export const TTSDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'multiVoice' | 'singleVoice'>('multiVoice');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            TTS Demo - Enhanced Read to Me
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={selectedDemo === 'multiVoice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDemo('multiVoice')}
            >
              <Users className="h-4 w-4 mr-2" />
              Multi-Voice Story
            </Button>
            <Button
              variant={selectedDemo === 'singleVoice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDemo('singleVoice')}
            >
              <Mic className="h-4 w-4 mr-2" />
              Single Voice Story
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Sample Text:</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {demoTexts[selectedDemo]}
            </p>
          </div>

          {selectedDemo === 'multiVoice' && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">👧 Child Voice</Badge>
              <Badge variant="secondary">🧙‍♂️ Elder Male</Badge>
              <Badge variant="secondary">👦 Teen Voice</Badge>
              <Badge variant="secondary">👵 Elder Female</Badge>
              <Badge variant="secondary">🦄 Creature</Badge>
            </div>
          )}

          <EnhancedTextToSpeechPlayer
            bookId="demo-book"
            bookTitle={`${selectedDemo === 'multiVoice' ? 'Multi-Voice' : 'Single Voice'} Demo`}
            bookContent={demoTexts[selectedDemo]}
            childId="demo-child"
            onProgressUpdate={(progress) => {
              console.log('Demo TTS progress:', progress);
            }}
            onParagraphHighlight={(paragraphIndex) => {
              console.log('Demo highlighting paragraph:', paragraphIndex);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};