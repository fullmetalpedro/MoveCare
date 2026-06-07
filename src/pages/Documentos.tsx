import { FileText, Plus, Download, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { useDocumentTemplates } from "../hooks";
import { documentService } from "../services";
import "./PacienteDocumentos.css";

/**
 * Global documents page listing clinic-level templates and shared files
 * (contracts, guides, forms) with download and delete actions.
 *
 * Data is sourced from the live {@link useDocumentTemplates} query.
 * Mounted at `/documentos`.
 *
 * @returns The documents grid `<div>` with a document card per file and an
 *   upload drop zone.
 *
 * @example
 * // Rendered at /documentos
 */
export default function Documentos() {
  const { t } = useTranslation();
  const docs = useDocumentTemplates() ?? [];

  return (
    <div className="documentos-page">
      <PageHeader title={t("documentos.title")} backTo="/" />

      <div className="documentos-grid">
        {docs.map((doc) => (
          <div key={doc.pk} className="doc-card">
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
              <button
                className="doc-btn doc-btn-del"
                aria-label={t("common.delete")}
                onClick={() => doc.pk !== undefined && documentService.remove(doc.pk)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        <div
          className="add-doc-zone"
          role="button"
          tabIndex={0}
          aria-label={t("documentos.addZone")}
        >
          <Plus size={24} aria-hidden="true" />
          <span>{t("documentos.addZone")}</span>
        </div>
      </div>
    </div>
  );
}
