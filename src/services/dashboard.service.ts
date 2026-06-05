import { loadDataset } from "./_client";
import type { Doctor, Stats, AgendaItem } from "../types";

/**
 * Aggregated data shape returned by {@link dashboardService.getOverview}.
 * Contains every piece of information the Dashboard page needs in one object.
 */
export interface DashboardOverview {
  /** The authenticated clinician's profile data. */
  doctor: Doctor;
  /** High-level practice statistics for the current period. */
  stats: Stats;
  /** Today's schedule entries shown in the agenda section. */
  agendaHoje: AgendaItem[];
  /** Total number of active alerts — drives the notification badge count. */
  alertCount: number;
}

/**
 * Data-access service for the Dashboard overview.
 *
 * Aggregates the multiple dataset slices that the Dashboard page requires
 * into a single call, keeping the page component free of data-assembly logic.
 *
 * @example
 * const { doctor, stats, alertCount } = dashboardService.getOverview();
 */
export const dashboardService = {
  /**
   * Aggregates all data required to render the Dashboard page.
   *
   * @returns A {@link DashboardOverview} object containing the doctor profile,
   *   practice stats, today's agenda items, and the alert badge count.
   *
   * @example
   * const overview = dashboardService.getOverview();
   * // <Dashboard stats={overview.stats} agendaHoje={overview.agendaHoje} />
   */
  getOverview(): DashboardOverview {
    const d = loadDataset();
    return {
      doctor: d.doctor,
      stats: d.stats,
      agendaHoje: d.agendaHoje,
      alertCount: d.alertas.length,
    };
  },
};
