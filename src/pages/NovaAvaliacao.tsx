import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronUp, Play, Square, CheckCircle2,
  Timer, Dumbbell, Activity, FootprintsIcon, RotateCcw,
  Camera, Brain, ClipboardList, Footprints, X, Plus, Minus,
} from "lucide-react";
import type { Paciente } from "../types";
import "../styles/forms.css";
import "./NovaAvaliacao.css";

// ─── Up/down timer (freerunning) ──────────────────────────────────────────────
/**
 * Free-running stopwatch widget that records elapsed time to one decimal place.
 *
 * @param props.value - Current committed time string (e.g. `"12.3"`); shown when stopped.
 * @param props.onChange - Called with the elapsed time string when the user stops the timer.
 * @returns A time display and start/stop/reset button group.
 */
function TimerWidget({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  const start = () => {
    setElapsed(0);
    setRunning(true);
    ref.current = setInterval(() => setElapsed(e => parseFloat((e + 0.1).toFixed(1))), 100);
  };

  const stop = () => {
    if (ref.current) clearInterval(ref.current);
    setRunning(false);
    onChange(elapsed.toFixed(1));
  };

  const reset = () => {
    if (ref.current) clearInterval(ref.current);
    setRunning(false);
    setElapsed(0);
    onChange("");
  };

  return (
    <div className="timer-widget">
      <div className="timer-display">{running ? elapsed.toFixed(1) : (value || "0.0")}s</div>
      <div className="timer-btns">
        {!running
          ? <button className="timer-btn timer-start" type="button" onClick={start}><Play size={13} /> Iniciar</button>
          : <button className="timer-btn timer-stop"  type="button" onClick={stop}><Square size={13} /> Parar</button>
        }
        <button className="timer-btn timer-reset" type="button" onClick={reset}><RotateCcw size={13} /></button>
      </div>
    </div>
  );
}

// ─── Countdown timer (fixed duration) ────────────────────────────────────────
/**
 * Countdown timer that counts down from `totalSeconds` and shows a "Tempo esgotado!"
 * label when it reaches zero.
 *
 * @param props.totalSeconds - Duration in seconds to count down from.
 * @returns A countdown display and start/reset button group; turns red when ≤ 5 s remain.
 */
function CountdownWidget({ totalSeconds }: { totalSeconds: number }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  const start = () => {
    if (finished || remaining <= 0) return;
    setRunning(true);
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(ref.current!);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const reset = () => {
    if (ref.current) clearInterval(ref.current);
    setRunning(false);
    setFinished(false);
    setRemaining(totalSeconds);
  };

  const urgent = running && remaining <= 5;

  return (
    <div className={`timer-widget${finished ? " timer-widget-done" : urgent ? " timer-widget-urgent" : ""}`}>
      <div className={`timer-display${finished ? " timer-done" : urgent ? " timer-urgent" : ""}`}>
        {remaining}s
      </div>
      <div className="timer-btns">
        {!running && !finished && (
          <button className="timer-btn timer-start" type="button" onClick={start}>
            <Play size={13} /> Iniciar
          </button>
        )}
        {running && (
          <button className="timer-btn timer-stop" type="button" onClick={reset}>
            <Square size={13} /> Parar
          </button>
        )}
        {finished && <span className="timer-done-label">Tempo esgotado!</span>}
        <button className="timer-btn timer-reset" type="button" onClick={reset}><RotateCcw size={13} /></button>
      </div>
    </div>
  );
}

// ─── Rep counter ──────────────────────────────────────────────────────────────
/**
 * Tap counter for incrementing or decrementing a repetition count.
 *
 * @param props.value - Current repetition count; cannot go below 0.
 * @param props.onChange - Called with the new count after each button press.
 * @returns A row with decrement, count display, and increment buttons.
 */
function RepCounter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="rep-counter">
      <button
        type="button"
        className="rep-btn"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
      >
        <Minus size={16} />
      </button>
      <span className="rep-value">{value}</span>
      <button type="button" className="rep-btn rep-btn-add" onClick={() => onChange(value + 1)}>
        <Plus size={16} />
      </button>
    </div>
  );
}

// ─── Score selector (0–N buttons) ─────────────────────────────────────────────
/**
 * Labeled row of score buttons ranging from 0 to `max` (inclusive).
 *
 * Used for MMSE/MoCA section items and DGI/MRC group scores.
 *
 * @param props.label - Descriptive text for the score item.
 * @param props.max - Highest selectable score value.
 * @param props.value - Currently selected score.
 * @param props.onChange - Called with the new score when a button is clicked.
 * @returns A row with the label and a series of numbered score buttons.
 */
function ScoreRow({ label, max, value, onChange }: { label: string; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="score-row">
      <span className="score-row-label">{label}</span>
      <div className="score-row-btns">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`score-btn ${value === i ? "active" : ""}`}
            onClick={() => onChange(i)}
          >{i}</button>
        ))}
      </div>
    </div>
  );
}

// ─── MRC muscle groups ────────────────────────────────────────────────────────
const MRC_GROUPS = [
  "Abdutores do ombro D", "Abdutores do ombro E",
  "Flexores do cotovelo D", "Flexores do cotovelo E",
  "Extensores do punho D", "Extensores do punho E",
  "Flexores do quadril D", "Flexores do quadril E",
  "Extensores do joelho D", "Extensores do joelho E",
  "Dorsiflexores D", "Dorsiflexores E",
];

// ─── DGI items ────────────────────────────────────────────────────────────────
const DGI_ITEMS = [
  "Marcha em superfície plana", "Mudança de velocidade",
  "Rotação horizontal da cabeça", "Rotação vertical da cabeça",
  "Marcha e pivô (180°)", "Degrau", "Obstáculos", "Escadas",
];

// ─── MMSE sections ────────────────────────────────────────────────────────────
interface ScoreItem { id: string; label: string; max: number }
interface TestSection { title: string; hint: string; items: ScoreItem[] }

const MMSE_SECTIONS: TestSection[] = [
  {
    title: "Orientação Temporal",
    hint: 'Pergunte: "Em que ano estamos? Estação? Mês? Dia do mês? Dia da semana?"',
    items: [
      { id: "t_ano",    label: "Ano atual",          max: 1 },
      { id: "t_est",    label: "Estação do ano",      max: 1 },
      { id: "t_mes",    label: "Mês atual",           max: 1 },
      { id: "t_dia_m",  label: "Dia do mês",          max: 1 },
      { id: "t_dia_s",  label: "Dia da semana",       max: 1 },
    ],
  },
  {
    title: "Orientação Espacial",
    hint: 'Pergunte: "Em que país, estado, cidade, local e andar estamos?"',
    items: [
      { id: "e_pais",   label: "País",                max: 1 },
      { id: "e_estado", label: "Estado",              max: 1 },
      { id: "e_cidade", label: "Cidade",              max: 1 },
      { id: "e_local",  label: "Local / prédio",      max: 1 },
      { id: "e_andar",  label: "Andar / sala",        max: 1 },
    ],
  },
  {
    title: "Registro",
    hint: 'Diga pausadamente: "Carro, Vaso, Tijolo". Peça para repetir imediatamente.',
    items: [
      { id: "r_carro",  label: "Carro",               max: 1 },
      { id: "r_vaso",   label: "Vaso",                max: 1 },
      { id: "r_tijolo", label: "Tijolo",              max: 1 },
    ],
  },
  {
    title: "Atenção e Cálculo",
    hint: '"Subtraia 7 de 100 e continue subtraindo." Sequência: 93 → 86 → 79 → 72 → 65. Alternativa: soletre MUNDO de trás para frente (O-D-N-U-M).',
    items: [
      { id: "c_93",  label: "93  (ou O)", max: 1 },
      { id: "c_86",  label: "86  (ou D)", max: 1 },
      { id: "c_79",  label: "79  (ou N)", max: 1 },
      { id: "c_72",  label: "72  (ou U)", max: 1 },
      { id: "c_65",  label: "65  (ou M)", max: 1 },
    ],
  },
  {
    title: "Evocação",
    hint: '"Lembra das três palavras que pedí para repetir? Quais eram?" (Carro, Vaso, Tijolo)',
    items: [
      { id: "ev_carro",  label: "Carro",  max: 1 },
      { id: "ev_vaso",   label: "Vaso",   max: 1 },
      { id: "ev_tijolo", label: "Tijolo", max: 1 },
    ],
  },
  {
    title: "Linguagem e Práxis",
    hint: "Avalie cada item individualmente conforme as instruções.",
    items: [
      { id: "l_nom_can",  label: "Nomeação — Caneta",                              max: 1 },
      { id: "l_nom_rel",  label: "Nomeação — Relógio de pulso",                    max: 1 },
      { id: "l_rep",      label: 'Repetição — "Nem aqui, nem ali, nem lá"',        max: 1 },
      { id: "l_cmd1",     label: "Comando — Pegar papel com mão direita",          max: 1 },
      { id: "l_cmd2",     label: "Comando — Dobrar ao meio",                       max: 1 },
      { id: "l_cmd3",     label: "Comando — Colocar no chão",                      max: 1 },
      { id: "l_leitura",  label: 'Leitura — Fechar os olhos ao ver "FECHE OS OLHOS"', max: 1 },
      { id: "l_escrita",  label: "Escrita — Frase completa com sentido",           max: 1 },
      { id: "l_copia",    label: "Cópia — Dois pentágonos cruzados",               max: 1 },
    ],
  },
];

// ─── MoCA sections ────────────────────────────────────────────────────────────
const MOCA_SECTIONS: TestSection[] = [
  {
    title: "Visoespacial / Executiva",
    hint: "Trilha alternada (1→A→2→B→3→C…), cópia do cubo, relógio com ponteiros às 11h10.",
    items: [
      { id: "ve_trilha",    label: "Trilha alternada",            max: 1 },
      { id: "ve_cubo",      label: "Cópia do cubo 3D",           max: 1 },
      { id: "ve_rel_cont",  label: "Relógio — contorno circular", max: 1 },
      { id: "ve_rel_nums",  label: "Relógio — números corretos",  max: 1 },
      { id: "ve_rel_pont",  label: "Relógio — ponteiros em 11h10", max: 1 },
    ],
  },
  {
    title: "Nomeação",
    hint: "Mostre imagens de animais incomuns: leão, rinoceronte, camelo/dromedário.",
    items: [
      { id: "n_leao",   label: "Leão",                 max: 1 },
      { id: "n_rino",   label: "Rinoceronte",          max: 1 },
      { id: "n_camelo", label: "Camelo / Dromedário",  max: 1 },
    ],
  },
  {
    title: "Atenção",
    hint: "Dígitos diretos (5 números), inversos (3 números), vigilância (tapinha na letra A) e cálculo subtrativo.",
    items: [
      { id: "a_dig_d",  label: "Dígitos diretos (ex: 2 1 8 5 4)",          max: 1 },
      { id: "a_dig_i",  label: "Dígitos inversos (repetir de trás)",         max: 1 },
      { id: "a_vigil",  label: "Vigilância — tapinha ao ouvir letra A",      max: 1 },
      { id: "a_calc",   label: "Cálculo — subtração de 7 (0 erros=3 pts, 1=2, 2-3=1, 4-5=0)", max: 3 },
    ],
  },
  {
    title: "Linguagem",
    hint: "Repetir duas frases longas exatamente. Dizer o máximo de palavras com letra F em 1 min (≥11 = 1 pt).",
    items: [
      { id: "l_frase1", label: 'Frase 1 — "O gato sempre se escondia sob o sofá quando os cachorros estavam na sala"', max: 1 },
      { id: "l_frase2", label: "Frase 2 — segunda frase complexa padronizada",    max: 1 },
      { id: "l_fluenc", label: "Fluência verbal — ≥11 palavras com letra F em 1 min", max: 1 },
    ],
  },
  {
    title: "Abstração",
    hint: 'Pergunte o que têm em comum: "laranja e banana" → frutas; "trem e bicicleta" → transporte.',
    items: [
      { id: "ab1", label: "Laranja e banana (Frutas)",                 max: 1 },
      { id: "ab2", label: "Trem e bicicleta (Meios de transporte)",    max: 1 },
    ],
  },
  {
    title: "Evocação Tardia",
    hint: "Palavras lidas no início: Rosto, Seda, Igreja, Cravo, Vermelho. Perguntar ao final do teste.",
    items: [
      { id: "ev_rosto",    label: "Rosto",     max: 1 },
      { id: "ev_seda",     label: "Seda",      max: 1 },
      { id: "ev_igreja",   label: "Igreja",    max: 1 },
      { id: "ev_cravo",    label: "Cravo",     max: 1 },
      { id: "ev_vermelho", label: "Vermelho",  max: 1 },
    ],
  },
  {
    title: "Orientação",
    hint: "1 ponto por resposta correta.",
    items: [
      { id: "or_dia_m",  label: "Dia do mês",          max: 1 },
      { id: "or_mes",    label: "Mês",                 max: 1 },
      { id: "or_ano",    label: "Ano",                 max: 1 },
      { id: "or_dia_s",  label: "Dia da semana",       max: 1 },
      { id: "or_local",  label: "Local / instituição", max: 1 },
      { id: "or_cidade", label: "Cidade",              max: 1 },
    ],
  },
];

function initVals(sections: TestSection[]): Record<string, number> {
  return Object.fromEntries(sections.flatMap(s => s.items.map(i => [i.id, 0])));
}

// ─── Test modal (MMSE / MoCA) ─────────────────────────────────────────────────
/**
 * Full-screen modal for administering scored cognitive assessments (MMSE and MoCA).
 *
 * Renders a scrollable body of {@link ScoreRow} groups, a live running total in
 * the footer, and a confirm button. Locks body scroll on mount, dismisses on
 * Escape key, and animates out before calling `onClose`.
 *
 * @param props.testId - Identifier (`"mmse"` or `"moca"`) used for threshold labelling.
 * @param props.title - Display title shown in the modal header.
 * @param props.subtitle - Secondary descriptor (score range, normative cutoff).
 * @param props.preamble - Optional instructional content rendered above the sections.
 * @param props.sections - Array of scored sections, each with items and hints.
 * @param props.maxTotal - Maximum achievable total score (30 for both MMSE and MoCA).
 * @param props.values - Current score map keyed by item `id`.
 * @param props.onChange - Called with `(itemId, newScore)` when a score button is clicked.
 * @param props.onClose - Called after the close animation (~180 ms) completes.
 * @param props.onConfirm - Called when the user confirms the assessment results.
 * @returns A portal containing the full-screen assessment modal.
 */
function TestModal({
  testId,
  title,
  subtitle,
  preamble,
  sections,
  maxTotal,
  values,
  onChange,
  onClose,
  onConfirm,
}: {
  testId: string;
  title: string;
  subtitle: string;
  preamble?: React.ReactNode;
  sections: TestSection[];
  maxTotal: number;
  values: Record<string, number>;
  onChange: (id: string, v: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const total = Object.values(values).reduce((a, b) => a + b, 0);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 180);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const isBelowNormal = testId === "moca" ? total < 26 : total < 24;

  return createPortal(
    <div className={`test-modal-overlay${closing ? " closing" : ""}`} onClick={handleClose}>
      <div className="test-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="test-modal-header">
          <div>
            <div className="test-modal-title">{title}</div>
            <div className="test-modal-sub">{subtitle}</div>
          </div>
          <button className="test-modal-close" type="button" onClick={handleClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="test-modal-body">
          {preamble && <div className="test-modal-preamble">{preamble}</div>}
          {sections.map(section => {
            const sectionTotal = section.items.reduce((a, i) => a + (values[i.id] ?? 0), 0);
            const sectionMax   = section.items.reduce((a, i) => a + i.max, 0);
            return (
              <div key={section.title} className="modal-section">
                <div className="modal-section-header">
                  <span className="modal-section-title">{section.title}</span>
                  <span className="modal-section-pts">{sectionTotal} / {sectionMax}</span>
                </div>
                {section.hint && <p className="modal-section-hint">{section.hint}</p>}
                {section.items.map(item => (
                  <ScoreRow
                    key={item.id}
                    label={item.label}
                    max={item.max}
                    value={values[item.id] ?? 0}
                    onChange={v => onChange(item.id, v)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="test-modal-footer">
          <div className="test-modal-total">
            Total: <strong>{total} / {maxTotal}</strong>
            {isBelowNormal && (
              <span className="modal-below-normal">
                {testId === "moca" ? " · Abaixo do normal (< 26)" : " · Sugestivo de comprometimento (< 24)"}
              </span>
            )}
          </div>
          <button className="btn-confirmar" type="button" onClick={onConfirm}>
            Confirmar {title}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Test definitions ─────────────────────────────────────────────────────────
const TESTS = [
  { id: "mrc",          label: "Escala MRC",              desc: "Força muscular 0–5 por grupo",         icon: Activity,       color: "#E04F5F" },
  { id: "dinamometria", label: "Dinamometria de Preensão", desc: "Força de preensão em kgf (D e E)",      icon: Dumbbell,       color: "#34C759" },
  { id: "sit_to_stand", label: "Sentar-Levantar 30s",      desc: "Repetições em 30 segundos",            icon: Footprints,     color: "#E8973A" },
  { id: "tug",          label: "TUG",                      desc: "Timed Up and Go — 3 metros",           icon: Timer,          color: "#007AFF" },
  { id: "10mwt",        label: "10MWT",                    desc: "Velocidade de marcha — 10 metros",     icon: FootprintsIcon, color: "#AF52DE" },
  { id: "dgi",          label: "DGI",                      desc: "Dynamic Gait Index — 8 itens (0–3)",   icon: Activity,       color: "#5AC8FA" },
  { id: "tdr",          label: "Teste do Relógio",         desc: "Upload ou foto do desenho do relógio", icon: Camera,         color: "#E8973A" },
  { id: "mmse",         label: "MMSE",                     desc: "Mini-Exame do Estado Mental (0–30)",   icon: Brain,          color: "#007AFF" },
  { id: "moca",         label: "MoCA",                     desc: "Montreal Cognitive Assessment (0–30)", icon: ClipboardList,  color: "#AF52DE" },
];

// ─── Main component ────────────────────────────────────────────────────────────
/**
 * New clinical assessment page with collapsible test panels for MRC, Dinamometria,
 * TUG, 10MWT, Sit-to-Stand, DGI, Teste do Relógio, MMSE, and MoCA.
 *
 * Receives the active patient via `useOutletContext<Paciente>()` provided by
 * `PacienteDetail`. Each test has its own inline form or modal (MMSE/MoCA).
 * Mounted at `/pacientes/:id/avaliacao/nova`.
 *
 * @returns The assessment page `<div>` with a collapsible test list and
 *   save/cancel footer.
 *
 * @example
 * // Rendered at /pacientes/:id/avaliacao/nova
 */
export default function NovaAvaliacao() {
  const paciente = useOutletContext<Paciente>();
  const navigate  = useNavigate();

  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<"mmse" | "moca" | null>(null);
  const [done,      setDone]      = useState<Set<string>>(new Set());

  // Per-test state
  const [mrcVals,   setMrcVals]  = useState<Record<string, number>>(() => Object.fromEntries(MRC_GROUPS.map(g => [g, 5])));
  const [dinaEsq,   setDinaEsq]  = useState("");
  const [dinaDrt,   setDinaDrt]  = useState("");
  const [sitReps,   setSitReps]  = useState(0);
  const [tugTempo,  setTugTempo] = useState("");
  const [mwtTempo,  setMwtTempo] = useState("");
  const [mwtDist,   setMwtDist]  = useState("10");
  const [dgiVals,   setDgiVals]  = useState<Record<string, number>>(() => Object.fromEntries(DGI_ITEMS.map(g => [g, 0])));
  const [tdrFile,   setTdrFile]  = useState<File | null>(null);
  const [tdrPreview,setTdrPreview] = useState<string | null>(null);
  const [mmseVals,  setMmseVals] = useState<Record<string, number>>(() => initVals(MMSE_SECTIONS));
  const [mocaVals,  setMocaVals] = useState<Record<string, number>>(() => initVals(MOCA_SECTIONS));

  const mwtSpeed  = mwtTempo && mwtDist ? (parseFloat(mwtDist) / parseFloat(mwtTempo)).toFixed(2) : "";
  const dgiTotal  = Object.values(dgiVals).reduce((a, b) => a + b, 0);

  const toggle = (id: string) => {
    if (id === "mmse" || id === "moca") {
      setOpenModal(prev => (prev === id ? null : id as "mmse" | "moca"));
      return;
    }
    setExpanded(e => (e === id ? null : id));
  };

  const markDone = (id: string) => {
    setDone(d => { const n = new Set(d); n.add(id); return n; });
    setExpanded(null);
    setOpenModal(null);
  };

  const handleTDRFile = (file: File) => {
    setTdrFile(file);
    // Object URL instead of a base64 data URL: keeps the (potentially large)
    // image out of React state / memory — the browser holds the blob.
    setTdrPreview(URL.createObjectURL(file));
  };

  // Revoke the previous object URL when it changes or on unmount.
  useEffect(() => {
    if (!tdrPreview) return;
    return () => URL.revokeObjectURL(tdrPreview);
  }, [tdrPreview]);

  const handleSave = () => {
    alert("Avaliação salva! (funcionalidade de persistência não implementada)");
    navigate(`/pacientes/${paciente.id}/evolucao`);
  };

  return (
    <div className="nova-av-page">
      <div className="nova-av-header">
        <div>
          <h1>Nova Avaliação</h1>
          <p className="nova-av-sub">{paciente.nome} · {paciente.condicao}</p>
        </div>
        {done.size > 0 && (
          <button className="btn-salvar-av" type="button" onClick={handleSave}>
            Salvar {done.size} teste{done.size !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="nova-av-list">
        {TESTS.map(test => {
          const Icon  = test.icon;
          const isOpen = expanded === test.id || openModal === test.id;
          const isDone = done.has(test.id);

          return (
            <div key={test.id} className={`nav-test-card ${isOpen ? "open" : ""} ${isDone ? "is-done" : ""}`}>
              <button className="nav-test-header" type="button" onClick={() => toggle(test.id)}>
                <div className="nav-test-icon" style={{ background: `${test.color}18`, color: test.color }}>
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <div className="nav-test-info">
                  <div className="nav-test-label">{test.label}</div>
                  <div className="nav-test-desc">{test.desc}</div>
                </div>
                {isDone && <span className="nav-test-done-tag">Concluído</span>}
                <span className="nav-test-chevron">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {/* Inline forms — not for mmse/moca */}
              {expanded === test.id && (
                <div className="nav-test-form">

                  {test.id === "mrc" && (
                    <div className="form-mrc">
                      <p className="form-hint">Selecione a pontuação (0 = sem contração, 5 = normal)</p>
                      {MRC_GROUPS.map(g => (
                        <ScoreRow key={g} label={g} max={5} value={mrcVals[g]} onChange={v => setMrcVals(p => ({ ...p, [g]: v }))} />
                      ))}
                      <button className="btn-confirmar" type="button" onClick={() => markDone(test.id)}>Confirmar MRC</button>
                    </div>
                  )}

                  {test.id === "dinamometria" && (
                    <div className="form-dina">
                      <div className="dina-row">
                        <div className="form-group">
                          <label>Mão esquerda (kgf)</label>
                          <input className="nav-input" type="number" step="0.5" min="0" placeholder="ex: 22.5" value={dinaEsq} onChange={e => setDinaEsq(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Mão direita (kgf)</label>
                          <input className="nav-input" type="number" step="0.5" min="0" placeholder="ex: 24.0" value={dinaDrt} onChange={e => setDinaDrt(e.target.value)} />
                        </div>
                      </div>
                      <button className="btn-confirmar" type="button" disabled={!dinaEsq || !dinaDrt} onClick={() => markDone(test.id)}>Confirmar Dinamometria</button>
                    </div>
                  )}

                  {test.id === "sit_to_stand" && (
                    <div className="form-sit">
                      <p className="form-hint">Inicie o cronômetro de 30 s e conte as repetições completas enquanto o tempo corre.</p>
                      <div className="form-group">
                        <label>Cronômetro 30 s</label>
                        <CountdownWidget totalSeconds={30} />
                      </div>
                      <div className="form-group">
                        <label>Repetições completas</label>
                        <RepCounter value={sitReps} onChange={setSitReps} />
                      </div>
                      <button className="btn-confirmar" type="button" onClick={() => markDone(test.id)}>
                        Confirmar — {sitReps} rep{sitReps !== 1 ? "s" : ""}
                      </button>
                    </div>
                  )}

                  {test.id === "tug" && (
                    <div className="form-tug">
                      <p className="form-hint">Paciente levanta, caminha 3 m, gira e senta. Inicie o cronômetro no movimento.</p>
                      <div className="form-group">
                        <label>Tempo</label>
                        <TimerWidget value={tugTempo} onChange={setTugTempo} />
                      </div>
                      <button className="btn-confirmar" type="button" disabled={!tugTempo} onClick={() => markDone(test.id)}>Confirmar TUG</button>
                    </div>
                  )}

                  {test.id === "10mwt" && (
                    <div className="form-mwt">
                      <p className="form-hint">Velocidade de marcha confortável em pista de 10 m.</p>
                      <div className="form-group">
                        <label>Tempo</label>
                        <TimerWidget value={mwtTempo} onChange={setMwtTempo} />
                      </div>
                      <div className="form-group">
                        <label>Distância (m)</label>
                        <input className="nav-input" type="number" step="1" value={mwtDist} onChange={e => setMwtDist(e.target.value)} />
                      </div>
                      {mwtSpeed && (
                        <div className="mwt-speed">
                          Velocidade calculada: <strong>{mwtSpeed} m/s</strong>
                        </div>
                      )}
                      <button className="btn-confirmar" type="button" disabled={!mwtTempo} onClick={() => markDone(test.id)}>Confirmar 10MWT</button>
                    </div>
                  )}

                  {test.id === "dgi" && (
                    <div className="form-dgi">
                      <p className="form-hint">0 = alteração grave · 1 = moderada · 2 = leve · 3 = normal</p>
                      {DGI_ITEMS.map(item => (
                        <ScoreRow key={item} label={item} max={3} value={dgiVals[item]} onChange={v => setDgiVals(p => ({ ...p, [item]: v }))} />
                      ))}
                      <div className="dgi-total">Total: <strong>{dgiTotal} / 24</strong></div>
                      <button className="btn-confirmar" type="button" onClick={() => markDone(test.id)}>Confirmar DGI</button>
                    </div>
                  )}

                  {test.id === "tdr" && (
                    <div className="form-tdr">
                      <p className="form-hint">Faça upload da foto do desenho do relógio do paciente.</p>
                      {tdrPreview ? (
                        <div className="tdr-preview-wrap">
                          <img src={tdrPreview} alt="Relógio" className="tdr-preview" />
                          <button className="tdr-change" type="button" onClick={() => { setTdrFile(null); setTdrPreview(null); }}>Trocar imagem</button>
                        </div>
                      ) : (
                        <label className="tdr-upload-zone">
                          <Camera size={28} />
                          <span>Clique para selecionar ou tirar foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: "none" }}
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleTDRFile(f); }}
                          />
                        </label>
                      )}
                      <button className="btn-confirmar" type="button" disabled={!tdrFile} onClick={() => markDone(test.id)}>Confirmar Teste do Relógio</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MMSE modal */}
      {openModal === "mmse" && (
        <TestModal
          testId="mmse"
          title="MMSE"
          subtitle="Mini-Exame do Estado Mental · 0–30 pontos"
          sections={MMSE_SECTIONS}
          maxTotal={30}
          values={mmseVals}
          onChange={(id, v) => setMmseVals(p => ({ ...p, [id]: v }))}
          onClose={() => setOpenModal(null)}
          onConfirm={() => markDone("mmse")}
        />
      )}

      {/* MoCA modal */}
      {openModal === "moca" && (
        <TestModal
          testId="moca"
          title="MoCA"
          subtitle="Montreal Cognitive Assessment · 0–30 pontos (normal ≥ 26)"
          preamble={
            <div className="test-modal-preamble-box">
              <strong>Antes de começar:</strong> leia estas 5 palavras ao paciente e peça para memorizar —{" "}
              <em>Rosto, Seda, Igreja, Cravo, Vermelho</em>. A evocação será avaliada no final.
            </div>
          }
          sections={MOCA_SECTIONS}
          maxTotal={30}
          values={mocaVals}
          onChange={(id, v) => setMocaVals(p => ({ ...p, [id]: v }))}
          onClose={() => setOpenModal(null)}
          onConfirm={() => markDone("moca")}
        />
      )}

      {done.size > 0 && (
        <div className="nova-av-footer">
          <button className="btn-cancelar" type="button" onClick={() => navigate(-1)}>Cancelar</button>
          <button className="btn-salvar-av" type="button" onClick={handleSave}>
            Salvar {done.size} teste{done.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}
