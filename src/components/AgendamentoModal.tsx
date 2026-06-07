import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, CalendarPlus, Search, ChevronRight, ChevronDown, UserPlus } from "lucide-react";
import { REFERENCE_WEEK, weekdayLabel } from "../lib/schedule";
import type { Paciente, AgendaSemanal } from "../types";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"] as const;
type Dia = (typeof DIAS)[number];

const HORARIOS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

type Secao = 1 | 2;

interface Props {
  /** Full patient list; only patients with status `"Ativo"` are displayed. */
  pacientes: Paciente[];
  /** Current week's schedule events; used to mark occupied time slots as disabled. */
  eventos: AgendaSemanal[];
  /** Pre-selected weekday abbreviation (e.g. `"Seg"`); snaps to `"Seg"` if invalid. */
  diaInicial?: string;
  /**
   * Pre-selected time string (e.g. `"09:00"`); when provided, opens the patient
   * search section first since the time is already chosen.
   */
  horaInicial?: string | null;
  /**
   * ISO date (`yyyy-mm-dd`) of the clicked calendar slot, if any. Forwarded to
   * the new-patient form so the first session is pre-filled with the real date.
   */
  dataInicial?: string | null;
  /**
   * Pre-selected patient. When provided the modal enters "edit" mode: the title
   * and confirm label change, and the date/time section opens first so the user
   * can immediately adjust the existing appointment's day/hour.
   */
  pacienteInicial?: Paciente | null;
  /** Invoked after the close animation completes (~180 ms). */
  onClose: () => void;
  /**
   * Invoked when the user confirms the appointment; receives the selected
   * patient ID, weekday abbreviation, and time string.
   */
  onConfirm: (pacienteId: string, dia: Dia, hora: string) => void;
}

/**
 * Two-step accordion modal for creating a new appointment.
 *
 * Step 1 — patient search: filters active patients by name. Step 2 — date and
 * time: shows weekday buttons and 30-min slot grid with occupied slots
 * (derived from `eventos`) disabled. Both sections can be collapsed; selecting
 * a patient auto-advances to step 2.
 *
 * @param props - {@link Props}
 * @returns A portal containing the appointment scheduling modal dialog.
 *
 * @example
 * <AgendamentoModal
 *   pacientes={pacientes}
 *   eventos={eventos}
 *   diaInicial="Ter"
 *   onClose={() => setOpen(false)}
 *   onConfirm={(id, dia, hora) => console.log(id, dia, hora)}
 * />
 */
export default function AgendamentoModal({
  pacientes,
  eventos,
  diaInicial,
  horaInicial,
  dataInicial,
  pacienteInicial,
  onClose,
  onConfirm,
}: Props) {
  const edicao = !!pacienteInicial;
  const diaValido =
    diaInicial && (DIAS as readonly string[]).includes(diaInicial)
      ? (diaInicial as Dia)
      : "Seg";
  // Edit mode → open the date/time section so the user can change the hour.
  // Pre-filled time → only the patient is left, open section 1. Pre-filled day
  // only (month view / occupied slot) → open section 2 to pick the time.
  const secaoInicial: Secao = edicao ? 2 : horaInicial ? 1 : diaInicial ? 2 : 1;

  const [secaoAberta, setSecaoAberta] = useState<Secao | null>(secaoInicial);
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(pacienteInicial ?? null);
  const [diaSelecionado, setDiaSelecionado] = useState<Dia>(diaValido);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(horaInicial ?? null);
  const [closing, setClosing] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  // Accordion: clicking an open section closes it; clicking a closed one opens
  // it and closes the other. Both can be closed, but never both open.
  function toggleSecao(s: Secao) {
    setSecaoAberta((prev) => (prev === s ? null : s));
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

  function handleNewPatient() {
    // Forward the chosen slot to the registration form's first-session step.
    // Prefer the real clicked date when its weekday still matches the (possibly
    // changed) selection; otherwise map the selected weekday to the reference week.
    const data =
      dataInicial && weekdayLabel(dataInicial) === diaSelecionado
        ? dataInicial
        : REFERENCE_WEEK[diaSelecionado];
    onClose();
    navigate("/pacientes/novo", { state: { data, hora: horaSelecionada ?? "" } });
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
              <CalendarPlus size={20} aria-hidden="true" />
            </div>
            <h3 className="modal-title">{edicao ? t("agenda.editAppointment") : t("agenda.newAppointment")}</h3>
          </div>
          <button className="mag-close" onClick={handleClose} aria-label={t("common.close")}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Seção 1 — Paciente */}
        <div className={`mag-secao mag-secao-paciente${secaoAberta === 1 ? " aberta" : ""}`}>
          <button
            className="mag-secao-header"
            onClick={() => toggleSecao(1)}
            aria-expanded={secaoAberta === 1}
          >
            <div className="mag-label">
              <span className="mag-step">1</span>
              {t("agenda.stepPatient")}
              {pacienteSelecionado && secaoAberta !== 1 && (
                <span className="mag-resumo">{pacienteSelecionado.nome}</span>
              )}
            </div>
            {secaoAberta === 1
              ? <ChevronDown size={16} className="mag-chevron" aria-hidden="true" />
              : <ChevronRight size={16} className="mag-chevron" aria-hidden="true" />
            }
          </button>
          <div className="mag-secao-body-wrap">
            <div className="mag-secao-body">
              <div className="mag-search-wrap">
                <Search size={14} className="mag-search-icon" aria-hidden="true" />
                <label htmlFor="mag-search-input" className="sr-only">
                  {t("agenda.stepPatient")}
                </label>
                <input
                  id="mag-search-input"
                  className="mag-search"
                  placeholder={t("agenda.searchPatient")}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="mag-patient-list">
                {pacientesFiltrados.length === 0 ? (
                  <p className="mag-empty">{t("agenda.noPatientFound")}</p>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <button
                      key={p.id}
                      className={`mag-patient-item${pacienteSelecionado?.id === p.id ? " selected" : ""}`}
                      onClick={() => {
                        setPacienteSelecionado(p);
                        setSecaoAberta(2);
                      }}
                    >
                      <div className="mag-patient-avatar" aria-hidden="true">{p.initials}</div>
                      <div className="mag-patient-info">
                        <span className="mag-patient-nome">{p.nome}</span>
                        <span className="mag-patient-meta">{p.condicao} · {p.idade} {t("common.years")}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button className="mag-new-patient" onClick={handleNewPatient}>
                <UserPlus size={15} aria-hidden="true" />
                {t("agenda.newPatient")}
              </button>
            </div>
          </div>
        </div>

        {/* Seção 2 — Data e horário */}
        <div className={`mag-secao mag-secao-data${secaoAberta === 2 ? " aberta" : ""}`}>
          <button
            className="mag-secao-header"
            onClick={() => toggleSecao(2)}
            aria-expanded={secaoAberta === 2}
          >
            <div className="mag-label">
              <span className="mag-step">2</span>
              {t("agenda.stepDateTime")}
              {horaSelecionada && secaoAberta !== 2 && (
                <span className="mag-resumo">{diaSelecionado}, {horaSelecionada}</span>
              )}
            </div>
            {secaoAberta === 2
              ? <ChevronDown size={16} className="mag-chevron" aria-hidden="true" />
              : <ChevronRight size={16} className="mag-chevron" aria-hidden="true" />
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
                      onClick={() => {
                        if (ocupado) return;
                        setHoraSelecionada(h);
                        setSecaoAberta(null);
                      }}
                      disabled={ocupado}
                      title={ocupado ? t("agenda.slotOccupied") : t("agenda.slotScheduleAt", { time: h })}
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
            {t("common.cancel")}
          </button>
          <button
            className="modal-btn-confirm"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {edicao ? t("agenda.saveAppointment") : t("agenda.confirmAppointment")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
