import { db, TEMPLATE_SCOPE, type StoredDocument } from "../db";

/**
 * Data-access service for document management, backed by IndexedDB (Dexie).
 *
 * Provides clinic-level templates and patient-scoped documents. Both are stored
 * in the `documents` table and distinguished by `patientId` (templates use the
 * {@link TEMPLATE_SCOPE} sentinel). Reads return {@link StoredDocument} so the
 * auto-assigned `pk` is available for stable React keys and deletion.
 *
 * @example
 * const templates = await documentService.getTemplates();
 * const patientDocs = await documentService.getForPatient("p1");
 */
export const documentService = {
  /**
   * Returns clinic-level document templates shown on the global documents page.
   *
   * @returns Promise of template {@link StoredDocument} records.
   */
  getTemplates(): Promise<StoredDocument[]> {
    return db.documents.where("patientId").equals(TEMPLATE_SCOPE).toArray();
  },

  /**
   * Returns documents associated with a specific patient.
   *
   * @param pacienteId - The patient's unique identifier.
   * @returns Promise of {@link StoredDocument} records belonging to the patient.
   *
   * @example
   * const docs = await documentService.getForPatient(paciente.id);
   */
  getForPatient(pacienteId: string): Promise<StoredDocument[]> {
    return db.documents.where("patientId").equals(pacienteId).toArray();
  },

  /**
   * Permanently deletes a document by its primary key.
   *
   * @param pk - The document's auto-assigned primary key.
   * @returns Promise resolving once the document is removed (no-op if absent).
   *
   * @example
   * await documentService.remove(doc.pk!);
   */
  remove(pk: number): Promise<void> {
    return db.documents.delete(pk);
  },
};
