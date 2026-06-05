import { useOutletContext, useNavigate } from "react-router-dom";
import { Plus, Eye, CheckCircle2, XCircle } from "lucide-react";
import type { Paciente } from "../types";
import "./PacienteResumo.css";

/**
 * Patient summary sub-page showing the latest evolution note, weekly adherence
 * dots, upcoming session, and clinical highlights.
 *
 * Receives the active patient via `useOutletContext<Paciente>()` provided by
 * `PacienteDetail`. Mounted at the index route under `/pacientes/:id`.
 *
 * @returns The summary grid `<div>` with cards for evolution, adherence,
 *   next session, and pain/discharge info.
 *
 * @example
 * // Rendered automatically at /pacientes/:id (index nested route)
 */
export default function PacienteResumo() {
  const paciente = useOutletContext<Paciente>();
  const navigate = useNavigate();

  const diasFeitos = paciente.adesaoSemanal.filter(d => d.feito).length;
  const totalDias = paciente.adesaoSemanal.length;
  const pctSemana = Math.round((diasFeitos / totalDias) * 100);

  return (
    <div className="resumo-grid">
      <div className="card evolucao-card">
        <h2>Última Evolução</h2>
        {paciente.ultimaEvolucao ? (
          <>
            <p className="evolucao-meta">
              {paciente.ultimaEvolucao.data} · {paciente.ultimaEvolucao.sessao} · {paciente.ultimaEvolucao.doutor}
            </p>
            <blockquote className="evolucao-texto">
              {paciente.ultimaEvolucao.texto}
            </blockquote>
          </>
        ) : (
          <p className="evolucao-meta">Nenhuma evolução registrada</p>
        )}
        <div className="evolucao-actions">
          <button className="btn-primary-sm" onClick={() => navigate(`/pacientes/${paciente.id}/evolucao`)}><Plus size={14} /> Nova Evolução</button>
          <button className="btn-outline-sm"><Eye size={14} /> Histórico</button>
        </div>
      </div>

      <div className="card adesao-card">
        <h2>Adesão aos Exercícios (7 dias)</h2>
        <div className="adesao-weekly">
          {paciente.adesaoSemanal.map((d, i) => (
            <div key={i} className="adesao-day">
              <span className="adesao-day-label">{d.dia}</span>
              <div className="adesao-day-bar-bg">
                <div
                  className="adesao-day-bar"
                  style={{ width: d.feito ? "100%" : "0%", background: d.feito ? "#34C759" : "transparent" }}
                />
              </div>
              <span className={`adesao-check ${d.feito ? "done" : "miss"}`}>
                {d.feito ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </span>
            </div>
          ))}
        </div>
        <p className="adesao-summary">{diasFeitos} de {totalDias} dias · {pctSemana}% esta semana</p>
      </div>
    </div>
  );
}
