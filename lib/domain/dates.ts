/** Dates are ISO strings (`YYYY-MM-DD`); months are keys (`YYYY-MM`). */
export const TIMEZONE = "America/Sao_Paulo";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True when `value` is a real calendar date in `YYYY-MM-DD` form. */
export function isISODate(value: string): boolean {
  const match = value.match(ISO_DATE);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Today's date in the app timezone. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(now);
}

/** `2026-10-05` → `05/10/2026`. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** `2026-10-05` → `2026-10`. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Shifts a month key by `n` months (negative goes back). */
export function addMonths(key: string, n: number): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + n, 1));
  return date.toISOString().slice(0, 7);
}

/** Half-open date range `[start, end)` covering a month. */
export function monthRange(key: string): { start: string; end: string } {
  return { start: `${key}-01`, end: `${addMonths(key, 1)}-01` };
}

/** The `count` month keys ending at `key`, oldest first. */
export function monthsEnding(key: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(key, i - count + 1));
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

/** `2026-10` → `outubro de 2026`. */
export function formatMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return monthFormatter.format(new Date(Date.UTC(y, m - 1, 1)));
}
