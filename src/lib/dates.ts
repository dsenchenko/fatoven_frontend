const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayString(): string {
  return toDateString(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function getMondayOfWeek(dateStr: string): string {
  const date = parseDateString(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toDateString(date);
}

export function getISOWeekNumber(dateStr: string): number {
  const date = parseDateString(dateStr);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY));
  return weekNumber;
}

export function weeksAgo(dateStr: string, weeks: number): string {
  return addDays(dateStr, -weeks * 7);
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function getDayOfWeekShort(dateStr: string): string {
  return DAY_LABELS[parseDateString(dateStr).getDay()];
}

/** Every calendar day from `from` through `to`, inclusive (ascending). */
export function enumerateDates(from: string, to: string): string[] {
  if (from > to) return [];
  const dates: string[] = [];
  let current = from;
  while (current <= to) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

export function createdAtToLocalDate(isoDateTime: string): string {
  return toDateString(new Date(isoDateTime));
}

export function normalizeDateRange(
  from: string,
  to: string,
  maxDate?: string,
): { from: string; to: string } {
  const cap = maxDate ?? to;
  let start = from <= to ? from : to;
  let end = from <= to ? to : from;
  if (end > cap) end = cap;
  if (start > end) start = end;
  return { from: start, to: end };
}

export function resolveTrackingStartDate(userCreatedAt: string, logs: { logDate: string }[]): string {
  const createdDate = createdAtToLocalDate(userCreatedAt);
  if (logs.length === 0) return createdDate;
  const earliest = logs.reduce(
    (min, log) => (log.logDate < min ? log.logDate : min),
    logs[0].logDate,
  );
  return earliest < createdDate ? earliest : createdDate;
}
