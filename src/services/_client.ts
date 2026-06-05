import dataset from "../data/mock.json";
import type { MockData } from "../types";

/**
 * Returns the in-memory application dataset.
 *
 * This is the single entry point for all application data sourced from
 * {@link MockData}. To connect a real backend, replace the body of this
 * function with a `fetch` call — every service calls this function, so the
 * swap is a one-file change.
 *
 * @returns The full application dataset cast to {@link MockData}.
 *
 * @example
 * // Inside a service:
 * const data = loadDataset();
 * return data.pacientes;
 */
export function loadDataset(): MockData {
  return dataset as MockData;
}
