import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Activity, Calendar } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { scrollToFirstError } from "../utils/scrollToError";
import "../styles/forms.css";
import "./CadastroPaciente.css";

interface FormData {
  nome: string;
  idade: string;
  sexo: string;
  condicao: string;
  status: string;
  telefone: string;
  email: string;
  totalSessoes: string;
  dorEVA: string;
  previsaoAlta: string;
  proximaSessaoData: string;
  proximaSessaoHora: string;
  observacoes: string;
}

const SEXO_OPTIONS = ["Masculino", "Feminino", "Outro"];
const STATUS_OPTIONS = ["Ativo", "Avaliação", "Alta"];
const EVA_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function evaColor(val: string) {
  const n = parseInt(val);
  if (n <= 3) return "#34C759";
  if (n <= 6) return "#FF9500";
  return "#FF3B30";
}

export default function CadastroPaciente() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    nome: "",
    idade: "",
    sexo: "Masculino",
    condicao: "",
    status: "Avaliação",
    telefone: "",
    email: "",
    totalSessoes: "",
    dorEVA: "5",
    previsaoAlta: "",
    proximaSessaoData: "",
    proximaSessaoHora: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.nome.trim()) errs.nome = "Nome é obrigatório";
    if (!form.idade || isNaN(Number(form.idade)) || Number(form.idade) <= 0)
      errs.idade = "Idade inválida";
    if (!form.condicao.trim()) errs.condicao = "Condição é obrigatória";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "E-mail inválido";
    if (form.totalSessoes && (isNaN(Number(form.totalSessoes)) || Number(form.totalSessoes) <= 0))
      errs.totalSessoes = "Número inválido";
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
    navigate("/pacientes");
  }

  const evaVal = parseInt(form.dorEVA);

  return (
    <div className="cadastro-page">
      <PageHeader
        title="Novo Paciente"
        subtitle="Preencha os dados para cadastrar um novo paciente"
        backTo="/pacientes"
      />

      <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
        {/* ── Dados Pessoais ── */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><User size={16} /></span>
            <h2 className="section-title">Dados Pessoais</h2>
          </div>
          <div className="form-grid">
            <div className={`form-group col-2 ${errors.nome ? "has-error" : ""}`}>
              <label className="form-label">Nome completo <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                placeholder="Ex.: Ana Souza"
                value={form.nome}
                onChange={e => set("nome", e.target.value)}
              />
              {errors.nome && <span className="form-error">{errors.nome}</span>}
            </div>

            <div className={`form-group ${errors.idade ? "has-error" : ""}`}>
              <label className="form-label">Idade <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                placeholder="Ex.: 35"
                min={1}
                max={120}
                value={form.idade}
                onChange={e => set("idade", e.target.value)}
              />
              {errors.idade && <span className="form-error">{errors.idade}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Sexo</label>
              <div className="radio-group">
                {SEXO_OPTIONS.map(opt => (
                  <label key={opt} className={`radio-option ${form.sexo === opt ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="sexo"
                      value={opt}
                      checked={form.sexo === opt}
                      onChange={() => set("sexo", opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className={`form-group col-2 ${errors.condicao ? "has-error" : ""}`}>
              <label className="form-label">Condição / Diagnóstico <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                placeholder="Ex.: Lombalgia crônica, Tendinite patelar..."
                value={form.condicao}
                onChange={e => set("condicao", e.target.value)}
              />
              {errors.condicao && <span className="form-error">{errors.condicao}</span>}
            </div>
          </div>
        </section>

        {/* ── Contato ── */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><Phone size={16} /></span>
            <h2 className="section-title">Contato</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                className="form-input"
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={e => set("telefone", e.target.value)}
              />
            </div>

            <div className={`form-group ${errors.email ? "has-error" : ""}`}>
              <label className="form-label">
                <Mail size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                E-mail
              </label>
              <input
                className="form-input"
                type="email"
                placeholder="paciente@email.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>
        </section>

        {/* ── Informações Clínicas ── */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><Activity size={16} /></span>
            <h2 className="section-title">Informações Clínicas</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Status inicial</label>
              <div className="select-group">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`select-chip ${form.status === opt ? "active" : ""} chip-${opt.toLowerCase().replace("ã", "a")}`}
                    onClick={() => set("status", opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className={`form-group ${errors.totalSessoes ? "has-error" : ""}`}>
              <label className="form-label">Total de sessões previstas</label>
              <input
                className="form-input"
                type="number"
                placeholder="Ex.: 20"
                min={1}
                value={form.totalSessoes}
                onChange={e => set("totalSessoes", e.target.value)}
              />
              {errors.totalSessoes && <span className="form-error">{errors.totalSessoes}</span>}
            </div>

            <div className="form-group col-2">
              <label className="form-label">
                Dor inicial (EVA)
                <span className="eva-value" style={{ color: evaColor(form.dorEVA) }}>
                  {form.dorEVA}/10
                </span>
              </label>
              <div className="eva-slider-wrap">
                <span className="eva-label-min">0</span>
                <div className="eva-track">
                  <div
                    className="eva-fill"
                    style={{ width: `${evaVal * 10}%`, background: evaColor(form.dorEVA) }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={form.dorEVA}
                    onChange={e => set("dorEVA", e.target.value)}
                    className="eva-range"
                  />
                </div>
                <span className="eva-label-max">10</span>
              </div>
              <div className="eva-scale">
                {EVA_OPTIONS.map(v => (
                  <span
                    key={v}
                    className={`eva-tick ${form.dorEVA === v ? "active" : ""}`}
                    style={form.dorEVA === v ? { color: evaColor(v) } : {}}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Previsão de alta</label>
              <input
                className="form-input"
                type="date"
                value={form.previsaoAlta}
                onChange={e => set("previsaoAlta", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Primeira Sessão ── */}
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><Calendar size={16} /></span>
            <h2 className="section-title">Primeira Sessão</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                className="form-input"
                type="date"
                value={form.proximaSessaoData}
                onChange={e => set("proximaSessaoData", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horário</label>
              <input
                className="form-input"
                type="time"
                value={form.proximaSessaoHora}
                onChange={e => set("proximaSessaoHora", e.target.value)}
              />
            </div>

            <div className="form-group col-2">
              <label className="form-label">Observações iniciais</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Informações adicionais sobre o paciente, histórico, restrições..."
                value={form.observacoes}
                onChange={e => set("observacoes", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn-cancelar" onClick={() => navigate("/pacientes")}>
            Cancelar
          </button>
          <button type="submit" className="btn-salvar">
            Salvar Paciente
          </button>
        </div>
      </form>
    </div>
  );
}
