import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, CalendarPlus, Search, ChevronRight, ChevronDown } from "lucide-react";
import type { Paciente, AgendaSemanal } from "../types";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"] as const;
type Dia = (typeof DIAS)[number];

const HORARIOS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

type Secao = 1 | 2;

interface Props {
  pacientes: Paciente[];
  eventos: AgendaSemanal[];
  onClose: () => void;
  onConfirm: (pacienteId: string, dia: Dia, hora: string) => void;
}

export default function AgendamentoModal({ pacientes, eventos, onClose, onConfirm }: Props) {
  const [secaoAberta, setSecaoAberta] = useState<Secao>(1);
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Dia>("Seg");
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const pacientesAtivos = useMemo(
    () => pacientes.filter((p) => p.status === "Ativo"),
    [pacientes]
  );

  const pacientesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return pacientesAtivos;
    return pacientesAtivos.filter((p) => p.nome.toLowerCase().includes(q));
  }, [pacientesAtivos, busca]);

  const horariosOcupados = useMemo(
    () => new Set(eventos.filter((e) => e.dia === diaSelecionado).map((e) => e.hora)),
    [eventos, diaSelecionado]
  );

  function toggleSecao(s: Secao) {
    setSecaoAberta((prev) => (prev === s ? s : s));
    // accordion: clicking a closed section opens it (and closes the other)
    setSecaoAberta(s);
  }

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 180);
  }

  function handleConfirm() {
    if (!pacienteSelecionado || !horaSelecionada) return;
    onConfirm(pacienteSelecionado.id, diaSelecionado, horaSelecionada);
    handleClose();
  }

  const canConfirm = pacienteSelecionado !== null && horaSelecionada !== null;

  return createPortal(
    <div
      className={`modal-overlay${closing ? " closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className="modal-dialog modal-agendar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mag-header">
          <div className="mag-title-row">
            <div className="mag-icon">
              <CalendarPlus size={20} />
            </div>
            <h3 className="modal-title">Novo Agendamento</h3>
          </div>
          <button className="mag-close" onClick={handleClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Seção 1 — Paciente */}
        <div className={`mag-secao${secaoAberta === 1 ? " aberta" : ""}`}>
          <button
            className="mag-secao-header"
            onClick={() => toggleSecao(1)}
            aria-expanded={secaoAberta === 1}
          >
            <div className="mag-label">
              <span className="mag-step">1</span>
              Paciente
              {pacienteSelecionado && secaoAberta !== 1 && (
                <span className="mag-resumo">{pacienteSelecionado.nome}</span>
              )}
            </div>
            {secaoAberta === 1
              ? <ChevronDown size={16} className="mag-chevron" />
              : <ChevronRight size={16} className="mag-chevron" />
            }
          </button>
          <div className="mag-secao-body-wrap">
            <div className="mag-secao-body">
              <div className="mag-search-wrap">
                <Search size={14} className="mag-search-icon" />
                <input
                  className="mag-search"
                  placeholder="Buscar paciente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="mag-patient-list">
                {pacientesFiltrados.length === 0 ? (
                  <p className="mag-empty">Nenhum paciente ativo encontrado.</p>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <button
                      key={p.id}
                      className={`mag-patient-item${pacienteSelecionado?.id === p.id ? " selected" : ""}`}
                      onClick={() => {
                        setPacienteSelecionado(p);
                        toggleSecao(2);
                      }}
                    >
                      <div className="mag-patient-avatar">{p.initials}</div>
                      <div className="mag-patient-info">
                        <span className="mag-patient-nome">{p.nome}</span>
                        <span className="mag-patient-meta">{p.condicao} · {p.idade} anos</span>
                      </div>
                      {pacienteSelecionado?.id === p.id && (
                        <div className="mag-patient-check">✓</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 — Data e horário */}
        <div className={`mag-secao${secaoAberta === 2 ? " aberta" : ""}`}>
          <button
            className="mag-secao-header"
            onClick={() => toggleSecao(2)}
            aria-expanded={secaoAberta === 2}
          >
            <div className="mag-label">
              <span className="mag-step">2</span>
              Data e horário
              {horaSelecionada && secaoAberta !== 2 && (
                <span className="mag-resumo">{diaSelecionado}, {horaSelecionada}</span>
              )}
            </div>
            {secaoAberta === 2
              ? <ChevronDown size={16} className="mag-chevron" />
              : <ChevronRight size={16} className="mag-chevron" />
            }
          </button>
          <div className="mag-secao-body-wrap">
            <div className="mag-secao-body">
              <div className="mag-dias">
                {DIAS.map((d) => (
                  <button
                    key={d}
                    className={`mag-dia-btn${diaSelecionado === d ? " active" : ""}`}
                    onClick={() => {
                      setDiaSelecionado(d);
                      setHoraSelecionada(null);
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="mag-horarios">
                {HORARIOS.map((h) => {
                  const ocupado = horariosOcupados.has(h);
                  const ativo = horaSelecionada === h;
                  return (
                    <button
                      key={h}
                      className={`mag-hora-btn${ocupado ? " ocupado" : ""}${ativo ? " selected" : ""}`}
                      onClick={() => !ocupado && setHoraSelecionada(h)}
                      disabled={ocupado}
                      title={ocupado ? "Horário ocupado" : `Agendar às ${h}`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions mag-actions">
          <button className="modal-btn-cancel" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="modal-btn-confirm"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            Confirmar agendamento
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
