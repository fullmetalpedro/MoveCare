import { db } from "../db";
import { agendaService } from "./agenda.service";
import { todayISO } from "../lib/schedule";
import type { Doctor, Stats, AgendaItem } from "../types";

/**
 * The application's clinician identity.
 *
 * The app has no authentication, so the logged-in clinician is a fixed profile
 * rather than demo data — it is always present regardless of whether the mock
 * dataset has been loaded, and is therefore returned as a constant instead of
 * being read from the (optional) seeded `doctor` table.
 */
export const DEFAULT_DOCTOR: Doctor = {
  id: "dr-001",
  name: "Dra. Ana Paula",
  initials: "AP",
  role: "Fisioterapeuta",
  crefito: "CREFITO-3",
};

/**
 * Aggregated data shape returned by {@link dashboardService.getOverview}.
 * Contains every piece of information the Dashboard page needs in one object.
 */
export interface DashboardOverview {
  /** The clinician's profile — always the constant {@link DEFAULT_DOCTOR}. */
  doctor: Doctor;
  /** High-level practice statistics, computed live from the database. */
  stats: Stats;
  /** Today's schedule entries shown in the agenda section. */
  agendaHoje: AgendaItem[];
  /** Total number of active alerts — drives the notification badge count. */
  alertCount: number;
}

/** Rounded arithmetic mean of a list, or `0` for an empty list. */
function meanRounded(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/**
 * Data-access service for the Dashboard overview, backed by IndexedDB (Dexie).
 *
 * Everything is **derived from the live database** — patient counts and average
 * adherence from the `pacientes` table, today's agenda from `agendaSemanal`,
 * and the alert badge from `alertas`. Nothing is read from a pre-baked snapshot,
 * so the dashboard always reflects the data actually stored.
 *
 * @example
 * const { stats, alertCount } = await dashboardService.getOverview();
 */
export const dashboardService = {
  /**
   * Computes all data required to render the Dashboard page from current state.
   *
   * @param dia - The day to resolve "today" for, as `yyyy-mm-dd`; defaults to
   *   the real current date.
   * @returns Promise of a {@link DashboardOverview}. On an empty database the
   *   counts are `0`, adherence is `0`, the agenda is empty, and `doctor` is
   *   `undefined`.
   */
  async getOverview(dia: string = todayISO()): Promise<DashboardOverview> {
    const [pacientes, agendaHoje, alertCount] = await Promise.all([
      db.pacientes.toArray(),
      agendaService.getTodayItems(dia),
      db.alertas.count(),
    ]);

    const ativos = pacientes.filter((p) => p.status === "Ativo");
    const emAvaliacao = pacientes.filter((p) => p.status === "Avaliação");
    const manha = agendaHoje.filter((i) => parseInt(i.hora, 10) < 12).length;
    const tarde = agendaHoje.length - manha;

    const stats: Stats = {
      pacientesHoje: agendaHoje.length,
      pacientesHojeDetalhe: `${manha} manhã · ${tarde} tarde`,
      adesaoGeral: meanRounded(ativos.map((p) => p.adesao)),
      adesaoVariacao: meanRounded(ativos.map((p) => p.adesaoVariacao)),
      pacientesAtivos: ativos.length,
      pacientesEmAvaliacao: emAvaliacao.length,
    };

    return { doctor: DEFAULT_DOCTOR, stats, agendaHoje, alertCount };
  },
};
