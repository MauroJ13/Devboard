/**
 * Deadlines werden als "YYYY-MM-DD" gespeichert (Format von <input type="date">).
 * Die Funktionen arbeiten bewusst mit Strings, um Zeitzonen-Verschiebungen zu vermeiden.
 */

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDaysIso(days: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** "2026-03-19" → "19.03.2026" */
export function formatDeadline(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

export function isOverdue(isoDate: string): boolean {
  if (!isoDate) return false;
  return isoDate < todayIso();
}
