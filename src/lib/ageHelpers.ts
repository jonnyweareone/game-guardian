
export function getAgeGroup(ageMin: number, ageMax: number): string {
  // Handle wide age ranges by grouping them
  if (ageMin <= 3 && ageMax >= 6) return "3-6";
  if (ageMin <= 7 && ageMax >= 12) return "7-12";
  if (ageMin >= 13 || (ageMin <= 13 && ageMax >= 17)) return "13-17";
  
  // For more specific ranges, use the original
  if (ageMax <= 6) return "3-6";
  if (ageMax <= 12) return "7-12";
  return "13-17";
}
