
// Utility functions for handling illustration markers in text
export const ILLU_MARKER_RE = /\[\s*(?:illustration|illustrations)\s*:?\s*(?:["""]?)([^"\]\)]*)?(?:["""]?)\s*\]?/ig;

export function stripIllustrationMarkers(raw: string) {
  let caption: string | null = null;
  let insertAtChar: number | null = null;

  const cleaned = raw.replace(ILLU_MARKER_RE, (m, cap, offset) => {
    if (caption == null && cap) caption = cap.trim();
    if (insertAtChar == null) insertAtChar = offset;  // remember first marker on the page
    return ""; // remove from text completely
  });

  return { cleaned, caption, insertAtChar };
}

export function charToTokenIdx(tokens: {s: number, e: number}[], pos: number | null): number | null {
  if (pos == null) return null;
  for (let i = 0; i < tokens.length; i++) {
    if (pos <= tokens[i].e) return i;
  }
  return tokens.length ? tokens.length - 1 : null;
}
