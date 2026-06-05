import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Activity, Calendar } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { scrollToFirstError } from "../utils/scrollToError";
import {
  Button,
  Chip,
  FormSection,
  FormField,
  TextField,
  Textarea,
} from "../components/primitives";
import type { ChipTone } from "../components/primitives";
import { validatePatientForm } from "../lib/validation";
import { evaColor } from "../lib/format";
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
const STATUS_OPTIONS: { value: string; tone: ChipTone }[] = [
  { value: "Ativo", tone: "success" },
  { value: "Avaliação", tone: "warning" },
  { value: "Alta", tone: "neutral" },
];
const EVA_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

/**
 * New patient registration form with sections for personal data, contact,
 * clinical information, and the first session.
 *
 * Validation is handled by {@link validatePatientForm} from
 * `src/lib/validation.ts`. The EVA pain slider uses {@link evaColor} from
 * `src/lib/format.ts` for color feedback. Scrolls to the first error on
 * failed submission via `scrollToFirstError`.
 * Mounted at `/pacientes/novo`.
 *
 * @returns The registration form page `<div>` with sectioned fields and
 *   cancel/save actions.
 *
 * @example
 * // Rendered at /pacientes/novo
 */
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
    return validatePatientForm(form);
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
        <FormSection title="Dados Pessoais" icon={<User size={16} />}>
          <FormField label="Nome completo" required colSpan={2} htmlFor="nome" error={errors.nome}>
            <TextField
              id="nome"
              placeholder="Ex.: Ana Souza"
              value={form.nome}
              error={!!errors.nome}
              onChange={e => set("nome", e.target.value)}
            />
          </FormField>

          <FormField label="Idade" required htmlFor="idade" error={errors.idade}>
            <TextField
              id="idade"
              type="number"
              placeholder="Ex.: 35"
              min={1}
              max={120}
              value={form.idade}
              error={!!errors.idade}
              onChange={e => set("idade", e.target.value)}
            />
          </FormField>

          <FormField label="Sexo">
            <div className="ds-chip-row">
              {SEXO_OPTIONS.map(opt => (
                <Chip key={opt} selected={form.sexo === opt} onClick={() => set("sexo", opt)}>
                  {opt}
                </Chip>
              ))}
            </div>
          </FormField>

          <FormField label="Condição / Diagnóstico" required colSpan={2} htmlFor="condicao" error={errors.condicao}>
            <TextField
              id="condicao"
              placeholder="Ex.: Lombalgia crônica, Tendinite patelar..."
              value={form.condicao}
              error={!!errors.condicao}
              onChange={e => set("condicao", e.target.value)}
            />
          </FormField>
        </FormSection>

        <FormSection title="Contato" icon={<Phone size={16} />}>
          <FormField label="Telefone" htmlFor="telefone">
            <TextField
              id="telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={e => set("telefone", e.target.value)}
            />
          </FormField>

          <FormField
            label={<><Mail size={13} /> E-mail</>}
            htmlFor="email"
            error={errors.email}
          >
            <TextField
              id="email"
              type="email"
              placeholder="paciente@email.com"
              value={form.email}
              error={!!errors.email}
              onChange={e => set("email", e.target.value)}
            />
          </FormField>
        </FormSection>

        <FormSection title="Informações Clínicas" icon={<Activity size={16} />}>
          <FormField label="Status inicial">
            <div className="ds-chip-row">
              {STATUS_OPTIONS.map(opt => (
                <Chip
                  key={opt.value}
                  tone={opt.tone}
                  selected={form.status === opt.value}
                  onClick={() => set("status", opt.value)}
                >
                  {opt.value}
                </Chip>
              ))}
            </div>
          </FormField>

          <FormField label="Total de sessões previstas" htmlFor="totalSessoes" error={errors.totalSessoes}>
            <TextField
              id="totalSessoes"
              type="number"
              placeholder="Ex.: 20"
              min={1}
              value={form.totalSessoes}
              error={!!errors.totalSessoes}
              onChange={e => set("totalSessoes", e.target.value)}
            />
          </FormField>

          <FormField
            colSpan={2}
            label={
              <>
                Dor inicial (EVA)
                <span className="eva-value" style={{ color: evaColor(form.dorEVA) }}>
                  {form.dorEVA}/10
                </span>
              </>
            }
          >
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
          </FormField>

          <FormField label="Previsão de alta" htmlFor="previsaoAlta">
            <TextField
              id="previsaoAlta"
              type="date"
              value={form.previsaoAlta}
              onChange={e => set("previsaoAlta", e.target.value)}
            />
          </FormField>
        </FormSection>

        <FormSection title="Primeira Sessão" icon={<Calendar size={16} />}>
          <FormField label="Data" htmlFor="proximaSessaoData">
            <TextField
              id="proximaSessaoData"
              type="date"
              value={form.proximaSessaoData}
              onChange={e => set("proximaSessaoData", e.target.value)}
            />
          </FormField>

          <FormField label="Horário" htmlFor="proximaSessaoHora">
            <TextField
              id="proximaSessaoHora"
              type="time"
              value={form.proximaSessaoHora}
              onChange={e => set("proximaSessaoHora", e.target.value)}
            />
          </FormField>

          <FormField label="Observações iniciais" colSpan={2} htmlFor="observacoes">
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o paciente, histórico, restrições..."
              value={form.observacoes}
              onChange={e => set("observacoes", e.target.value)}
              rows={4}
            />
          </FormField>
        </FormSection>

        <div className="cadastro-actions">
          <Button variant="secondary" onClick={() => navigate("/pacientes")}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar Paciente
          </Button>
        </div>
      </form>
    </div>
  );
}
