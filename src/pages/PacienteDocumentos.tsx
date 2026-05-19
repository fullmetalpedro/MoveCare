import { useOutletContext } from "react-router-dom";
import { FileText, Plus, Download, Trash2 } from "lucide-react";
import type { Paciente } from "../types";
import "./PacienteDocumentos.css";

const MOCK_DOCS = [
  { id: "doc1", nome: "Exame - Eletrocardiograma", tipo: "PDF", tamanho: "2.4 MB", data: "20/04/2026" },
  { id: "doc2", nome: "Exame - Raio X Mão", tipo: "PDF", tamanho: "5.1 MB", data: "18/04/2026" },
];

export default function PacienteDocumentos() {
  const paciente = useOutletContext<Paciente>();

  return (
    <div className="documentos-page">
      <div className="documentos-header">
        <h2>Documentos de {paciente.nome}</h2>
      </div>

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
