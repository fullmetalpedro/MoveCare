import { useState, useRef, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Plus, Play, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Paciente } from "../types";
import "./PlanoTratamento.css";

const CATEGORIA_COLORS: Record<string, string> = {
  Fortalecimento: "#FF3B30",
  Estabilização: "#007AFF",
  Flexibilidade: "#FF9500",
  Mobilidade: "#AF52DE",
  Funcional: "#34C759",
  Relaxamento: "#5AC8FA",
  Propriocepção: "#FF9500",
  Equilíbrio: "#007AFF",
};

export default function PlanoTratamento() {
  const paciente = useOutletContext<Paciente>();
  const plano = paciente.planoTratamento;
  const [faseAtiva, setFaseAtiva] = useState(plano?.fases[1]?.id ?? plano?.fases[0]?.id ?? "");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const updateSlider = useCallback(() => {
    if (!tabsRef.current) return;
    const active = tabsRef.current.querySelector(".fase-tab.active") as HTMLElement | null;
    if (active) {
      const parentRect = tabsRef.current.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setSlider({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, []);

  useEffect(() => { updateSlider(); }, [faseAtiva, updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  if (!plano) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
        Nenhum plano de tratamento cadastrado para este paciente.
      </div>
    );
  }

  const fase = plano.fases.find(f => f.id === faseAtiva) ?? plano.fases[0];

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

      <div className="fase-tabs slide-tabs" ref={tabsRef}>
        <div className="slide-indicator" style={{ left: slider.left, width: slider.width }} />
        {plano.fases.map(f => (
          <button
            key={f.id}
            className={`fase-tab ${faseAtiva === f.id ? "active" : ""}`}
            onClick={() => setFaseAtiva(f.id)}
          >
            {f.nome}
          </button>
        ))}
      </div>

      <div className="exercicios-list fade-list" key={faseAtiva}>
        {fase.exercicios.length === 0 ? (
          <div className="empty-fase">Nenhum exercício nesta fase ainda.</div>
        ) : (
          fase.exercicios.map((ex) => (
            <div key={ex.id} className="exercicio-row">
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
          ))
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
