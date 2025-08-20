import { supabase } from '@/integrations/supabase/client';

// Generate demo Nova insights and problem words for testing
export const generateDemoInsights = async (sessionId: string, childId: string, bookId: string) => {
  console.log('Generating demo insights for session:', sessionId);

  // Demo insights
  const demoInsights = [
    {
      session_id: sessionId,
      child_id: childId,
      book_id: bookId,
      scope: 'chunk',
      ai_summary: 'This passage introduces the main character and their exciting adventure. The vocabulary includes some challenging words that are perfect for building reading skills.',
      difficulty_level: 'medium',
      key_points: [
        'Main character is brave and curious',
        'Setting is a magical forest',
        'Adventure is about to begin'
      ],
      comprehension_questions: [
        'What makes the main character brave?',
        'Describe the magical forest setting'
      ],
      emotional_tone: 'positive',
      reading_level_assessment: 'Reading level is appropriate for age group'
    }
  ];

  // Demo problem words
  const demoProblemWords = [
    {
      session_id: sessionId,
      child_id: childId,
      word: 'adventure',
      phonetics: '/ədˈventʃər/',
      syllables: ['ad', 'ven', 'ture'],
      sounds: ['ə', 'd', 'v', 'e', 'n', 't', 'ʃ', 'ə', 'r'],
      difficulty_reason: 'Complex multisyllabic word',
      hints: [
        'Break it into three parts: ad-ven-ture',
        'The "ture" ending sounds like "chur"',
        'Think of it as going on a fun journey'
      ],
      definition: 'An exciting journey or experience with unknown outcomes',
      count: 1
    },
    {
      session_id: sessionId,
      child_id: childId,
      word: 'mysterious',
      phonetics: '/mɪˈstɪəriəs/',
      syllables: ['mys', 'te', 'ri', 'ous'],
      sounds: ['m', 'ɪ', 's', 't', 'ɪə', 'r', 'i', 'ə', 's'],
      difficulty_reason: 'Long word with multiple syllables',
      hints: [
        'Say it slowly: mys-te-ri-ous',
        'The "ous" ending is like "us"',
        'Means something that is hard to understand or explain'
      ],
      definition: 'Something that is difficult to understand or explain; full of mystery',
      count: 2
    },
    {
      session_id: sessionId,
      child_id: childId,
      word: 'courageous',
      phonetics: '/kəˈreɪdʒəs/',
      syllables: ['cou', 'ra', 'geous'],
      sounds: ['k', 'ə', 'r', 'eɪ', 'd', 'ʒ', 'ə', 's'],
      difficulty_reason: 'Contains the "geous" sound which is tricky',
      hints: [
        'Break it down: cou-ra-geous',
        'The "geous" part sounds like "jus"',
        'Means being brave and not afraid'
      ],
      definition: 'Having courage; brave and willing to face danger or difficulties',
      count: 1
    }
  ];

  try {
    // Insert demo insights
    const { error: insightsError } = await supabase
      .from('nova_insights')
      .upsert(demoInsights);

    if (insightsError) {
      console.error('Error inserting demo insights:', insightsError);
    } else {
      console.log('Demo insights inserted successfully');
    }

    // Insert demo problem words
    const { error: wordsError } = await supabase
      .from('nova_problem_words')
      .upsert(demoProblemWords);

    if (wordsError) {
      console.error('Error inserting demo problem words:', wordsError);
    } else {
      console.log('Demo problem words inserted successfully');
    }

    return { success: true };
  } catch (error) {
    console.error('Error generating demo data:', error);
    return { success: false, error };
  }
};

// Sample book content for text-to-speech
export const getSampleBookContent = (bookTitle: string) => {
  const contentMap: Record<string, string> = {
    'Black Beauty': 'My earliest memories were of a large pleasant meadow with a pond of clear water in it. Some shady trees leaned over it, and rushes and water-lilies grew at the deep end. Over the hedge on one side we looked into a plowed field, and on the other we looked over a gate at our master\'s house, which stood by the roadside.',
    
    'The Secret Garden': 'When Mary Lennox was sent to Misselthwaite Manor to live with her uncle everybody said she was the most disagreeable-looking child ever seen. It was true, too. She had a little thin face and a little thin body, thin light hair and a sour expression. Her hair was yellow, and her face was yellow because she had been born in India.',
    
    'Alice\'s Adventures in Wonderland': 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it. "What is the use of a book," thought Alice, "without pictures or conversations?"',
    
    default: 'Once upon a time, in a land far away, there lived a young adventurer who loved to explore mysterious places. Every day brought new discoveries and exciting challenges. The brave explorer would journey through enchanted forests, climb towering mountains, and discover hidden treasures. Each adventure taught valuable lessons about courage, friendship, and the wonders of the world.'
  };

  return contentMap[bookTitle] || contentMap.default;
};