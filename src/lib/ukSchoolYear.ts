
// src/lib/ukSchoolYear.ts
export function academicSep1(date = new Date()): Date {
  const y = date.getFullYear();
  const aug1 = new Date(y, 7, 1); // month 7 = August, changed from September
  return date >= aug1 ? aug1 : new Date(y - 1, 7, 1);
}

export function yearAndKeyStageFromDOB(dobISO?: string, ref = new Date()) {
  if (!dobISO) return { yearGroup: undefined, keyStage: undefined };
  
  const dob = new Date(dobISO);
  const refYear = ref.getFullYear();
  const rollover = new Date(refYear, 7, 1); // August 1st (end of July academic year)
  const academicRef = ref >= rollover ? rollover : new Date(refYear - 1, 7, 1);
  
  let age = academicRef.getFullYear() - dob.getFullYear();
  const beforeBirthday = (academicRef.getMonth() < dob.getMonth()) ||
    (academicRef.getMonth() === dob.getMonth() && academicRef.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;

  const y = age - 4;
  
  if (y < 0) return { yearGroup: 'Pre‑school', keyStage: undefined };
  if (y === 0) return { yearGroup: 'Reception', keyStage: 'KS1' };
  if (y >= 1 && y <= 6) {
    const ks = (y === 1 || y === 2) ? 'KS1' : 'KS2';
    return { yearGroup: `Year ${y}`, keyStage: ks };
  }
  if (y >= 7 && y <= 9) return { yearGroup: `Year ${y}`, keyStage: 'KS3' };
  if (y >= 10) return { yearGroup: `Year ${y}`, keyStage: 'KS4' };
  
  return { yearGroup: undefined, keyStage: undefined };
}

export function isBirthdayToday(dobISO?: string) {
  if (!dobISO) return false;
  const d = new Date(dobISO); const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
}
