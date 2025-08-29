import type { ScheduleJSON, DayKey } from '@/types/os-apps';

export const DAYS: DayKey[] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function normalizeTime(s: string) {
  const m = s?.trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return s;
  const hh = String(Math.min(23, Math.max(0, +m[1]))).padStart(2,'0');
  const mm = String(Math.min(59, Math.max(0, +m[2]))).padStart(2,'0');
  return `${hh}:${mm}`;
}

export function isValidRange(start: string, end: string) {
  const s = normalizeTime(start);
  const e = normalizeTime(end);
  return /^\d{2}:\d{2}$/.test(s) && /^\d{2}:\d{2}$/.test(e) && s < e;
}

export function emptySchedule(): ScheduleJSON { 
  return {}; 
}