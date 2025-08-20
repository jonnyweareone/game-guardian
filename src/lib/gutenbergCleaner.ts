
// Utilities for cleaning and processing Gutenberg text
export function cleanGutenbergText(rawText: string): string {
  let text = rawText;
  
  // Remove Gutenberg header/footer
  const startMatch = text.match(/\*\*\* START OF (?:THE |THIS )?PROJECT GUTENBERG EBOOK[^\n]*\n/i);
  const endMatch = text.match(/\*\*\* END OF (?:THE |THIS )?PROJECT GUTENBERG EBOOK[^\n]*/i);
  
  if (startMatch) {
    const startIndex = text.indexOf(startMatch[0]) + startMatch[0].length;
    text = text.substring(startIndex);
  }
  
  if (endMatch) {
    const endIndex = text.indexOf(endMatch[0]);
    if (endIndex > 0) text = text.substring(0, endIndex);
  }
  
  // Remove table of contents section
  text = text.replace(/^CONTENTS?\s*$[\s\S]*?(?=^(?:CHAPTER|Chapter|I\.|1\.|\d+\.))/m, '');
  
  // Normalize whitespace but preserve paragraph breaks
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return text;
}

export function isChapterHeader(line: string): boolean {
  const trimmed = line.trim();
  return /^(?:CHAPTER|Chapter)\s+[IVXLCDM\d]+(?:\.|:|\s|$)/i.test(trimmed) ||
         /^[IVXLCDM]+\.\s+/i.test(trimmed) ||
         /^(?:PART|Part)\s+[IVXLCDM\d]+/i.test(trimmed);
}

export function isFrontMatter(line: string): boolean {
  const trimmed = line.trim().toUpperCase();
  return ['PREFACE', 'FOREWORD', 'INTRODUCTION', 'CONTENTS', 'DEDICATION', 'ACKNOWLEDGMENTS'].includes(trimmed);
}

export function extractChapterTitle(line: string): string {
  return line.trim().replace(/^\s*(?:CHAPTER|Chapter)\s+/i, '');
}
