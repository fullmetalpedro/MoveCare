import { FileText, Plus, Download, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import "./PacienteDocumentos.css";

const MOCK_DOCS = [
  { id: "doc1", nome: "Guia médica", tipo: "PDF", tamanho: "1.2 MB", data: "15/04/2026" },
  { id: "doc2", nome: "Contrato", tipo: "PDF", tamanho: "340 KB", data: "10/03/2026" },
];

export default function Documentos() {
  return (
    <div className="documentos-page">
      <PageHeader title="Documentos & Modelos" backTo="/" />

      <div className="documentos-grid">
        {MOCK_DOCS.map((doc) => (
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
