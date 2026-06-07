import type { Paciente, SessaoSemanal } from "../types";

/**
 * The app is anchored to a reference week (the real calendar week of 27/04/2026).
 * New session series start in this week, mapped from a weekday label to a
 * concrete ISO date. Dates are aligned to actual weekdays so they render in the
 * correct FullCalendar column. Seg = 27/04 … Sex = 01/05/2026.
 */
export const REFERENCE_WEEK: Record<string, string> = {
  Seg: "2026-04-27",
  Ter: "2026-04-28",
  Qua: "2026-04-29",
  Qui: "2026-04-30",
  Sex: "2026-05-01",
};

/**
 * The real current date as `yyyy-mm-dd`, from the device clock (local time).
 * Used by the dashboard so "today" reflects the actual day.
 */
export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Weekday labels indexed by `Date.getUTCDay()` (0 = Sunday). */
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Parses a `yyyy-mm-dd` string into a UTC Date (avoids DST/timezone drift). */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Formats a UTC Date back to `yyyy-mm-dd`. */
function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Adds (or subtracts) whole days to an ISO date.
 *
 * @param iso - Start date as `yyyy-mm-dd`.
 * @param days - Number of days to add (may be negative).
 * @returns The resulting date as `yyyy-mm-dd`.
 */
export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

/**
 * Returns the weekday label (`"Seg"`…`"Dom"`) for an ISO date.
 *
 * @param iso - A `yyyy-mm-dd` date string.
 * @returns The Portuguese short weekday label.
 */
export function weekdayLabel(iso: string): string {
  return WEEKDAY_LABELS[parseISO(iso).getUTCDay()];
}

/**
 * Re-anchors a weekday onto the same calendar week (Mon–Sun) as a reference
 * date — used when rescheduling a series to a different weekday while keeping
 * the week it started in.
 *
 * @param refISO - A date inside the target week.
 * @param dia - The desired weekday label (`"Seg"`…`"Sex"`).
 * @returns The ISO date of that weekday within `refISO`'s week.
 */
export function dateForWeekdayInWeek(refISO: string, dia: string): string {
  const ref = parseISO(refISO);
  // Monday-based offset of the reference date within its week.
  const refOffset = (ref.getUTCDay() + 6) % 7;
  const monday = addDaysISO(refISO, -refOffset);
  const target = (WEEKDAY_LABELS.indexOf(dia) + 6) % 7;
  return addDaysISO(monday, target);
}

/**
 * Generates the ISO dates of every occurrence in a weekly session series.
 *
 * @param dataInicio - ISO date of the first session.
 * @param total - Number of weekly occurrences.
 * @returns An array of `yyyy-mm-dd` dates, one per week.
 *
 * @example
 * sessionDates("2026-04-29", 3); // ["2026-04-29","2026-05-06","2026-05-13"]
 */
export function sessionDates(dataInicio: string, total: number): string[] {
  if (!dataInicio || total <= 0) return [];
  return Array.from({ length: total }, (_, i) => addDaysISO(dataInicio, i * 7));
}

/** Formats an ISO date as `dd/MM/yyyy`. */
export function formatDateBR(iso: string): string {
  const d = parseISO(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

/** Formats an ISO date as `dd/MM` (short display used on cards). */
export function formatDayMonth(iso: string): string {
  const d = parseISO(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

/**
 * Computes the projected discharge ("alta") date — the date of the last session
 * in the series.
 *
 * @param dataInicio - ISO date of the first session.
 * @param total - Total number of sessions.
 * @returns The discharge date as `dd/MM/yyyy`, or `"—"` when not schedulable.
 *
 * @example
 * calcAltaDate("2026-04-29", 10); // "01/07/2026"
 */
export function calcAltaDate(dataInicio: string, total: number): string {
  if (!dataInicio || total <= 0) return "—";
  return formatDateBR(addDaysISO(dataInicio, (total - 1) * 7));
}

/**
 * Returns the patients whose series has an occurrence on the given ISO date.
 *
 * @param pacientes - All patients.
 * @param iso - The target date (`yyyy-mm-dd`).
 * @returns Patients with a session that day, each paired with its time.
 */
export function patientsOnDate(
  pacientes: Paciente[],
  iso: string,
): { paciente: Paciente; hora: string }[] {
  return pacientes
    .filter((p): p is Paciente & { sessao: SessaoSemanal } => !!p.sessao)
    .filter((p) => sessionDates(p.sessao.dataInicio, p.totalSessoes).includes(iso))
    .map((p) => ({ paciente: p, hora: p.sessao.hora }));
}
