import type { Paciente } from "../types";

/**
 * Status filter values used on the patients list page.
 * `"Todos"` disables status filtering; the others map to `Paciente.status`.
 */
export type PatientFilter = "Todos" | "Ativos" | "Avaliação" | "Alta";

/**
 * Filters a patient list by status tab and free-text search.
 *
 * Both filters are applied simultaneously: a patient must pass both to appear
 * in the result. The status comparison normalises `"Ativos"` → `"Ativo"` to
 * match the values stored in `Paciente.status`.
 *
 * @param pacientes - Full array of patient records to filter.
 * @param filter - Active status tab; `"Todos"` skips status filtering.
 * @param search - Free-text query matched case-insensitively against `nome`;
 *   an empty string skips name filtering.
 * @returns A new array containing only the patients that satisfy both filters.
 *
 * @example
 * const ativos = filterPatients(pacientes, "Ativos", "");
 * const search = filterPatients(pacientes, "Todos", "maria");
 */
export function filterPatients(
  pacientes: Paciente[],
  filter: PatientFilter,
  search: string,
): Paciente[] {
  return pacientes.filter(p => {
    if (filter !== "Todos" && p.status !== (filter === "Ativos" ? "Ativo" : filter)) return false;
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}
