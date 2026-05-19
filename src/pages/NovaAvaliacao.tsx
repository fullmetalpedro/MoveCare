import { useState, useRef, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronUp, Play, Square, CheckCircle2,
  Timer, Dumbbell, Activity, FootprintsIcon, RotateCcw,
  Camera, Brain, ClipboardList, Footprints,
} from "lucide-react";
import type { Paciente } from "../types";
import "./NovaAvaliacao.css";

// ─── Timer Widget ──────────────────────────────────────────────────────────────
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
    const v = elapsed.toFixed(1);
    onChange(v);
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
        {!running ? (
          <button className="timer-btn timer-start" type="button" onClick={start}>
            <Play size={13} /> Iniciar
          </button>
        ) : (
          <button className="timer-btn timer-stop" type="button" onClick={stop}>
            <Square size={13} /> Parar
          </button>
        )}
        <button className="timer-btn timer-reset" type="button" onClick={reset}>
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Score selector (0–N buttons) ─────────────────────────────────────────────
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
  "Abdutores do ombro D",
  "Abdutores do ombro E",
  "Flexores do cotovelo D",
  "Flexores do cotovelo E",
  "Extensores do punho D",
  "Extensores do punho E",
  "Flexores do quadril D",
  "Flexores do quadril E",
  "Extensores do joelho D",
  "Extensores do joelho E",
  "Dorsiflexores D",
  "Dorsiflexores E",
];

// ─── DGI items ────────────────────────────────────────────────────────────────
const DGI_ITEMS = [
  "Marcha em superfície plana",
  "Mudança de velocidade",
  "Rotação horizontal da cabeça",
  "Rotação vertical da cabeça",
  "Marcha e pivô (180°)",
  "Degrau",
  "Obstáculos",
  "Escadas",
];

// ─── Test definitions ─────────────────────────────────────────────────────────
const TESTS = [
  { id: "mrc",         label: "Escala MRC",               desc: "Força muscular 0–5 por grupo",          icon: Activity,       color: "#FF3B30" },
  { id: "dinamometria",label: "Dinamometria de Preensão",  desc: "Força de preensão em kgf (D e E)",       icon: Dumbbell,       color: "#34C759" },
  { id: "sit_to_stand",label: "Sentar-Levantar 30s",       desc: "Repetições em 30 segundos",             icon: Footprints,     color: "#FF9500" },
  { id: "tug",         label: "TUG",                       desc: "Timed Up and Go — 3 metros",            icon: Timer,          color: "#007AFF" },
  { id: "10mwt",       label: "10MWT",                     desc: "Velocidade de marcha — 10 metros",      icon: FootprintsIcon, color: "#AF52DE" },
  { id: "dgi",         label: "DGI",                       desc: "Dynamic Gait Index — 8 itens (0–3)",    icon: Activity,       color: "#5AC8FA" },
  { id: "tdr",         label: "Teste do Relógio",          desc: "Upload ou foto do desenho do relógio",  icon: Camera,         color: "#FF9500" },
  { id: "mmse",        label: "MMSE",                      desc: "Mini-Exame do Estado Mental (0–30)",    icon: Brain,          color: "#007AFF" },
  { id: "moca",        label: "MoCA",                      desc: "Montreal Cognitive Assessment (0–30)",  icon: ClipboardList,  color: "#AF52DE" },
];

export default function NovaAvaliacao() {
  const paciente = useOutletContext<Paciente>();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  // Per-test state
  const [mrcVals, setMrcVals] = useState<Record<string, number>>(Object.fromEntries(MRC_GROUPS.map(g => [g, 5])));
  const [dinaEsq, setDinaEsq] = useState("");
  const [dinaDrt, setDinaDrt] = useState("");
  const [sitReps, setSitReps] = useState("");
  const [tugTempo, setTugTempo] = useState("");
  const [tugDist] = useState("3");
  const [mwtTempo, setMwtTempo] = useState("");
  const [mwtDist, setMwtDist] = useState("10");
  const [dgiVals, setDgiVals] = useState<Record<string, number>>(Object.fromEntries(DGI_ITEMS.map(g => [g, 0])));
  const [tdrFile, setTdrFile] = useState<File | null>(null);
  const [tdrPreview, setTdrPreview] = useState<string | null>(null);
  const [mmseTotal, setMmseTotal] = useState("");
  const [mocaTotal, setMocaTotal] = useState("");

  const mwtSpeed = mwtTempo && mwtDist
    ? (parseFloat(mwtDist) / parseFloat(mwtTempo)).toFixed(2)
    : "";

  const dgiTotal = Object.values(dgiVals).reduce((a, b) => a + b, 0);

  const toggle = (id: string) => setExpanded(e => (e === id ? null : id));

  const markDone = (id: string) => {
    setDone(d => { const n = new Set(d); n.add(id); return n; });
    setExpanded(null);
  };

  const handleTDRFile = (file: File) => {
    setTdrFile(file);
    const reader = new FileReader();
    reader.onload = e => setTdrPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

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
          <button className="btn-salvar-av" onClick={handleSave}>
            Salvar {done.size} teste{done.size !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="nova-av-list">
        {TESTS.map(test => {
          const Icon = test.icon;
          const isOpen = expanded === test.id;
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

              {isOpen && (
                <div className="nav-test-form">
                  {test.id === "mrc" && (
                    <div className="form-mrc">
                      <p className="form-hint">Selecione a pontuação (0 = sem contração, 5 = normal)</p>
                      {MRC_GROUPS.map(g => (
                        <ScoreRow key={g} label={g} max={5} value={mrcVals[g]} onChange={v => setMrcVals(p => ({ ...p, [g]: v }))} />
                      ))}
                      <button className="btn-confirmar" onClick={() => markDone(test.id)}>Confirmar MRC</button>
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
                      <button className="btn-confirmar" disabled={!dinaEsq || !dinaDrt} onClick={() => markDone(test.id)}>Confirmar Dinamometria</button>
                    </div>
                  )}

                  {test.id === "sit_to_stand" && (
                    <div className="form-simple">
                      <p className="form-hint">Conte o número de repetições completas em 30 segundos.</p>
                      <div className="form-group">
                        <label>Repetições</label>
                        <input className="nav-input" type="number" min="0" placeholder="ex: 12" value={sitReps} onChange={e => setSitReps(e.target.value)} />
                      </div>
                      <button className="btn-confirmar" disabled={!sitReps} onClick={() => markDone(test.id)}>Confirmar</button>
                    </div>
                  )}

                  {test.id === "tug" && (
                    <div className="form-tug">
                      <p className="form-hint">Paciente deve levantar, caminhar 3 m, girar e sentar. Use o cronômetro.</p>
                      <div className="form-group">
                        <label>Tempo</label>
                        <TimerWidget value={tugTempo} onChange={setTugTempo} />
                      </div>
                      <div className="form-group">
                        <label>Distância (m)</label>
                        <input className="nav-input" type="number" step="0.5" value={tugDist} readOnly />
                      </div>
                      <button className="btn-confirmar" disabled={!tugTempo} onClick={() => markDone(test.id)}>Confirmar TUG</button>
                    </div>
                  )}

                  {test.id === "10mwt" && (
                    <div className="form-mwt">
                      <p className="form-hint">Velocidade de marcha confortável. Use cronômetro para medir o trecho.</p>
                      <div className="dina-row">
                        <div className="form-group">
                          <label>Distância (m)</label>
                          <input className="nav-input" type="number" step="1" value={mwtDist} onChange={e => setMwtDist(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Tempo</label>
                          <TimerWidget value={mwtTempo} onChange={setMwtTempo} />
                        </div>
                      </div>
                      {mwtSpeed && (
                        <div className="mwt-speed">
                          Velocidade calculada: <strong>{mwtSpeed} m/s</strong>
                        </div>
                      )}
                      <button className="btn-confirmar" disabled={!mwtTempo} onClick={() => markDone(test.id)}>Confirmar 10MWT</button>
                    </div>
                  )}

                  {test.id === "dgi" && (
                    <div className="form-dgi">
                      <p className="form-hint">0 = alteração grave, 1 = moderada, 2 = leve, 3 = normal</p>
                      {DGI_ITEMS.map(item => (
                        <ScoreRow key={item} label={item} max={3} value={dgiVals[item]} onChange={v => setDgiVals(p => ({ ...p, [item]: v }))} />
                      ))}
                      <div className="dgi-total">Total: <strong>{dgiTotal}/24</strong></div>
                      <button className="btn-confirmar" onClick={() => markDone(test.id)}>Confirmar DGI</button>
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
                      <button className="btn-confirmar" disabled={!tdrFile} onClick={() => markDone(test.id)}>Confirmar Teste do Relógio</button>
                    </div>
                  )}

                  {test.id === "mmse" && (
                    <div className="form-mmse">
                      <p className="form-hint">Mini-Exame do Estado Mental. Pontuação total 0–30.</p>
                      <div className="form-group">
                        <label>Pontuação total (0–30)</label>
                        <input className="nav-input" type="number" min="0" max="30" placeholder="ex: 26" value={mmseTotal} onChange={e => setMmseTotal(e.target.value)} />
                      </div>
                      <button className="btn-confirmar" disabled={!mmseTotal} onClick={() => markDone(test.id)}>Confirmar MMSE</button>
                    </div>
                  )}

                  {test.id === "moca" && (
                    <div className="form-moca">
                      <p className="form-hint">Montreal Cognitive Assessment. Pontuação total 0–30 (≥26 = normal).</p>
                      <div className="form-group">
                        <label>Pontuação total (0–30)</label>
                        <input className="nav-input" type="number" min="0" max="30" placeholder="ex: 24" value={mocaTotal} onChange={e => setMocaTotal(e.target.value)} />
                      </div>
                      <button className="btn-confirmar" disabled={!mocaTotal} onClick={() => markDone(test.id)}>Confirmar MoCA</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
