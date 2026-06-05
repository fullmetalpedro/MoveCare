import { useOutletContext } from "react-router-dom";
import { FileText, Plus, Download, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Paciente } from "../types";
import { documentService } from "../services";
import "./PacienteDocumentos.css";

/**
 * Patient documents sub-page listing uploaded files (exams, reports, etc.)
 * with download and delete actions.
 *
 * Receives the active patient via `useOutletContext<Paciente>()` provided by
 * `PacienteDetail`. Document data is sourced from {@link documentService.getForPatient}.
 * Mounted at `/pacientes/:id/documentos`.
 *
 * @returns The documents grid `<div>` with a document card per file and an
 *   upload drop zone.
 *
 * @example
 * // Rendered at /pacientes/:id/documentos
 */
export default function PacienteDocumentos() {
  const { t } = useTranslation();
  const paciente = useOutletContext<Paciente>();
  const docs = documentService.getForPatient(paciente.id);

  return (
    <div className="documentos-page">
      <div className="documentos-header">
        <h2>{t("documentos.patientDocs", { name: paciente.nome })}</h2>
      </div>

      <div className="documentos-grid">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-thumb">
              <FileText size={32} aria-hidden="true" />
              <span className="doc-tipo">{doc.tipo}</span>
            </div>
            <div className="doc-info">
              <span className="doc-nome">{doc.nome}</span>
              <span className="doc-meta">{doc.tamanho} · {doc.data}</span>
            </div>
            <div className="doc-actions">
              <button className="doc-btn" aria-label={t("common.download")}><Download size={14} aria-hidden="true" /></button>
              <button className="doc-btn doc-btn-del" aria-label={t("common.delete")}><Trash2 size={14} aria-hidden="true" /></button>
            </div>
          </div>
        ))}

        <div
          className="add-doc-zone"
          role="button"
          tabIndex={0}
          aria-label={t("documentos.addZone")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.currentTarget.click();
            }
          }}
        >
          <Plus size={24} aria-hidden="true" />
          <span>{t("documentos.addZone")}</span>
        </div>
      </div>
    </div>
  );
}
