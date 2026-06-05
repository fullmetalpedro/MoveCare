import { useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Timer, Dumbbell, PlusCircle, ClipboardList, CheckCircle2, Circle,
  ChevronDown, ChevronUp, MessageCircle, Copy, Check, X, ClipboardCheck,
} from "lucide-react";
import type { Paciente, TUGResult, DinamometriaResult, RegistroSessao, TesteResult } from "../types";
import { scrollToFirstError } from "../utils/scrollToError";
import { buildAvaliacaoWhatsAppText, validateSessionForm, inferNextSessionNumber } from "../lib";
import "./Evolucao.css";

const TEST_LABELS: Record<string, string> = {
  tug: "TUG",
  dinamometria: "Dinamometria",
  mrc: "Escala MRC",
  sit_to_stand: "Sentar-Levantar 30s",
  "10mwt": "10MWT",
  dgi: "DGI",
  tdr: "Teste do Relógio",
  mmse: "MMSE",
  moca: "MoCA",
};

// ─── Shared WhatsApp modal ────────────────────────────────────────────────────

/**
 * WhatsApp share modal that displays pre-formatted text and a one-click copy button.
 *
 * @param props.text - The formatted text to display and copy.
 * @param props.onClose - Called after the close animation (~180 ms) completes.
 * @returns A portal overlay containing the share modal.
 */
function WAModal({ text, onClose }: { text: string; onClose: () => void }) {
  const { t } = useTranslation();
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return createPortal(
    <div
      className={`wa-modal-overlay${closing ? " closing" : ""}`}
      role="dialog"
      aria-modal="true"
      onMouseDown={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="wa-modal">
        <div className="wa-modal-header">
          <div className="wa-modal-title-row">
            <span className="wa-icon-badge" aria-hidden="true"><MessageCircle size={18} /></span>
            <div>
              <div className="wa-modal-title">{t("evolucao.modal.title")}</div>
              <div className="wa-modal-sub">{t("evolucao.modal.subtitle")}</div>
            </div>
          </div>
          <button
            className="wa-close-btn"
            onClick={handleClose}
            aria-label={t("common.close")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="wa-modal-body">
          <pre className="wa-text-block">{text}</pre>
        </div>
        <div className="wa-modal-footer">
          <button className={`wa-copy-btn${copied ? " copied" : ""}`} onClick={handleCopy}>
            {copied
              ? <><Check size={15} aria-hidden="true" /> {t("common.copied")}</>
              : <><Copy size={15} aria-hidden="true" /> {t("common.copy")}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Sparkline & helpers ──────────────────────────────────────────────────────

/**
 * Inline SVG sparkline chart with a gradient fill and dot markers.
 *
 * @param props.values - Array of numeric data points (minimum 2 for a line).
 * @param props.color - Hex/CSS color applied to the line, dots, and gradient.
 * @param props.invert - When `true`, inverts values so lower numbers appear higher (e.g. TUG time). @default false
 * @returns An `<svg>` sparkline, or a "Dados insuficientes" paragraph if fewer than 2 points.
 */
function Sparkline({ values, color, invert = false }: { values: number[]; color: string; invert?: boolean }) {
  const { t } = useTranslation();
  const W = 300, H = 72, PAD = 10;
  if (values.length < 2) return <p className="spark-na">{t("evolucao.charts.insufficientData")}</p>;
  const display = invert ? values.map(v => -v) : values;
  const min = Math.min(...display), max = Math.max(...display), range = max - min || 1;
  const pts: [number, number][] = display.map((v, i) => [
    PAD + (i / (display.length - 1)) * (W - PAD * 2),
    PAD + (1 - (v - min) / range) * (H - PAD * 2),
  ]);
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M${pts[0][0]},${H} ${pts.map(([x, y]) => `L${x},${y}`).join(" ")} L${pts[pts.length - 1][0]},${H} Z`;
  const gradId = `g${color.replace("#", "")}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="var(--card-bg)" strokeWidth="2" />
      ))}
    </svg>
  );
}

/**
 * Badge showing the percentage change between two measurements.
 *
 * @param props.first - The earlier (baseline) measurement value.
 * @param props.last - The most recent measurement value.
 * @param props.invertGood - When `true`, a decrease is treated as an improvement (e.g. TUG time). @default false
 * @returns A colored arrow + percentage badge, or `null` when the difference is negligible.
 */
function DeltaBadge({ first, last, invertGood }: { first: number; last: number; invertGood?: boolean }) {
  const diff = last - first;
  if (Math.abs(diff) < 0.01) return null;
  const good = invertGood ? diff < 0 : diff > 0;
  const pct = Math.abs(diff / first * 100).toFixed(0);
  return (
    <span className={`delta-badge ${good ? "delta-good" : "delta-bad"}`} aria-hidden="true">
      {diff < 0 ? "↓" : "↑"} {pct}%
    </span>
  );
}

/**
 * Inline adherence bar for a single session showing exercises completed vs total.
 *
 * @param props.feitos - Number of exercises completed in the session.
 * @param props.total - Total number of exercises prescribed for the session.
 * @returns A progress bar and a `feitos/total (pct%)` label colored by threshold.
 */
function AdesaoBar({ feitos, total }: { feitos: number; total: number }) {
  const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;
  const color = pct >= 80 ? "#34C759" : pct >= 50 ? "#FF9500" : "#FF3B30";
  return (
    <div className="sess-adesao-wrap">
      <div className="sess-adesao-bar-bg">
        <div className="sess-adesao-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="sess-adesao-label" style={{ color }}>{feitos}/{total} ({pct}%)</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NovaRegistroForm {
  data: string;
  sessaoNum: string;
  observacoes: string;
  exerciciosFeitos: string;
  totalExercicios: string;
}

function makeEmptyForm(totalPlano: number, nextSessao: number): NovaRegistroForm {
  return {
    data: new Date().toLocaleDateString("pt-BR"),
    sessaoNum: nextSessao > 0 ? String(nextSessao) : "",
    observacoes: "",
    exerciciosFeitos: "",
    totalExercicios: totalPlano > 0 ? String(totalPlano) : "",
  };
}

/**
 * Patient evolution sub-page showing TUG/Dinamometria sparkline charts, a
 * session-registration form, and the full assessment history.
 *
 * Receives the active patient via `useOutletContext<Paciente>()` provided by
 * `PacienteDetail`. Session validation is handled by {@link validateSessionForm}
 * from `src/lib/validation.ts`. WhatsApp text is generated by
 * {@link buildAvaliacaoWhatsAppText} from `src/lib/whatsapp.ts`.
 * Mounted at `/pacientes/:id/evolucao`.
 *
 * @returns The evolution page `<div>` with charts, session list, and assessment history.
 *
 * @example
 * // Rendered at /pacientes/:id/evolucao
 */
export default function Evolucao() {
  const { t } = useTranslation();
  const paciente = useOutletContext<Paciente>();
  const navigate = useNavigate();
  const avaliacoes = paciente.avaliacoes ?? [];

  const totalExerciciosPlano =
    paciente.planoTratamento?.fases.flatMap(f => f.exercicios).length ?? 0;

  const [registros, setRegistros] = useState<RegistroSessao[]>(
    () => [...(paciente.registrosSessoes ?? [])].reverse()
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NovaRegistroForm>(
    () => makeEmptyForm(totalExerciciosPlano, inferNextSessionNumber(paciente.registrosSessoes ?? [], paciente))
  );
  const [errors, setErrors] = useState<Partial<Record<keyof NovaRegistroForm, string>>>({});
  const [expandedSessaoId, setExpandedSessaoId] = useState<string | null>(null);
  const [expandedAvId, setExpandedAvId] = useState<string | null>(null);
  const [waText, setWaText] = useState<string | null>(null);

  const tugData = avaliacoes.flatMap(av =>
    av.testes.filter((t): t is TUGResult => t.tipo === "tug")
      .map(t => ({ data: av.data, tempo: t.tempoSegundos }))
  );
  const dinaData = avaliacoes.flatMap(av =>
    av.testes.filter((t): t is DinamometriaResult => t.tipo === "dinamometria")
      .map(t => ({ data: av.data, esquerda: t.esquerda, direita: t.direita }))
  );

  function setField<K extends keyof NovaRegistroForm>(k: K, v: NovaRegistroForm[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }));
  }

  function validate(): boolean {
    const errs = validateSessionForm(form);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSalvar() {
    if (!validate()) {
      scrollToFirstError();
      return;
    }
    const novoRegistro: RegistroSessao = {
      id: `rs-${Date.now()}`,
      data: form.data.trim(),
      sessaoNum: Number(form.sessaoNum),
      observacoes: form.observacoes.trim(),
      exerciciosFeitos: Number(form.exerciciosFeitos),
      totalExercicios: Number(form.totalExercicios),
    };
    const novosRegistros = [novoRegistro, ...registros];
    setRegistros(novosRegistros);
    setForm(makeEmptyForm(totalExerciciosPlano, inferNextSessionNumber(novosRegistros, paciente)));
    setShowForm(false);
    setErrors({});
  }

  function openFormReset() {
    setForm(makeEmptyForm(totalExerciciosPlano, inferNextSessionNumber(registros, paciente)));
    setErrors({});
    setShowForm(true);
  }

  const isEmpty = avaliacoes.length === 0 && registros.length === 0;

  return (
    <div className="evolucao-page">
      {/* header */}
      <div className="evolucao-header">
        <div>
          <h1>{t("evolucao.pageTitle")}</h1>
          <p className="evolucao-subtitle">
            {paciente.nome}
            {avaliacoes.length > 0 && ` · ${avaliacoes.length} ${t("evolucao.subtitle.assessments", { count: avaliacoes.length })}`}
            {registros.length > 0 && ` · ${registros.length} ${t("evolucao.subtitle.sessions", { count: registros.length })}`}
          </p>
        </div>
        {!isEmpty && (
          <div className="evolucao-header-btns">
            <button className="btn-nova-av btn-nova-sessao" onClick={openFormReset}>
              <ClipboardList size={15} aria-hidden="true" /> {t("evolucao.btnRegisterSession")}
            </button>
            <button className="btn-nova-av" onClick={() => navigate(`/pacientes/${paciente.id}/avaliacao/nova`)}>
              <PlusCircle size={15} aria-hidden="true" /> {t("evolucao.btnNewAssessment")}
            </button>
          </div>
        )}
      </div>

      {/* formulário nova sessão */}
      {showForm && (
        <div className="card sessao-form-card">
          <h2 className="sessao-form-title">{t("evolucao.formTitle")}</h2>
          <div className="sessao-form-grid">
            <div className={`cadex-group${errors.data ? " has-error" : ""}`}>
              <label className="cadex-label">{t("evolucao.formFields.date")}</label>
              <input className="cadex-input" type="text" placeholder={t("evolucao.formFields.datePlaceholder")}
                value={form.data} onChange={e => setField("data", e.target.value)} />
              {errors.data && <span className="cadex-error">{errors.data}</span>}
            </div>

            <div className={`cadex-group${errors.sessaoNum ? " has-error" : ""}`}>
              <label className="cadex-label">{t("evolucao.formFields.sessionNum")}</label>
              <input className="cadex-input" type="number" min="1" placeholder={t("evolucao.formFields.sessionNumPlaceholder")}
                value={form.sessaoNum} onChange={e => setField("sessaoNum", e.target.value)} />
              {errors.sessaoNum && <span className="cadex-error">{errors.sessaoNum}</span>}
            </div>

            <div className={`cadex-group${errors.exerciciosFeitos ? " has-error" : ""}`}>
              <label className="cadex-label">{t("evolucao.formFields.exercisesDone")}</label>
              <input className="cadex-input" type="number" min="0" placeholder={t("evolucao.formFields.exercisesDonePlaceholder")}
                value={form.exerciciosFeitos} onChange={e => setField("exerciciosFeitos", e.target.value)} />
              {errors.exerciciosFeitos && <span className="cadex-error">{errors.exerciciosFeitos}</span>}
            </div>

            <div className={`cadex-group${errors.totalExercicios ? " has-error" : ""}`}>
              <label className="cadex-label">
                {t("evolucao.formFields.totalExercises")}
                {totalExerciciosPlano > 0 && (
                  <span className="cadex-label-hint"> {t("evolucao.formFields.totalExercisesFromPlan")}</span>
                )}
              </label>
              <input className="cadex-input" type="number" min="1"
                placeholder={totalExerciciosPlano > 0 ? String(totalExerciciosPlano) : t("evolucao.formFields.totalExercisesPlaceholder")}
                value={form.totalExercicios}
                onChange={e => setField("totalExercicios", e.target.value)} />
              {errors.totalExercicios && <span className="cadex-error">{errors.totalExercicios}</span>}
            </div>

            <div className={`cadex-group sessao-obs-group${errors.observacoes ? " has-error" : ""}`}>
              <label className="cadex-label">{t("evolucao.formFields.observations")}</label>
              <textarea className="cadex-input cadex-textarea" rows={4}
                placeholder={t("evolucao.formFields.observationsPlaceholder")}
                value={form.observacoes} onChange={e => setField("observacoes", e.target.value)} />
              {errors.observacoes && <span className="cadex-error">{errors.observacoes}</span>}
            </div>
          </div>
          <div className="sessao-form-actions">
            <button className="btn-cancelar" onClick={() => { setShowForm(false); setErrors({}); }}>{t("common.cancel")}</button>
            <button className="btn-salvar" onClick={handleSalvar}>{t("evolucao.btnSaveSession")}</button>
          </div>
        </div>
      )}

      {/* estado vazio */}
      {isEmpty && !showForm && (
        <div className="evolucao-empty">
          <div className="evolucao-empty-icon" aria-hidden="true"><Dumbbell size={40} /></div>
          <h2>{t("evolucao.emptyState.title")}</h2>
          <p>{t("evolucao.emptyState.description")}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-nova-av" onClick={() => navigate(`/pacientes/${paciente.id}/avaliacao/nova`)}>
              <PlusCircle size={15} aria-hidden="true" /> {t("evolucao.btnNewAssessment")}
            </button>
            <button className="btn-nova-av btn-nova-sessao" onClick={openFormReset}>
              <ClipboardList size={15} aria-hidden="true" /> {t("evolucao.btnRegisterSession")}
            </button>
          </div>
        </div>
      )}

      {/* gráficos */}
      {(tugData.length > 0 || dinaData.length > 0) && (
        <div className="evolucao-charts">
          {tugData.length > 0 && (
            <div className="ev-chart-card">
              <div className="ev-chart-header">
                <div className="ev-chart-icon" style={{ background: "rgba(0,122,255,0.1)", color: "#007AFF" }} aria-hidden="true">
                  <Timer size={18} />
                </div>
                <div className="ev-chart-titles">
                  <div className="ev-chart-title">{t("evolucao.charts.tugTitle")}</div>
                  <div className="ev-chart-sub">{t("evolucao.charts.tugSub")}</div>
                </div>
                {tugData.length >= 2 && <DeltaBadge first={tugData[0].tempo} last={tugData[tugData.length - 1].tempo} invertGood />}
              </div>
              <div className="ev-chart-area">
                <Sparkline values={tugData.map(d => d.tempo)} color="#007AFF" invert />
              </div>
              <div className="ev-chart-points">
                {tugData.map((d, i) => (
                  <div key={i} className="ev-point">
                    <span className="ev-point-date">{d.data}</span>
                    <span className="ev-point-val">{d.tempo}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dinaData.length > 0 && (
            <div className="ev-chart-card">
              <div className="ev-chart-header">
                <div className="ev-chart-icon" style={{ background: "rgba(52,199,89,0.1)", color: "#34C759" }} aria-hidden="true">
                  <Dumbbell size={18} />
                </div>
                <div className="ev-chart-titles">
                  <div className="ev-chart-title">{t("evolucao.charts.dinamometriaTitle")}</div>
                  <div className="ev-chart-sub">{t("evolucao.charts.dinamometriaSub")}</div>
                </div>
                {dinaData.length >= 2 && (
                  <DeltaBadge
                    first={(dinaData[0].esquerda + dinaData[0].direita) / 2}
                    last={(dinaData[dinaData.length - 1].esquerda + dinaData[dinaData.length - 1].direita) / 2}
                  />
                )}
              </div>
              <div className="ev-chart-area">
                <Sparkline values={dinaData.map(d => (d.esquerda + d.direita) / 2)} color="#34C759" />
              </div>
              <div className="ev-chart-points">
                {dinaData.map((d, i) => (
                  <div key={i} className="ev-point">
                    <span className="ev-point-date">{d.data}</span>
                    <span className="ev-point-val">{t("evolucao.charts.leftRight", { left: d.esquerda, right: d.direita })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* registro de sessões */}
      {registros.length > 0 && (
        <div className="card sessoes-card">
          <div className="sessoes-card-header">
            <div className="sessoes-card-title-row">
              <ClipboardList size={18} className="sessoes-icon" aria-hidden="true" />
              <h2>{t("evolucao.sessions.cardTitle")}</h2>
            </div>
            <span className="sessoes-count">{t("evolucao.sessions.count", { count: registros.length })}</span>
          </div>
          <div className="sessoes-list">
            {registros.map(reg => {
              const pct = reg.totalExercicios > 0 ? Math.round((reg.exerciciosFeitos / reg.totalExercicios) * 100) : 0;
              const isExpanded = expandedSessaoId === reg.id;
              return (
                <div key={reg.id} className={`sessao-item${isExpanded ? " expanded" : ""}`}>
                  <button
                    className="sessao-item-header"
                    onClick={() => setExpandedSessaoId(isExpanded ? null : reg.id)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded
                      ? t("evolucao.sessions.collapseLabel", { num: reg.sessaoNum })
                      : t("evolucao.sessions.expandLabel", { num: reg.sessaoNum })}
                  >
                    <div className="sessao-meta">
                      <span className="sessao-num-badge">{t("evolucao.sessions.sessionBadge", { num: reg.sessaoNum })}</span>
                      <span className="sessao-data">{reg.data}</span>
                    </div>
                    <div className="sessao-right">
                      <div className="sessao-adesao-inline">
                        {pct >= 80
                          ? <CheckCircle2 size={14} style={{ color: "#34C759" }} aria-hidden="true" />
                          : <Circle size={14} style={{ color: pct >= 50 ? "#FF9500" : "#FF3B30" }} aria-hidden="true" />
                        }
                        <span style={{ color: pct >= 80 ? "#34C759" : pct >= 50 ? "#FF9500" : "#FF3B30", fontSize: 13, fontWeight: 600 }}>
                          {reg.exerciciosFeitos}/{reg.totalExercicios}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="sessao-item-body">
                      <AdesaoBar feitos={reg.exerciciosFeitos} total={reg.totalExercicios} />
                      <p className="sessao-obs-text">{reg.observacoes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* histórico de avaliações */}
      {avaliacoes.length > 0 && (
        <div className="card av-historico-card">
          <div className="sessoes-card-header">
            <div className="sessoes-card-title-row">
              <ClipboardCheck size={18} className="sessoes-icon" aria-hidden="true" />
              <h2>{t("evolucao.assessments.cardTitle")}</h2>
            </div>
            <span className="sessoes-count">{t("evolucao.assessments.count", { count: avaliacoes.length })}</span>
          </div>

          <div className="sessoes-list">
            {[...avaliacoes].reverse().map(av => {
              const isExpanded = expandedAvId === av.id;
              return (
                <div key={av.id} className={`sessao-item av-item${isExpanded ? " expanded" : ""}`}>
                  <button
                    className="sessao-item-header av-item-header"
                    onClick={() => setExpandedAvId(isExpanded ? null : av.id)}
                    aria-expanded={isExpanded}
                    title={t("evolucao.assessments.clickToViewHint")}
                  >
                    <div className="sessao-meta">
                      <span className="sessao-num-badge">{av.data}</span>
                      <span className="sessao-data">{av.doutor}</span>
                    </div>
                    <div className="av-chips-row">
                      {av.testes.map((t, j) => (
                        <span key={j} className="tl-chip">{TEST_LABELS[t.tipo] ?? t.tipo}</span>
                      ))}
                    </div>
                    <div className="sessao-right">
                      <span className="av-expand-hint">{isExpanded ? t("evolucao.assessments.collapseHint") : t("evolucao.assessments.expandHint")}</span>
                      {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="sessao-item-body av-item-body">
                      <div className="av-testes-list">
                        {av.testes.map((t, j) => (
                          <AvaliacaoTesteCard key={j} teste={t} />
                        ))}
                      </div>
                      <button
                        className="wa-share-btn"
                        onClick={() => setWaText(buildAvaliacaoWhatsAppText(paciente, av))}
                      >
                        <MessageCircle size={14} aria-hidden="true" /> {t("evolucao.assessments.shareWhatsApp")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {waText && <WAModal text={waText} onClose={() => setWaText(null)} />}
    </div>
  );
}

// ─── Card de resultado de teste ───────────────────────────────────────────────

/**
 * Detail card rendering the key-value results for a single clinical test.
 *
 * Handles all {@link TesteResult} discriminated union variants and falls back
 * gracefully when a variant has no numeric data.
 *
 * @param props.teste - The test result to display.
 * @returns A card `<div>` with the test label and a list of result rows.
 */
function AvaliacaoTesteCard({ teste }: { teste: TesteResult }) {
  const { t } = useTranslation();
  const label = TEST_LABELS[teste.tipo] ?? teste.tipo;

  const rows: [string, string][] = [];
  switch (teste.tipo) {
    case "tug":
      rows.push([t("evolucao.testRows.tempo"), `${teste.tempoSegundos}s`], [t("evolucao.testRows.distancia"), `${teste.distanciaMetros}m`]);
      break;
    case "dinamometria":
      rows.push([t("evolucao.testRows.esquerda"), `${teste.esquerda} kgf`], [t("evolucao.testRows.direita"), `${teste.direita} kgf`]);
      break;
    case "mrc":
      teste.grupos.forEach(g => rows.push([g.nome, `${g.valor}/5`]));
      break;
    case "sit_to_stand":
      rows.push([t("evolucao.testRows.repeticoes"), String(teste.repeticoes)]);
      break;
    case "10mwt":
      rows.push([t("evolucao.testRows.tempo"), `${teste.tempoSegundos}s`], [t("evolucao.testRows.velocidade"), `${teste.velocidade} m/s`]);
      break;
    case "dgi":
      rows.push([t("evolucao.testRows.total"), `${teste.total}/24`]);
      break;
    case "tdr":
      if (teste.observacao) rows.push([t("evolucao.testRows.observacao"), teste.observacao]);
      break;
    case "mmse":
      rows.push([t("evolucao.testRows.total"), `${teste.total}/30`]);
      break;
    case "moca":
      rows.push([t("evolucao.testRows.total"), `${teste.total}/30`]);
      break;
  }

  return (
    <div className="av-teste-card">
      <div className="av-teste-label">{label}</div>
      <div className="av-teste-rows">
        {rows.map(([k, v], i) => (
          <div key={i} className="av-teste-row">
            <span className="av-teste-key">{k}</span>
            <span className="av-teste-val">{v}</span>
          </div>
        ))}
        {rows.length === 0 && <span className="av-teste-key">{t("evolucao.testRows.noData")}</span>}
      </div>
    </div>
  );
}
