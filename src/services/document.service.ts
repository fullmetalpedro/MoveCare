import type { Documento } from "../types";

/**
 * Clinic-level document templates (contracts, guides, forms).
 * Replace with `fetch("/api/documentos/templates")` when a backend exists.
 */
const TEMPLATE_DOCS: Documento[] = [
  { id: "doc1", nome: "Guia médica",  tipo: "PDF", tamanho: "1.2 MB", data: "15/04/2026" },
  { id: "doc2", nome: "Contrato",     tipo: "PDF", tamanho: "340 KB", data: "10/03/2026" },
];

/**
 * Sample patient-scoped documents shared across all mock patients.
 * Replace with `fetch(\`/api/pacientes/\${id}/documentos\`)` when a backend exists.
 */
const PATIENT_DOCS: Documento[] = [
  { id: "doc1", nome: "Exame - Eletrocardiograma", tipo: "PDF", tamanho: "2.4 MB", data: "20/04/2026" },
  { id: "doc2", nome: "Exame - Raio X Mão",         tipo: "PDF", tamanho: "5.1 MB", data: "18/04/2026" },
];

/**
 * Data-access service for document management.
 *
 * Provides access to clinic-level templates and patient-scoped documents.
 * Current data is static; both methods are designed to be replaced with API
 * calls without changing their signatures.
 *
 * @example
 * const templates = documentService.getTemplates();
 * const patientDocs = documentService.getForPatient("pac-001");
 */
export const documentService = {
  /**
   * Returns clinic-level document templates available on the global documents page.
   *
   * @returns Array of {@link Documento} template records.
   *
   * @example
   * const templates = documentService.getTemplates();
   * // Render in <Documentos />
   */
  getTemplates(): Documento[] {
    return TEMPLATE_DOCS;
  },

  /**
   * Returns documents associated with a specific patient.
   *
   * In the current mock implementation, the same sample set is returned for
   * every patient ID. When connected to a real API, this will filter by patient.
   *
   * @param _pacienteId - The patient's unique identifier (used by the real API endpoint).
   * @returns Array of {@link Documento} records belonging to the given patient.
   *
   * @example
   * const docs = documentService.getForPatient(paciente.id);
   */
  getForPatient(_pacienteId: string): Documento[] {
    return PATIENT_DOCS;
  },
};
