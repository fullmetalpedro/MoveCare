import { loadDataset } from "./_client";
import type { AgendaSemanal, AgendaItem, Alerta } from "../types";

/**
 * Data-access service for agenda and alert records.
 *
 * Exposes today's schedule, the weekly calendar, and active patient alerts.
 *
 * @example
 * const alerts = agendaService.getAlerts();
 * const week   = agendaService.getWeek();
 */
export const agendaService = {
  /**
   * Returns the full weekly calendar entries for the current period.
   *
   * @returns Array of {@link AgendaSemanal} items, one per scheduled slot.
   *
   * @example
   * const eventos = agendaService.getWeek();
   * // Pass to <Agenda eventos={eventos} />
   */
  getWeek(): AgendaSemanal[] {
    return loadDataset().agendaSemanal;
  },

  /**
   * Returns today's schedule items in chronological order.
   *
   * @returns Array of {@link AgendaItem} entries for the current day.
   *
   * @example
   * const agendaHoje = agendaService.getTodayItems();
   * // Pass to <Dashboard agendaHoje={agendaHoje} />
   */
  getTodayItems(): AgendaItem[] {
    return loadDataset().agendaHoje;
  },

  /**
   * Returns all active patient alerts.
   *
   * @returns Array of {@link Alerta} records sorted by dataset insertion order.
   *
   * @example
   * const alerts = agendaService.getAlerts();
   * const highPriority = alerts.filter(a => a.severidade === "alta");
   */
  getAlerts(): Alerta[] {
    return loadDataset().alertas;
  },
};
