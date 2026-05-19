import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Plus, Play, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Paciente, Exercicio } from "../types";
import "./PlanoTratamento.css";

const CATEGORIA_COLORS: Record<string, string> = {
  Fortalecimento: "#E04F5F",
  Estabilização: "#007AFF",
  Flexibilidade: "#E8973A",
  Mobilidade: "#AF52DE",
  Funcional: "#34C759",
  Relaxamento: "#5AC8FA",
  Propriocepção: "#E8973A",
  Equilíbrio: "#007AFF",
};

export default function PlanoTratamento() {
  const paciente = useOutletContext<Paciente>();
  const plano = paciente.planoTratamento;
  const [exercicios, setExercicios] = useState<Exercicio[]>(() =>
    plano ? plano.fases.flatMap(f => f.exercicios) : []
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!plano) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
        Nenhum plano de tratamento cadastrado para este paciente.
      </div>
    );
  }

  const draggingIdx = draggingId ? exercicios.findIndex(e => e.id === draggingId) : -1;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggingId) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    setExercicios(prev => {
      const list = [...prev];
      const from = list.findIndex(ex => ex.id === draggingId);
      const to = list.findIndex(ex => ex.id === targetId);
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return list;
    });
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <div className="plano-page">
      <div className="plano-header">
        <div>
          <h1>Plano de Tratamento</h1>
          <p className="plano-subtitle">{paciente.nome} · {paciente.condicao}</p>
        </div>
        <div className="plano-actions">
          <button className="btn-outline-sm"><Download size={14} /> Exportar PDF</button>
          <button className="btn-primary-sm"><Plus size={14} /> Adicionar da Biblioteca</button>
        </div>
      </div>

      <div className="exercicios-list">
        {exercicios.length === 0 ? (
          <div className="empty-fase">Nenhum exercício cadastrado no plano.</div>
        ) : (
          exercicios.map((ex, idx) => {
            const isDragging = draggingId === ex.id;
            const isOver = dragOverId === ex.id;
            // Line before: dragging from below, will land above this item
            const lineBefore = isOver && draggingIdx > idx;
            // Line after: dragging from above, will land below this item
            const lineAfter = isOver && draggingIdx < idx;

            return (
              <div key={ex.id} className="ex-row-wrap">
                <div className={`ex-drop-line${lineBefore ? " visible" : ""}`} />
                <div
                  className={`exercicio-row${isDragging ? " ex-dragging" : ""}`}
                  draggable
                  onDragStart={e => handleDragStart(e, ex.id)}
                  onDragOver={e => handleDragOver(e, ex.id)}
                  onDrop={e => handleDrop(e, ex.id)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="ex-drag"><GripVertical size={16} /></span>
                  <div className={`ex-thumb ${ex.temVideo ? "has-video" : "no-video"}`}>
                    {ex.temVideo ? <Play size={18} /> : "Sem vídeo"}
                  </div>
                  <div className="ex-info">
                    <div className="ex-name-row">
                      <span className="ex-name">{ex.nome}</span>
                      <span
                        className="ex-cat-badge"
                        style={{ background: `${CATEGORIA_COLORS[ex.categoria] ?? "#888"}20`, color: CATEGORIA_COLORS[ex.categoria] ?? "#888" }}
                      >
                        {ex.categoria}
                      </span>
                    </div>
                    <div className="ex-series">Séries: {ex.series}</div>
                  </div>
                  <div className="ex-actions">
                    <button className="ex-btn"><Pencil size={14} /></button>
                    <button className="ex-btn ex-btn-del"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className={`ex-drop-line${lineAfter ? " visible" : ""}`} />
              </div>
            );
          })
        )}
      </div>

      <div className="add-exercise-zone">
        <Plus size={20} />
        <span>Arrastar da Biblioteca ou clicar para adicionar</span>
      </div>

      <div className="card observacoes-card">
        <h2>Observações do Plano</h2>
        <blockquote className="obs-text">{plano.observacoes}</blockquote>
      </div>
    </div>
  );
}
