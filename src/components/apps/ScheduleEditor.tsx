import React from 'react';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type ScheduleJSON = Partial<Record<DayKey, string[]>>;

type Props = {
  value: ScheduleJSON;                 // {"Mon":["16:00-19:00"], ...}
  onChange: (next: ScheduleJSON) => void;
  className?: string;                  // wrapper class to match your card spacing
  disabled?: boolean;
  title?: string;                      // optional header text
  subtitle?: string;                   // small helper line
};

const DAYS: DayKey[] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x ?? {})); }

function ensureDay(arr?: string[]): string[] {
  return Array.isArray(arr) ? arr.slice() : [];
}

function normalizeTime(s: string): string {
  // Accept "9:5" -> "09:05"
  const m = s.trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return s;
  const hh = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2,'0');
  const mm = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(2,'0');
  return `${hh}:${mm}`;
}

function isValidRange(start: string, end: string): boolean {
  const s = normalizeTime(start);
  const e = normalizeTime(end);
  return /^\d{2}:\d{2}$/.test(s) && /^\d{2}:\d{2}$/.test(e) && s < e;
}

function toRangeString(start: string, end: string): string {
  return `${normalizeTime(start)}-${normalizeTime(end)}`;
}

function fromRangeString(range: string): { start: string; end: string } {
  const [s,e] = range.split('-');
  return { start: normalizeTime(s ?? ''), end: normalizeTime(e ?? '') };
}

export const ScheduleEditor: React.FC<Props> = ({
  value,
  onChange,
  className = '',
  disabled = false,
  title = 'Time controls',
  subtitle = 'Choose allowed times per day (24h). Empty day = blocked.'
}) => {
  const schedule = React.useMemo(() => clone(value || {}), [value]);

  const setDayEnabled = (day: DayKey, enabled: boolean) => {
    const next = clone(schedule);
    if (enabled && !next[day]) next[day] = ['16:00-19:00']; // sensible default
    if (!enabled) delete next[day];
    onChange(next);
  };

  const addRange = (day: DayKey) => {
    const next = clone(schedule);
    const arr = ensureDay(next[day]);
    arr.push('16:00-19:00');
    next[day] = arr;
    onChange(next);
  };

  const updateRange = (day: DayKey, idx: number, start: string, end: string) => {
    const next = clone(schedule);
    const arr = ensureDay(next[day]);
    arr[idx] = toRangeString(start, end);
    next[day] = arr;
    onChange(next);
  };

  const removeRange = (day: DayKey, idx: number) => {
    const next = clone(schedule);
    const arr = ensureDay(next[day]);
    arr.splice(idx, 1);
    if (arr.length === 0) delete next[day];
    else next[day] = arr;
    onChange(next);
  };

  // QUICK PRESETS
  const applyPreset = (preset: 'school' | 'weekend' | 'all' | 'clear') => {
    const next: ScheduleJSON = {};
    if (preset === 'school') {
      ['Mon','Tue','Wed','Thu','Fri'].forEach(d => {
        (next as any)[d] = ['16:00-19:00'];
      });
    } else if (preset === 'weekend') {
      (next as any)['Sat'] = ['09:00-20:00'];
      (next as any)['Sun'] = ['09:00-20:00'];
    } else if (preset === 'all') {
      DAYS.forEach(d => {
        (next as any)[d] = ['06:00-22:00'];
      });
    } else {
      // clear
    }
    onChange(next);
  };

  return (
    <div className={`rounded-lg bg-card text-card-foreground border ${className}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-xs bg-secondary hover:bg-secondary/80 border"
            onClick={() => applyPreset('school')}
            disabled={disabled}
          >
            School nights
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-xs bg-secondary hover:bg-secondary/80 border"
            onClick={() => applyPreset('weekend')}
            disabled={disabled}
          >
            Weekends
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-xs bg-secondary hover:bg-secondary/80 border"
            onClick={() => applyPreset('all')}
            disabled={disabled}
          >
            All week
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-xs bg-destructive/20 hover:bg-destructive/30 border border-destructive/50"
            onClick={() => applyPreset('clear')}
            disabled={disabled}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="divide-y">
        {DAYS.map((day) => {
          const ranges = ensureDay(schedule[day]);
          const enabled = !!schedule[day];

          return (
            <div key={day} className="p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={enabled}
                    disabled={disabled}
                    onChange={(e) => setDayEnabled(day, e.currentTarget.checked)}
                  />
                  <span className="w-10 font-medium">{day}</span>
                </label>

                <div className="flex-1">
                  {enabled && (
                    <div className="flex flex-col gap-2">
                      {ranges.map((r, idx) => {
                        const { start, end } = fromRangeString(r);
                        const ok = isValidRange(start, end);
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={start}
                              onChange={(e) => updateRange(day, idx, e.target.value, end)}
                              disabled={disabled}
                              className="bg-input border rounded-md px-2 py-1 text-sm"
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <input
                              type="time"
                              value={end}
                              onChange={(e) => updateRange(day, idx, start, e.target.value)}
                              disabled={disabled}
                              className="bg-input border rounded-md px-2 py-1 text-sm"
                            />
                            <span className={`text-xs ${ok ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {ok ? 'OK' : 'Start must be before end'}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRange(day, idx)}
                              disabled={disabled}
                              className="ml-auto text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 border"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => addRange(day)}
                        disabled={disabled}
                        className="self-start text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 border"
                      >
                        + Add time range
                      </button>
                    </div>
                  )}

                  {!enabled && (
                    <span className="text-xs text-muted-foreground">Blocked all day</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 text-[11px] text-muted-foreground border-t">
        Times use the device's local timezone. Multiple ranges per day are supported.
      </div>
    </div>
  );
};