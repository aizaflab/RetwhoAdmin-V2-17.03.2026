/**
 * Minimal native-`Date` helpers so the date components need no external date
 * library. Display strings use `Intl.DateTimeFormat`; the machine format is ISO
 * `yyyy-MM-dd`. All functions are pure and return new `Date` objects.
 */

/* ------------------------------ construction ------------------------------ */

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/* -------------------------------- arithmetic ------------------------------ */

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addMonths(date: Date, amount: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1); // avoid month overflow (e.g. Jan 31 -> Mar)
  d.setMonth(d.getMonth() + amount);
  // clamp to the last valid day of the target month
  d.setDate(
    Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
  );
  return d;
}

export function subMonths(date: Date, amount: number): Date {
  return addMonths(date, -amount);
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

export function subYears(date: Date, amount: number): Date {
  return addMonths(date, -amount * 12);
}

export function setMonth(date: Date, month: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(month);
  d.setDate(
    Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
  );
  return d;
}

export function setYear(date: Date, year: number): Date {
  const d = new Date(date);
  d.setFullYear(year);
  return d;
}

/* -------------------------------- comparison ------------------------------ */

export function isValid(date: Date | null | undefined): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isBefore(date: Date, compare: Date): boolean {
  return date.getTime() < compare.getTime();
}

export function isAfter(date: Date, compare: Date): boolean {
  return date.getTime() > compare.getTime();
}

export function isWithinInterval(
  date: Date,
  interval: { start: Date; end: Date },
): boolean {
  const t = date.getTime();
  return t >= interval.start.getTime() && t <= interval.end.getTime();
}

/* -------------------------------- ISO format ------------------------------ */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formats a date as ISO `yyyy-MM-dd` (the machine/input format). */
export function formatISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses an ISO `yyyy-MM-dd` string. Returns an Invalid Date when malformed. */
export function parseISO(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return new Date(NaN);
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  // reject rollovers like 2025-02-31
  return date.getMonth() === Number(mo) - 1 ? date : new Date(NaN);
}

/* ----------------------------- display format ----------------------------- */

/** e.g. "April 2025" — for calendar headers. */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

/** e.g. "Monday, April 5, 2025" — for accessible day labels. */
export function formatLong(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
