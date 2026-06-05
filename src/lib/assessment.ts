import type { RegistroSessao, Paciente } from "../types";

/**
 * Calculates the walking speed from a 10-Metre Walk Test (10MWT).
 *
 * Speed is computed as `distance / time` and rounded to two decimal places.
 * Returns an empty string if either argument is missing or non-numeric, so
 * callers can safely render it conditionally.
 *
 * @param distanciaMetros - Walked distance as a string (e.g. `"10"`).
 *   Empty or non-numeric values yield `""`.
 * @param tempoSegundos - Time taken as a string in seconds (e.g. `"12.5"`).
 *   Empty or non-numeric values yield `""`.
 * @returns Speed in m/s rounded to 2 decimal places, or `""` if inputs are
 *   invalid.
 *
 * @example
 * calcWalkingSpeed("10", "12.5"); // "0.80"
 * calcWalkingSpeed("",  "12.5"); // ""
 */
export function calcWalkingSpeed(distanciaMetros: string, tempoSegundos: string): string {
  if (!distanciaMetros || !tempoSegundos) return "";
  const dist = parseFloat(distanciaMetros);
  const time = parseFloat(tempoSegundos);
  if (isNaN(dist) || isNaN(time) || time === 0) return "";
  return (dist / time).toFixed(2);
}

/**
 * Infers the session number for the next session to be registered.
 *
 * If previous session records exist, returns `max(sessaoNum) + 1`.
 * If no records exist but the patient has attended sessions, returns
 * the patient's current session count (as a continuation marker).
 * Falls back to `1` if both sources are empty.
 *
 * @param registros - Existing session records for the patient (may be empty).
 * @param paciente - The patient whose `sessoes` field is used as a fallback.
 * @returns The inferred session number as a positive integer.
 *
 * @example
 * // Patient has records up to session 5:
 * inferNextSessionNumber(registros, paciente); // 6
 *
 * // No records, patient attended 3 sessions:
 * inferNextSessionNumber([], { sessoes: 3, ...rest }); // 3
 */
export function inferNextSessionNumber(registros: RegistroSessao[], paciente: Paciente): number {
  if (registros.length > 0) {
    return Math.max(...registros.map(r => r.sessaoNum)) + 1;
  }
  return paciente.sessoes > 0 ? paciente.sessoes : 1;
}
