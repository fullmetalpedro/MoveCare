import type { LibraryExercicio } from "../types";

/**
 * Static exercise library dataset.
 * Replace this constant with `fetch("/api/exercicios")` when a backend exists.
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

/**
 * Data-access service for the exercise library.
 *
 * Provides access to the catalogue of exercises available for inclusion in
 * treatment plans. The current implementation uses static data; swap
 * `LIBRARY` for a `fetch("/api/exercicios")` call when a backend is ready.
 *
 * @example
 * const exercicios = exerciseService.getLibrary();
 */
export const exerciseService = {
  /**
   * Returns the full catalogue of available exercises.
   *
   * @returns Array of {@link LibraryExercicio} records in display order.
   *
   * @example
   * const lib = exerciseService.getLibrary();
   * const strength = lib.filter(e => e.categoria === "Fortalecimento");
   */
  getLibrary(): LibraryExercicio[] {
    return LIBRARY;
  },
};
