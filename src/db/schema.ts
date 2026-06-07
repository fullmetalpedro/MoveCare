import Dexie, { type EntityTable } from "dexie";
import type {
  Doctor,
  Paciente,
  AgendaSemanal,
  Alerta,
  LibraryExercicio,
  Documento,
} from "../types";

/**
 * Sentinel `patientId` used for clinic-level document templates.
 *
 * IndexedDB cannot index `null`/`undefined`, so templates are tagged with this
 * non-empty string instead of a nullable owner, keeping them queryable through
 * the same `patientId` index as patient-scoped documents.
 */
export const TEMPLATE_SCOPE = "__template__";

/**
 * A {@link Documento} as persisted in IndexedDB.
 *
 * The seed reuses the same `id` (e.g. `"doc1"`) across patients, so the natural
 * key is not unique. We therefore key the table on an auto-incrementing `pk`
 * and scope each row by `patientId` ({@link TEMPLATE_SCOPE} for templates).
 */
export interface StoredDocument extends Documento {
  /** Auto-incrementing primary key (assigned by Dexie on insert). */
  pk?: number;
  /** Owning patient's id, or {@link TEMPLATE_SCOPE} for clinic-level templates. */
  patientId: string;
}

/**
 * Generic key/value row for singletons that don't warrant their own table —
 * currently just the `seedVersion` guard used by {@link seedIfEmpty}.
 */
export interface MetaRecord {
  /** Stable lookup key, e.g. `"seedVersion"`. */
  key: string;
  /** Arbitrary serializable payload associated with {@link MetaRecord.key}. */
  value: unknown;
}

/**
 * The MoveCare IndexedDB database (via Dexie).
 *
 * Each domain entity is stored as a whole document keyed by its existing `id`,
 * mirroring the TypeScript types in `src/types` — no normalization — so the
 * services can read/write the same shapes the UI already consumes. Secondary
 * indexes back the filtered queries used by the services (e.g. patients by
 * `status`, documents by `patientId`).
 *
 * @example
 * import { db } from "./db";
 * const ativos = await db.pacientes.where("status").equals("Ativo").toArray();
 */
export class MoveCareDB extends Dexie {
  /** Authenticated clinician profile (single row). */
  doctor!: EntityTable<Doctor, "id">;
  /** Patient records, indexed by `status` and `nome` for list filtering. */
  pacientes!: EntityTable<Paciente, "id">;
  /** Weekly schedule events, indexed by `dia` and `paciente`. */
  agendaSemanal!: EntityTable<AgendaSemanal, "id">;
  /** Active patient alerts, indexed by `severidade`. */
  alertas!: EntityTable<Alerta, "id">;
  /** Exercise catalogue, indexed by `categoria`. */
  exerciseLibrary!: EntityTable<LibraryExercicio, "id">;
  /** Clinic templates + patient documents, indexed by `patientId`. */
  documents!: EntityTable<StoredDocument, "pk">;
  /** Singletons (currently just the seed-version guard). */
  meta!: EntityTable<MetaRecord, "key">;

  constructor() {
    super("movecare");
    this.version(1).stores({
      doctor: "id",
      pacientes: "id, status, nome",
      agendaSemanal: "id, dia, paciente",
      alertas: "id, severidade",
      exerciseLibrary: "id, categoria",
      documents: "++pk, patientId",
      meta: "key",
    });
  }
}

/** Singleton database instance shared by every service. */
export const db = new MoveCareDB();
