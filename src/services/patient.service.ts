import { db } from "../db";
import type { Paciente } from "../types";

/**
 * Data-access service for patient records, backed by IndexedDB (Dexie).
 *
 * All methods are asynchronous. Reads return promises that `useLiveQuery`
 * subscribes to, so any write through {@link patientService.create} or
 * {@link patientService.update} re-renders subscribed components automatically.
 *
 * @example
 * const all = await patientService.getAll();
 * const one = await patientService.getById("p3");
 */
export const patientService = {
  /**
   * Returns every patient in the database.
   *
   * @returns Promise of all {@link Paciente} records.
   *
   * @example
   * const pacientes = await patientService.getAll();
   */
  getAll(): Promise<Paciente[]> {
    return db.pacientes.toArray();
  },

  /**
   * Finds a single patient by their unique identifier.
   *
   * @param id - The patient's unique string ID (matches `Paciente.id`).
   * @returns Promise of the matching {@link Paciente}, or `undefined` if none exists.
   *
   * @example
   * const p = await patientService.getById("p3");
   */
  getById(id: string): Promise<Paciente | undefined> {
    return db.pacientes.get(id);
  },

  /**
   * Inserts a new patient record.
   *
   * @param paciente - The complete {@link Paciente} to persist.
   * @returns Promise of the inserted patient.
   *
   * @example
   * await patientService.create(novoPaciente);
   */
  async create(paciente: Paciente): Promise<Paciente> {
    await db.pacientes.add(paciente);
    return paciente;
  },

  /**
   * Applies a partial update to an existing patient.
   *
   * @param id - The patient's unique identifier.
   * @param patch - Fields to merge into the stored record.
   * @returns Promise of the number of records updated (`0` if `id` was not found).
   *
   * @example
   * await patientService.update("p1", { planoTratamento });
   */
  update(id: string, patch: Partial<Paciente>): Promise<number> {
    return db.pacientes.update(id, patch);
  },

  /**
   * Permanently deletes a patient record.
   *
   * @param id - The patient's unique identifier.
   * @returns Promise resolving once the record is removed (no-op if absent).
   *
   * @example
   * await patientService.remove("p1");
   */
  remove(id: string): Promise<void> {
    return db.pacientes.delete(id);
  },
};
