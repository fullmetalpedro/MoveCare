import { FileText, Plus, Download, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { documentService } from "../services";
import "./PacienteDocumentos.css";

/**
 * Global documents page listing clinic-level templates and shared files
 * (contracts, guides, forms) with download and delete actions.
 *
 * Data is sourced from {@link documentService.getTemplates}.
 * Mounted at `/documentos`.
 *
 * @returns The documents grid `<div>` with a document card per file and an
 *   upload drop zone.
 *
 * @example
 * // Rendered at /documentos
 */
export default function Documentos() {
  const docs = documentService.getTemplates();

  return (
    <div className="documentos-page">
      <PageHeader title="Documentos & Modelos" backTo="/" />

      <div className="documentos-grid">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-thumb">
              <FileText size={32} />
              <span className="doc-tipo">{doc.tipo}</span>
            </div>
            <div className="doc-info">
              <span className="doc-nome">{doc.nome}</span>
              <span className="doc-meta">{doc.tamanho} · {doc.data}</span>
            </div>
            <div className="doc-actions">
              <button className="doc-btn"><Download size={14} /></button>
              <button className="doc-btn doc-btn-del"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}

        <div className="add-doc-zone">
          <Plus size={24} />
          <span>Clique ou arraste para adicionar um documento</span>
        </div>
      </div>
    </div>
  );
}
