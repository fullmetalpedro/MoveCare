import { db } from "../db";
import type { LibraryExercicio } from "../types";

/**
 * Data-access service for the exercise library, backed by IndexedDB (Dexie).
 *
 * Provides the catalogue of exercises available for inclusion in treatment
 * plans. The catalogue is seeded from `src/db/seed.ts` on first run.
 *
 * @example
 * const exercicios = await exerciseService.getLibrary();
 */
export const exerciseService = {
  /**
   * Returns the full catalogue of available exercises.
   *
   * @returns Promise of {@link LibraryExercicio} records.
   *
   * @example
   * const lib = await exerciseService.getLibrary();
   * const strength = lib.filter(e => e.categoria === "Fortalecimento");
   */
  getLibrary(): Promise<LibraryExercicio[]> {
    return db.exerciseLibrary.toArray();
  },
};
