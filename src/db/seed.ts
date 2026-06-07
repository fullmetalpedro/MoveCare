import { db, TEMPLATE_SCOPE, type StoredDocument } from "./schema";
import mock from "../data/mock.json";
import type { MockData, LibraryExercicio } from "../types";

/**
 * Bumping this invalidates the existing seed: {@link seedIfEmpty} re-seeds when
 * the stored `seedVersion` differs, which is the upgrade path when the seed data
 * (not the schema) changes.
 */
const SEED_VERSION = 2;

/**
 * Exercise catalogue used to populate the `exerciseLibrary` table on first run.
 * Previously a constant inside `exercise.service.ts`; it now lives here as seed
 * data so the service reads exclusively from IndexedDB.
 */
const LIBRARY: LibraryExercicio[] = [
  { id: "ex1",  nome: "Agachamento Livre",               categoria: "Fortalecimento", duracao: "3x12 rep", temVideo: true,  nivel: "Intermediário" },
  { id: "ex2",  nome: "Prancha Isométrica",               categoria: "Estabilização",  duracao: "3x30s",    temVideo: true,  nivel: "Iniciante"     },
  { id: "ex3",  nome: "Alongamento Isquiotibiais",         categoria: "Flexibilidade",  duracao: "3x30s",    temVideo: true,  nivel: "Iniciante"     },
  { id: "ex4",  nome: "Ponte de Glúteo",                   categoria: "Fortalecimento", duracao: "3x15 rep", temVideo: true,  nivel: "Iniciante"     },
  { id: "ex5",  nome: "Rotação de Quadril",                categoria: "Mobilidade",     duracao: "2x15 rep", temVideo: false, nivel: "Iniciante"     },
  { id: "ex6",  nome: "Leg Press 45°",                     categoria: "Fortalecimento", duracao: "4x10 rep", temVideo: true,  nivel: "Avançado"      },
  { id: "ex7",  nome: "Bird Dog",                          categoria: "Estabilização",  duracao: "3x10 rep", temVideo: true,  nivel: "Iniciante"     },
  { id: "ex8",  nome: "Caminhada Lateral com Elástico",    categoria: "Funcional",      duracao: "3x12 rep", temVideo: true,  nivel: "Intermediário" },
  { id: "ex9",  nome: "Alongamento de Panturrilha",        categoria: "Flexibilidade",  duracao: "3x30s",    temVideo: false, nivel: "Iniciante"     },
  { id: "ex10", nome: "Dead Bug",                          categoria: "Estabilização",  duracao: "3x10 rep", temVideo: true,  nivel: "Intermediário" },
  { id: "ex11", nome: "Step-Up Funcional",                 categoria: "Funcional",      duracao: "3x12 rep", temVideo: true,  nivel: "Intermediário" },
  { id: "ex12", nome: "Respiração Diafragmática",          categoria: "Relaxamento",    duracao: "5 min",    temVideo: true,  nivel: "Iniciante"     },
  { id: "ex13", nome: "Abdução de Quadril",                categoria: "Fortalecimento", duracao: "3x15 rep", temVideo: true,  nivel: "Iniciante"     },
  { id: "ex14", nome: "Mobilização de Tornozelo",          categoria: "Mobilidade",     duracao: "2x20 rep", temVideo: false, nivel: "Iniciante"     },
  { id: "ex15", nome: "Flexão de Ombro com Bastão",        categoria: "Flexibilidade",  duracao: "3x15 rep", temVideo: true,  nivel: "Iniciante"     },
];

/** Clinic-level document templates (contracts, guides, forms). */
const TEMPLATE_DOCS = [
  { id: "doc1", nome: "Guia médica",  tipo: "PDF", tamanho: "1.2 MB", data: "15/04/2026" },
  { id: "doc2", nome: "Contrato",     tipo: "PDF", tamanho: "340 KB", data: "10/03/2026" },
];

/** Sample patient-scoped documents, seeded once per patient on first run. */
const PATIENT_DOCS = [
  { id: "doc1", nome: "Exame - Eletrocardiograma", tipo: "PDF", tamanho: "2.4 MB", data: "20/04/2026" },
  { id: "doc2", nome: "Exame - Raio X Mão",         tipo: "PDF", tamanho: "5.1 MB", data: "18/04/2026" },
];

/**
 * Populates the database from {@link MockData} the first time the app runs (or
 * after a {@link SEED_VERSION} bump), inside a single read/write transaction so
 * a partial seed can never be observed.
 *
 * Idempotent: if the stored `seedVersion` already matches, this resolves
 * immediately without touching any table.
 *
 * @returns Resolves once the database is guaranteed to be seeded.
 *
 * @example
 * // In main.tsx, before the first render:
 * await seedIfEmpty();
 */
export async function seedIfEmpty(): Promise<void> {
  const data = mock as MockData;

  await db.transaction(
    "rw",
    [db.doctor, db.pacientes, db.alertas, db.exerciseLibrary, db.documents, db.meta],
    async () => {
      const current = await db.meta.get("seedVersion");
      if (current?.value === SEED_VERSION) return;

      // Clear everything so a version bump fully replaces stale seed data.
      await Promise.all([
        db.doctor.clear(),
        db.pacientes.clear(),
        db.alertas.clear(),
        db.exerciseLibrary.clear(),
        db.documents.clear(),
      ]);

      const documents: StoredDocument[] = [
        ...TEMPLATE_DOCS.map((d) => ({ ...d, patientId: TEMPLATE_SCOPE })),
        ...data.pacientes.flatMap((p) =>
          PATIENT_DOCS.map((d) => ({ ...d, patientId: p.id })),
        ),
      ];

      await Promise.all([
        db.doctor.add(data.doctor),
        db.pacientes.bulkAdd(data.pacientes),
        db.alertas.bulkAdd(data.alertas),
        db.exerciseLibrary.bulkAdd(LIBRARY),
        db.documents.bulkAdd(documents),
        // Dashboard stats and today's agenda are derived live from the tables
        // above, so only the seed-version guard is stored here.
        db.meta.put({ key: "seedVersion", value: SEED_VERSION }),
      ]);
    },
  );
}

/**
 * Drops every table and re-seeds from scratch. Intended for development/debug
 * use (e.g. from the browser console: `import("./db").then(m => m.resetDatabase())`).
 *
 * @returns Resolves once the database has been wiped and freshly seeded.
 */
export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
  await seedIfEmpty();
}
