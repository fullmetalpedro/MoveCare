import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, StretchHorizontal, Activity, Footprints, HeartPulse, Wind, Video, FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { scrollToFirstError } from "../utils/scrollToError";
import {
  Button,
  Chip,
  FormSection,
  FormField,
  TextField,
  Textarea,
  Toggle,
} from "../components/primitives";
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
  const nivelInfo = NIVEIS.find(n => n.label === form.nivel);

  return (
    <div className="cadex-page">
      <PageHeader
        title="Novo Exercício"
        subtitle="Adicione um novo exercício à biblioteca"
        backTo="/biblioteca"
      />

      <form className="cadex-form" onSubmit={handleSubmit} noValidate>
        {/* ── Live preview (bespoke) ── */}
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
                  background: `${nivelInfo?.color ?? "#86868B"}18`,
                  color: nivelInfo?.color ?? "#86868B",
                }}
              >
                {form.nivel}
              </span>
            </div>
          </div>
        </div>

        <FormSection title="Informações Básicas" icon={<Dumbbell size={16} />}>
          <FormField label="Nome do exercício" required colSpan={2} htmlFor="ex-nome" error={errors.nome}>
            <TextField
              id="ex-nome"
              placeholder="Ex.: Agachamento Livre, Prancha Isométrica..."
              value={form.nome}
              error={!!errors.nome}
              onChange={e => set("nome", e.target.value)}
            />
          </FormField>

          <FormField label="Categoria" colSpan={2}>
            <div className="cadex-cat-grid">
              {CATEGORIAS.map(cat => (
                <Chip
                  key={cat.label}
                  color={cat.color}
                  selected={form.categoria === cat.label}
                  onClick={() => set("categoria", cat.label)}
                >
                  <span style={{ display: "flex" }}>{cat.icon}</span>
                  {cat.label}
                </Chip>
              ))}
            </div>
          </FormField>

          <FormField label="Nível de dificuldade">
            <div className="ds-chip-row">
              {NIVEIS.map(niv => (
                <Chip
                  key={niv.label}
                  color={niv.color}
                  selected={form.nivel === niv.label}
                  onClick={() => set("nivel", niv.label)}
                >
                  {niv.label}
                </Chip>
              ))}
            </div>
          </FormField>

          <FormField label="Séries / Duração" required htmlFor="ex-series" error={errors.series}>
            <TextField
              id="ex-series"
              placeholder="Ex.: 3x12 rep, 3x30s, 5 min..."
              value={form.series}
              error={!!errors.series}
              onChange={e => set("series", e.target.value)}
              list="series-sugestoes"
            />
            <datalist id="series-sugestoes">
              {SERIES_SUGESTOES.map(s => <option key={s} value={s} />)}
            </datalist>
            <div className="ds-chip-row" style={{ marginTop: "var(--space-1-5)" }}>
              {SERIES_SUGESTOES.slice(0, 5).map(s => (
                <Chip key={s} selected={form.series === s} onClick={() => set("series", s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </FormField>
        </FormSection>

        <FormSection title="Vídeo demonstrativo" icon={<Video size={16} />} iconColor="#5AC8FA">
          <FormField colSpan={2}>
            <Toggle
              checked={form.temVideo}
              onChange={v => set("temVideo", v)}
              label="Possui vídeo demonstrativo"
              description="Informe o link do vídeo para o paciente assistir"
            />
          </FormField>

          {form.temVideo && (
            <FormField label="URL do vídeo" colSpan={2} htmlFor="ex-video" error={errors.videoUrl}>
              <TextField
                id="ex-video"
                type="url"
                placeholder="https://youtube.com/..."
                value={form.videoUrl}
                error={!!errors.videoUrl}
                onChange={e => set("videoUrl", e.target.value)}
              />
            </FormField>
          )}
        </FormSection>

        <FormSection title="Descrição e Instruções" icon={<FileText size={16} />} iconColor="#34C759">
          <FormField label="Descrição do exercício" colSpan={2} htmlFor="ex-desc">
            <Textarea
              id="ex-desc"
              placeholder="Descreva brevemente o objetivo e benefícios do exercício..."
              value={form.descricao}
              onChange={e => set("descricao", e.target.value)}
              rows={3}
            />
          </FormField>

          <FormField label="Instruções de execução" colSpan={2} htmlFor="ex-instr">
            <Textarea
              id="ex-instr"
              placeholder="Passo a passo de como executar o exercício corretamente..."
              value={form.instrucoes}
              onChange={e => set("instrucoes", e.target.value)}
              rows={4}
            />
          </FormField>
        </FormSection>

        <div className="cadex-actions">
          <Button variant="secondary" onClick={() => navigate("/biblioteca")}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar Exercício
          </Button>
        </div>
      </form>
    </div>
  );
}
