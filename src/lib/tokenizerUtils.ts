
// Simple word tokenizer that returns word positions
export interface Token {
  w: string;  // word text
  s: number;  // start index
  e: number;  // end index
}

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const words = text.match(/\S+/g) || [];
  let currentIndex = 0;
  
  for (const word of words) {
    const start = text.indexOf(word, currentIndex);
    const end = start + word.length;
    
    tokens.push({
      w: word,
      s: start,
      e: end
    });
    
    currentIndex = end;
  }
  
  return tokens;
}
