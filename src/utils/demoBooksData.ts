// Demo data for Nova reading sessions
import { supabase } from '@/integrations/supabase/client';

export const getSampleBookContent = (title: string): string => {
  // Return sample content for TTS
  return `This is a sample reading of ${title}. The AI coach will provide insights as you read.`;
};

export const generateDemoInsights = async (sessionId: string, childId: string, bookId: string, bookTitle: string) => {
  try {
    // Generate AI insight
    await supabase
      .from('nova_insights')
      .insert({
        session_id: sessionId,
        child_id: childId,
        book_id: bookId,
        ai_summary: `Great progress reading "${bookTitle}"! I noticed you're engaging well with the story.`,
        key_points: [
          'Strong vocabulary understanding',
          'Good reading pace',
          'Engaged with character development'
        ],
        difficulty_level: 'age_appropriate',
        comprehension_questions: [
          'What do you think will happen next in the story?',
          'How do you think the main character is feeling?',
          'What was your favorite part so far?'
        ],
        scope: 'session'
      });

    // Generate problem words
    await supabase
      .from('nova_problem_words')
      .insert([
        {
          session_id: sessionId,
          child_id: childId,
          word: 'magnificent',
          context: 'The magnificent castle stood tall.',
          difficulty_reason: 'Advanced vocabulary',
          suggested_definition: 'Very impressive or beautiful'
        },
        {
          session_id: sessionId,
          child_id: childId,
          word: 'extraordinary',
          context: 'An extraordinary adventure awaited.',
          difficulty_reason: 'Complex meaning',
          suggested_definition: 'Very unusual or remarkable'
        }
      ]);

    console.log('Demo insights generated successfully');
  } catch (error) {
    console.error('Error generating demo insights:', error);
  }
};