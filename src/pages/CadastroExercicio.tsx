import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, StretchHorizontal, Activity, Footprints, HeartPulse, Wind, Video, FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { scrollToFirstError } from "../utils/scrollToError";
import "../styles/forms.css";
import "./CadastroExercicio.css";

interface FormData {
  nome: string;
  categoria: string;
  nivel: string;
  series: string;
  temVideo: boolean;
  videoUrl: string;
  descricao: string;
  instrucoes: string;
}

const CATEGORIAS = [
  { label: "Fortalecimento", icon: <Dumbbell size={18} />, color: "#FF3B30" },
  { label: "Estabilização", icon: <Activity size={18} />, color: "#007AFF" },
  { label: "Flexibilidade", icon: <StretchHorizontal size={18} />, color: "#FF9500" },
  { label: "Mobilidade", icon: <Footprints size={18} />, color: "#AF52DE" },
  { label: "Funcional", icon: <HeartPulse size={18} />, color: "#34C759" },
  { label: "Relaxamento", icon: <Wind size={18} />, color: "#5AC8FA" },
];

const NIVEIS = [
  { label: "Iniciante", color: "#34C759" },
  { label: "Intermediário", color: "#FF9500" },
  { label: "Avançado", color: "#FF3B30" },
];

const SERIES_SUGESTOES = ["2x10 rep", "3x10 rep", "3x12 rep", "3x15 rep", "4x10 rep", "3x30s", "3x45s", "5 min", "10 min"];

export default function CadastroExercicio() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    nome: "",
    categoria: "Fortalecimento",
    nivel: "Iniciante",
    series: "",
    temVideo: false,
    videoUrl: "",
    descricao: "",
    instrucoes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.nome.trim()) errs.nome = "Nome do exercício é obrigatório";
    if (!form.series.trim()) errs.series = "Séries / duração é obrigatório";
    if (form.temVideo && !form.videoUrl.trim())
      errs.videoUrl = "Informe a URL do vídeo";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      scrollToFirstError();
      return;
    }
    navigate("/biblioteca");
  }

  const catInfo = CATEGORIAS.find(c => c.label === form.categoria)!;

  return (
    <div className="cadex-page">
      <PageHeader
        title="Novo Exercício"
        subtitle="Adicione um novo exercício à biblioteca"
        backTo="/biblioteca"
      />

      <form className="cadex-form" onSubmit={handleSubmit} noValidate>
        {/* ── Preview do card ── */}
        <div className="cadex-preview-wrap">
          <span className="cadex-preview-label">Pré-visualização</span>
          <div className="cadex-preview-card">
            <div className="cadex-prev-thumb" style={{ background: `${catInfo.color}12` }}>
              <span style={{ color: catInfo.color, display: "flex" }}>{catInfo.icon}</span>
              {form.temVideo && (
                <span className="cadex-prev-play" style={{ background: catInfo.color }}>
                  <Video size={10} color="#fff" />
                </span>
              )}
            </div>
            <div className="cadex-prev-info">
              <span className="cadex-prev-nome">{form.nome || "Nome do exercício"}</span>
              <span className="cadex-prev-meta">
                <span className="cadex-prev-dot" style={{ background: catInfo.color }} />
                {form.categoria}
                {form.series ? ` · ${form.series}` : ""}
              </span>
            </div>
            <div className="cadex-prev-footer">
              <span
                className="cadex-prev-nivel"
                style={{
                  background: `${NIVEIS.find(n => n.label === form.nivel)?.color ?? "#86868B"}18`,
                  color: NIVEIS.find(n => n.label === form.nivel)?.color ?? "#86868B",
                }}
              >
                {form.nivel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Informações Básicas ── */}
        <section className="cadex-section">
          <div className="cadex-section-header">
            <span className="cadex-section-icon"><Dumbbell size={16} /></span>
            <h2 className="cadex-section-title">Informações Básicas</h2>
          </div>

          <div className="cadex-grid">
            <div className={`cadex-group col-2 ${errors.nome ? "has-error" : ""}`}>
              <label className="cadex-label">Nome do exercício <span className="required">*</span></label>
              <input
                className="cadex-input"
                type="text"
                placeholder="Ex.: Agachamento Livre, Prancha Isométrica..."
                value={form.nome}
                onChange={e => set("nome", e.target.value)}
              />
              {errors.nome && <span className="cadex-error">{errors.nome}</span>}
            </div>

            <div className="cadex-group col-2">
              <label className="cadex-label">Categoria</label>
              <div className="cadex-cat-grid">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.label}
                    type="button"
                    className={`cadex-cat-btn ${form.categoria === cat.label ? "active" : ""}`}
                    style={form.categoria === cat.label ? {
                      background: `${cat.color}12`,
                      borderColor: cat.color,
                      color: cat.color,
                    } : {}}
                    onClick={() => set("categoria", cat.label)}
                  >
                    <span style={{ display: "flex" }}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="cadex-group">
              <label className="cadex-label">Nível de dificuldade</label>
              <div className="cadex-nivel-group">
                {NIVEIS.map(niv => (
                  <button
                    key={niv.label}
                    type="button"
                    className={`cadex-nivel-btn ${form.nivel === niv.label ? "active" : ""}`}
                    style={form.nivel === niv.label ? {
                      background: `${niv.color}12`,
                      borderColor: niv.color,
                      color: niv.color,
                    } : {}}
                    onClick={() => set("nivel", niv.label)}
                  >
                    {niv.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`cadex-group ${errors.series ? "has-error" : ""}`}>
              <label className="cadex-label">Séries / Duração <span className="required">*</span></label>
              <input
                className="cadex-input"
                type="text"
                placeholder="Ex.: 3x12 rep, 3x30s, 5 min..."
                value={form.series}
                onChange={e => set("series", e.target.value)}
                list="series-sugestoes"
              />
              <datalist id="series-sugestoes">
                {SERIES_SUGESTOES.map(s => <option key={s} value={s} />)}
              </datalist>
              {errors.series && <span className="cadex-error">{errors.series}</span>}
              <div className="cadex-chips">
                {SERIES_SUGESTOES.slice(0, 5).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`cadex-chip ${form.series === s ? "active" : ""}`}
                    onClick={() => set("series", s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Vídeo ── */}
        <section className="cadex-section">
          <div className="cadex-section-header">
            <span className="cadex-section-icon" style={{ background: "rgba(90,200,250,0.12)", color: "#5AC8FA" }}>
              <Video size={16} />
            </span>
            <h2 className="cadex-section-title">Vídeo demonstrativo</h2>
          </div>

          <div className="cadex-grid">
            <div className="cadex-group col-2">
              <label className="cadex-toggle-row">
                <span className="cadex-toggle-text">
                  <span className="cadex-toggle-title">Possui vídeo demonstrativo</span>
                  <span className="cadex-toggle-sub">Informe o link do vídeo para o paciente assistir</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.temVideo}
                  className={`cadex-toggle ${form.temVideo ? "on" : ""}`}
                  onClick={() => set("temVideo", !form.temVideo)}
                >
                  <span className="cadex-toggle-knob" />
                </button>
              </label>
            </div>

            {form.temVideo && (
              <div className={`cadex-group col-2 ${errors.videoUrl ? "has-error" : ""}`}>
                <label className="cadex-label">URL do vídeo</label>
                <input
                  className="cadex-input"
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={form.videoUrl}
                  onChange={e => set("videoUrl", e.target.value)}
                />
                {errors.videoUrl && <span className="cadex-error">{errors.videoUrl}</span>}
              </div>
            )}
          </div>
        </section>

        {/* ── Descrição ── */}
        <section className="cadex-section">
          <div className="cadex-section-header">
            <span className="cadex-section-icon" style={{ background: "rgba(52,199,89,0.1)", color: "#34C759" }}>
              <FileText size={16} />
            </span>
            <h2 className="cadex-section-title">Descrição e Instruções</h2>
          </div>

          <div className="cadex-grid">
            <div className="cadex-group col-2">
              <label className="cadex-label">Descrição do exercício</label>
              <textarea
                className="cadex-input cadex-textarea"
                placeholder="Descreva brevemente o objetivo e benefícios do exercício..."
                value={form.descricao}
                onChange={e => set("descricao", e.target.value)}
                rows={3}
              />
            </div>

            <div className="cadex-group col-2">
              <label className="cadex-label">Instruções de execução</label>
              <textarea
                className="cadex-input cadex-textarea"
                placeholder="Passo a passo de como executar o exercício corretamente..."
                value={form.instrucoes}
                onChange={e => set("instrucoes", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </section>

        <div className="cadex-actions">
          <button type="button" className="btn-cancelar" onClick={() => navigate("/biblioteca")}>
            Cancelar
          </button>
          <button type="submit" className="btn-salvar">
            Salvar Exercício
          </button>
        </div>
      </form>
    </div>
  );
}
