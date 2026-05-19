import { useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Timer, Dumbbell, PlusCircle, ClipboardList, CheckCircle2, Circle,
  ChevronDown, ChevronUp, MessageCircle, Copy, Check, X, ClipboardCheck,
} from "lucide-react";
import type { Paciente, TUGResult, DinamometriaResult, RegistroSessao, AvaliacaoTeste, TesteResult } from "../types";
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

// ─── WhatsApp text builders ───────────────────────────────────────────────────

function formatTesteWA(t: TesteResult): string {
  const lines: string[] = [];
  switch (t.tipo) {
    case "tug":
      lines.push(`⏱ *TUG — Timed Up and Go*`);
      lines.push(`   Tempo: ${t.tempoSegundos}s  |  Distância: ${t.distanciaMetros}m`);
      break;
    case "dinamometria":
      lines.push(`💪 *Dinamometria de Preensão*`);
      lines.push(`   Esquerda: ${t.esquerda} kgf  |  Direita: ${t.direita} kgf`);
      break;
    case "mrc":
      lines.push(`📋 *Escala MRC*`);
      t.grupos.forEach(g => lines.push(`   ${g.nome}: ${g.valor}/5`));
      break;
    case "sit_to_stand":
      lines.push(`🪑 *Sentar-Levantar 30s*`);
      lines.push(`   Repetições: ${t.repeticoes}`);
      break;
    case "10mwt":
      lines.push(`🚶 *10MWT — Teste de Caminhada*`);
      lines.push(`   Tempo: ${t.tempoSegundos}s  |  Velocidade: ${t.velocidade} m/s`);
      break;
    case "dgi":
      lines.push(`🏃 *DGI — Índice de Marcha Dinâmica*`);
      lines.push(`   Total: ${t.total}/24`);
      break;
    case "tdr":
      lines.push(`🕐 *Teste do Relógio*`);
      if (t.observacao) lines.push(`   Obs: ${t.observacao}`);
      break;
    case "mmse":
      lines.push(`🧠 *MMSE*`);
      lines.push(`   Total: ${t.total}/30`);
      break;
    case "moca":
      lines.push(`🧩 *MoCA*`);
      lines.push(`   Total: ${t.total}/30`);
      break;
  }
  return lines.join("\n");
}

function buildAvaliacaoWAText(paciente: Paciente, av: AvaliacaoTeste): string {
  const lines: string[] = [];
  lines.push(`📊 *Avaliação Clínica — ${av.data}*`);
  lines.push(`👤 *${paciente.nome}*`);
  lines.push(`🩺 ${av.doutor}`);
  lines.push(``);
  lines.push(`*Resultados:*`);
  lines.push(``);
  av.testes.forEach(t => {
    lines.push(formatTesteWA(t));
    lines.push(``);
  });
  lines.push(`_Relatório gerado via MoveCare_`);
  return lines.join("\n");
}

// ─── Shared WhatsApp modal ────────────────────────────────────────────────────

function WAModal({ text, onClose }: { text: string; onClose: () => void }) {
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
            <span className="wa-icon-badge"><MessageCircle size={18} /></span>
            <div>
              <div className="wa-modal-title">Compartilhar no WhatsApp</div>
              <div className="wa-modal-sub">Copie e cole na conversa com o paciente</div>
            </div>
          </div>
          <button className="wa-close-btn" onClick={handleClose}><X size={18} /></button>
        </div>
        <div className="wa-modal-body">
          <pre className="wa-text-block">{text}</pre>
        </div>
        <div className="wa-modal-footer">
          <button className={`wa-copy-btn${copied ? " copied" : ""}`} onClick={handleCopy}>
            {copied ? <><Check size={15} /> Copiado!</> : <><Copy size={15} /> Copiar texto</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Sparkline & helpers ──────────────────────────────────────────────────────

function Sparkline({ values, color, invert = false }: { values: number[]; color: string; invert?: boolean }) {
  const W = 300, H = 72, PAD = 10;
  if (values.length < 2) return <p className="spark-na">Dados insuficientes para gráfico</p>;
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
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
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

function DeltaBadge({ first, last, invertGood }: { first: number; last: number; invertGood?: boolean }) {
  const diff = last - first;
  if (Math.abs(diff) < 0.01) return null;
  const good = invertGood ? diff < 0 : diff > 0;
  const pct = Math.abs(diff / first * 100).toFixed(0);
  return (
    <span className={`delta-badge ${good ? "delta-good" : "delta-bad"}`}>
      {diff < 0 ? "↓" : "↑"} {pct}%
    </span>
  );
}

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

function inferNextSessaoNum(registros: RegistroSessao[], paciente: Paciente): number {
  if (registros.length > 0) {
    return Math.max(...registros.map(r => r.sessaoNum)) + 1;
  }
  return paciente.sessoes > 0 ? paciente.sessoes : 1;
}

export default function Evolucao() {
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
    () => makeEmptyForm(totalExerciciosPlano, inferNextSessaoNum(paciente.registrosSessoes ?? [], paciente))
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
    const errs: Partial<Record<keyof NovaRegistroForm, string>> = {};
    if (!form.data.trim()) errs.data = "Informe a data";
    if (!form.sessaoNum.trim() || isNaN(Number(form.sessaoNum))) errs.sessaoNum = "Número inválido";
    if (!form.observacoes.trim()) errs.observacoes = "Adicione uma observação";
    const feitos = Number(form.exerciciosFeitos);
    const total = Number(form.totalExercicios);
    if (!form.exerciciosFeitos.trim() || isNaN(feitos) || feitos < 0) errs.exerciciosFeitos = "Inválido";
    if (!form.totalExercicios.trim() || isNaN(total) || total <= 0) errs.totalExercicios = "Inválido";
    if (!errs.exerciciosFeitos && !errs.totalExercicios && feitos > total) errs.exerciciosFeitos = "Maior que o total";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSalvar() {
    if (!validate()) return;
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
    setForm(makeEmptyForm(totalExerciciosPlano, inferNextSessaoNum(novosRegistros, paciente)));
    setShowForm(false);
    setErrors({});
  }

  function openFormReset() {
    setForm(makeEmptyForm(totalExerciciosPlano, inferNextSessaoNum(registros, paciente)));
    setErrors({});
    setShowForm(true);
  }

  const isEmpty = avaliacoes.length === 0 && registros.length === 0;

  return (
    <div className="evolucao-page">
      {/* header */}
      <div className="evolucao-header">
        <div>
          <h1>Evolução</h1>
          <p className="evolucao-subtitle">
            {paciente.nome}
            {avaliacoes.length > 0 && ` · ${avaliacoes.length} ${avaliacoes.length !== 1 ? "avaliações" : "avaliação"}`}
            {registros.length > 0 && ` · ${registros.length} ${registros.length !== 1 ? "sessões" : "sessão"}`}
          </p>
        </div>
        {!isEmpty && (
          <div className="evolucao-header-btns">
            <button className="btn-nova-av btn-nova-sessao" onClick={openFormReset}>
              <ClipboardList size={15} /> Registrar Sessão
            </button>
            <button className="btn-nova-av" onClick={() => navigate(`/pacientes/${paciente.id}/avaliacao/nova`)}>
              <PlusCircle size={15} /> Nova Avaliação
            </button>
          </div>
        )}
      </div>

      {/* formulário nova sessão */}
      {showForm && (
        <div className="card sessao-form-card">
          <h2 className="sessao-form-title">Nova observação de sessão</h2>
          <div className="sessao-form-grid">
            <div className={`cadex-group${errors.data ? " has-error" : ""}`}>
              <label className="cadex-label">Data</label>
              <input className="cadex-input" type="text" placeholder="DD/MM/AAAA"
                value={form.data} onChange={e => setField("data", e.target.value)} />
              {errors.data && <span className="cadex-error">{errors.data}</span>}
            </div>

            <div className={`cadex-group${errors.sessaoNum ? " has-error" : ""}`}>
              <label className="cadex-label">Nº da Sessão</label>
              <input className="cadex-input" type="number" min="1" placeholder="Ex.: 12"
                value={form.sessaoNum} onChange={e => setField("sessaoNum", e.target.value)} />
              {errors.sessaoNum && <span className="cadex-error">{errors.sessaoNum}</span>}
            </div>

            <div className={`cadex-group${errors.exerciciosFeitos ? " has-error" : ""}`}>
              <label className="cadex-label">Exercícios feitos</label>
              <input className="cadex-input" type="number" min="0" placeholder="Ex.: 4"
                value={form.exerciciosFeitos} onChange={e => setField("exerciciosFeitos", e.target.value)} />
              {errors.exerciciosFeitos && <span className="cadex-error">{errors.exerciciosFeitos}</span>}
            </div>

            <div className={`cadex-group${errors.totalExercicios ? " has-error" : ""}`}>
              <label className="cadex-label">
                Total de exercícios
                {totalExerciciosPlano > 0 && (
                  <span className="cadex-label-hint"> · do plano</span>
                )}
              </label>
              <input className="cadex-input" type="number" min="1"
                placeholder={totalExerciciosPlano > 0 ? String(totalExerciciosPlano) : "Ex.: 7"}
                value={form.totalExercicios}
                onChange={e => setField("totalExercicios", e.target.value)} />
              {errors.totalExercicios && <span className="cadex-error">{errors.totalExercicios}</span>}
            </div>

            <div className={`cadex-group sessao-obs-group${errors.observacoes ? " has-error" : ""}`}>
              <label className="cadex-label">Observações do profissional</label>
              <textarea className="cadex-input cadex-textarea" rows={4}
                placeholder="Descreva a evolução, dificuldades, ajustes realizados na sessão..."
                value={form.observacoes} onChange={e => setField("observacoes", e.target.value)} />
              {errors.observacoes && <span className="cadex-error">{errors.observacoes}</span>}
            </div>
          </div>
          <div className="sessao-form-actions">
            <button className="btn-cancelar" onClick={() => { setShowForm(false); setErrors({}); }}>Cancelar</button>
            <button className="btn-salvar" onClick={handleSalvar}>Salvar Sessão</button>
          </div>
        </div>
      )}

      {/* estado vazio */}
      {isEmpty && !showForm && (
        <div className="evolucao-empty">
          <div className="evolucao-empty-icon"><Dumbbell size={40} /></div>
          <h2>Sem registros ainda</h2>
          <p>Realize a primeira avaliação ou registre a observação de uma sessão para começar.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-nova-av" onClick={() => navigate(`/pacientes/${paciente.id}/avaliacao/nova`)}>
              <PlusCircle size={15} /> Nova Avaliação
            </button>
            <button className="btn-nova-av btn-nova-sessao" onClick={openFormReset}>
              <ClipboardList size={15} /> Registrar Sessão
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
                <div className="ev-chart-icon" style={{ background: "rgba(0,122,255,0.1)", color: "#007AFF" }}>
                  <Timer size={18} />
                </div>
                <div className="ev-chart-titles">
                  <div className="ev-chart-title">TUG — Timed Up and Go</div>
                  <div className="ev-chart-sub">Tempo (s) · menor é melhor</div>
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
                <div className="ev-chart-icon" style={{ background: "rgba(52,199,89,0.1)", color: "#34C759" }}>
                  <Dumbbell size={18} />
                </div>
                <div className="ev-chart-titles">
                  <div className="ev-chart-title">Dinamometria de Preensão</div>
                  <div className="ev-chart-sub">Força média (kgf) · maior é melhor</div>
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
                    <span className="ev-point-val">E {d.esquerda} / D {d.direita} kgf</span>
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
              <ClipboardList size={18} className="sessoes-icon" />
              <h2>Registro de Sessões</h2>
            </div>
            <span className="sessoes-count">{registros.length} {registros.length !== 1 ? "sessões" : "sessão"}</span>
          </div>
          <div className="sessoes-list">
            {registros.map(reg => {
              const pct = reg.totalExercicios > 0 ? Math.round((reg.exerciciosFeitos / reg.totalExercicios) * 100) : 0;
              const isExpanded = expandedSessaoId === reg.id;
              return (
                <div key={reg.id} className={`sessao-item${isExpanded ? " expanded" : ""}`}>
                  <button className="sessao-item-header" onClick={() => setExpandedSessaoId(isExpanded ? null : reg.id)}>
                    <div className="sessao-meta">
                      <span className="sessao-num-badge">Sessão #{reg.sessaoNum}</span>
                      <span className="sessao-data">{reg.data}</span>
                    </div>
                    <div className="sessao-right">
                      <div className="sessao-adesao-inline">
                        {pct >= 80
                          ? <CheckCircle2 size={14} style={{ color: "#34C759" }} />
                          : <Circle size={14} style={{ color: pct >= 50 ? "#FF9500" : "#FF3B30" }} />
                        }
                        <span style={{ color: pct >= 80 ? "#34C759" : pct >= 50 ? "#FF9500" : "#FF3B30", fontSize: 13, fontWeight: 600 }}>
                          {reg.exerciciosFeitos}/{reg.totalExercicios}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
              <ClipboardCheck size={18} className="sessoes-icon" />
              <h2>Histórico de Avaliações</h2>
            </div>
            <span className="sessoes-count">{avaliacoes.length} {avaliacoes.length !== 1 ? "avaliações" : "avaliação"}</span>
          </div>

          <div className="sessoes-list">
            {[...avaliacoes].reverse().map(av => {
              const isExpanded = expandedAvId === av.id;
              return (
                <div key={av.id} className={`sessao-item av-item${isExpanded ? " expanded" : ""}`}>
                  <button
                    className="sessao-item-header av-item-header"
                    onClick={() => setExpandedAvId(isExpanded ? null : av.id)}
                    title="Clique para ver os resultados"
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
                      <span className="av-expand-hint">{isExpanded ? "fechar" : "detalhes"}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                        onClick={() => setWaText(buildAvaliacaoWAText(paciente, av))}
                      >
                        <MessageCircle size={14} /> Compartilhar no WhatsApp
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

function AvaliacaoTesteCard({ teste }: { teste: TesteResult }) {
  const label = TEST_LABELS[teste.tipo] ?? teste.tipo;

  const rows: [string, string][] = [];
  switch (teste.tipo) {
    case "tug":
      rows.push(["Tempo", `${teste.tempoSegundos}s`], ["Distância", `${teste.distanciaMetros}m`]);
      break;
    case "dinamometria":
      rows.push(["Esquerda", `${teste.esquerda} kgf`], ["Direita", `${teste.direita} kgf`]);
      break;
    case "mrc":
      teste.grupos.forEach(g => rows.push([g.nome, `${g.valor}/5`]));
      break;
    case "sit_to_stand":
      rows.push(["Repetições (30s)", String(teste.repeticoes)]);
      break;
    case "10mwt":
      rows.push(["Tempo", `${teste.tempoSegundos}s`], ["Velocidade", `${teste.velocidade} m/s`]);
      break;
    case "dgi":
      rows.push(["Total", `${teste.total}/24`]);
      break;
    case "tdr":
      if (teste.observacao) rows.push(["Observação", teste.observacao]);
      break;
    case "mmse":
      rows.push(["Total", `${teste.total}/30`]);
      break;
    case "moca":
      rows.push(["Total", `${teste.total}/30`]);
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
        {rows.length === 0 && <span className="av-teste-key">Sem dados numéricos</span>}
      </div>
    </div>
  );
}
