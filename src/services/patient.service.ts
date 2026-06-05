import { loadDataset } from "./_client";
import type { Paciente } from "../types";

/**
 * Data-access service for patient records.
 *
 * All reads go through this object so that switching from mock data to a real
 * API endpoint is a single-function change in `_client.ts` or here.
 *
 * @example
 * const all = patientService.getAll();
 * const one = patientService.getById("pac-001");
 */
export const patientService = {
  /**
   * Returns every patient in the dataset.
   *
   * @returns Array of all {@link Paciente} records, in dataset order.
   *
   * @example
   * const pacientes = patientService.getAll();
   * console.log(pacientes.length); // e.g. 8
   */
  getAll(): Paciente[] {
    return loadDataset().pacientes;
  },

  /**
   * Finds a single patient by their unique identifier.
   *
   * @param id - The patient's unique string ID (matches `Paciente.id`).
   * @returns The matching {@link Paciente}, or `undefined` if no record has that ID.
   *
   * @example
   * const p = patientService.getById("pac-003");
   * if (p) console.log(p.nome);
   */
  getById(id: string): Paciente | undefined {
    return loadDataset().pacientes.find((p) => p.id === id);
  },
};
