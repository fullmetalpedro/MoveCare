import { db } from "../db";
import { patientsOnDate, todayISO } from "../lib/schedule";
import type { AgendaItem, Alerta } from "../types";

/** Maps a patient status to the dashboard's appointment status value. */
function statusForPaciente(status: string): AgendaItem["status"] {
  return status === "Avaliação" ? "avaliacao" : "confirmado";
}

/**
 * Data-access service for the dashboard agenda and alerts, backed by IndexedDB.
 *
 * Today's schedule is **derived from patients' recurring session slots** (no
 * standalone event store) — a patient appears for today when one of its weekly
 * occurrences lands on the given day. Alerts are read from their table.
 *
 * @example
 * const hoje = await agendaService.getTodayItems();
 * const alerts = await agendaService.getAlerts();
 */
export const agendaService = {
  /**
   * Derives a day's schedule items from every patient's session series.
   *
   * @param dia - The day to resolve as `yyyy-mm-dd`; defaults to the real today.
   * @returns Promise of {@link AgendaItem} entries for that day, sorted by time.
   */
  async getTodayItems(dia: string = todayISO()): Promise<AgendaItem[]> {
    const pacientes = await db.pacientes.toArray();
    return patientsOnDate(pacientes, dia)
      .sort((a, b) => a.hora.localeCompare(b.hora))
      .map(({ paciente, hora }) => ({
        hora,
        paciente: paciente.nome,
        tipo: `Sessão ${paciente.sessoes + 1}/${paciente.totalSessoes}`,
        status: statusForPaciente(paciente.status),
      }));
  },

  /**
   * Returns all active patient alerts.
   *
   * @returns Promise of {@link Alerta} records.
   */
  getAlerts(): Promise<Alerta[]> {
    return db.alertas.toArray();
  },
};
