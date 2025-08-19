// src/lib/ukSchoolYear.ts
export function academicSep1(date = new Date()): Date {
  const y = date.getFullYear();
  const sep1 = new Date(y, 8, 1); // month 8 = September
  return date >= sep1 ? sep1 : new Date(y - 1, 8, 1);
}

export function yearAndKeyStageFromDOB(dobISO?: string, ref = new Date()) {
  if (!dobISO) return { yearGroup: undefined, keyStage: undefined };
  const dob = new Date(dobISO);
  const sep1 = academicSep1(ref);
  let age = sep1.getFullYear() - dob.getFullYear();
  const beforeBirthday = (sep1.getMonth() < dob.getMonth()) ||
    (sep1.getMonth() === dob.getMonth() && sep1.getDate() < dob.getDate());
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