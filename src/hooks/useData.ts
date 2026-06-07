import { useLiveQuery } from "dexie-react-hooks";
import {
  patientService,
  dashboardService,
  exerciseService,
  documentService,
  type DashboardOverview,
} from "../services";
import type { StoredDocument } from "../db";
import type { Paciente, LibraryExercicio } from "../types";

/**
 * Live-query data hooks bridging the async Dexie services to React components.
 *
 * Each hook wraps {@link useLiveQuery}, which re-runs its query whenever the
 * underlying IndexedDB tables change — so a write through any service method
 * automatically re-renders every component subscribed to the affected data.
 *
 * While a query is in flight (including the very first run) the hook returns
 * `undefined`; callers should render a loading state until data arrives.
 */

/**
 * Subscribes to the full patient list.
 * @returns All {@link Paciente} records, or `undefined` while loading.
 */
export function usePacientes(): Paciente[] | undefined {
  return useLiveQuery(() => patientService.getAll(), []);
}

/**
 * Subscribes to a single patient by id.
 *
 * Distinguishes loading from not-found: returns `undefined` while the query is
 * in flight, and `null` once it resolves with no matching record.
 *
 * @param id - The patient's id, or `undefined` to skip the query.
 * @returns The matching {@link Paciente}; `null` if not found; `undefined` while loading.
 */
export function usePaciente(id: string | undefined): Paciente | null | undefined {
  return useLiveQuery(
    async () => (id ? (await patientService.getById(id)) ?? null : null),
    [id],
  );
}

/**
 * Subscribes to the aggregated dashboard overview (doctor, stats, agenda, alerts).
 * @returns A {@link DashboardOverview}, or `undefined` while loading.
 */
export function useDashboard(): DashboardOverview | undefined {
  return useLiveQuery(() => dashboardService.getOverview(), []);
}

/**
 * Subscribes to the exercise library catalogue.
 * @returns All {@link LibraryExercicio} records, or `undefined` while loading.
 */
export function useExerciseLibrary(): LibraryExercicio[] | undefined {
  return useLiveQuery(() => exerciseService.getLibrary(), []);
}

/**
 * Subscribes to clinic-level document templates.
 * @returns Template {@link StoredDocument} records, or `undefined` while loading.
 */
export function useDocumentTemplates(): StoredDocument[] | undefined {
  return useLiveQuery(() => documentService.getTemplates(), []);
}

/**
 * Subscribes to a patient's documents.
 * @param patientId - The owning patient's id.
 * @returns The patient's {@link StoredDocument} records, or `undefined` while loading.
 */
export function usePatientDocuments(patientId: string): StoredDocument[] | undefined {
  return useLiveQuery(() => documentService.getForPatient(patientId), [patientId]);
}
