export interface Doctor {
  /** Unique clinician identifier. */
  id: string;
  /** Full display name, e.g. `"Dr. Carlos Reis"`. */
  name: string;
  /** Two-letter initials used in {@link Avatar}. */
  initials: string;
  /** Professional role label, e.g. `"Fisioterapeuta"`. */
  role: string;
  /** Registration code, e.g. `"CREFITO-3"`. */
  crefito: string;
}

export interface Stats {
  pacientesHoje: number;
  pacientesHojeDetalhe: string;
  adesaoGeral: number;
  adesaoVariacao: number;
  pacientesAtivos: number;
  pacientesEmAvaliacao: number;
}

export interface AgendaItem {
  hora: string;
  paciente: string | null;
  tipo: string;
  status: "confirmado" | "avaliacao" | "livre";
}

export interface Alerta {
  id: string;
  paciente: string;
  mensagem: string;
  severidade: "alta" | "media" | "baixa";
}

export interface AdesaoDia {
  dia: string;
  feito: boolean;
}

export interface Exercicio {
  id: string;
  nome: string;
  categoria: string;
  series: string;
  temVideo: boolean;
  videoUrl?: string;
  descricao?: string;
}

export interface RegistroSessao {
  id: string;
  data: string;
  sessaoNum: number;
  observacoes: string;
  exerciciosFeitos: number;
  totalExercicios: number;
}

export interface FaseTratamento {
  id: string;
  nome: string;
  exercicios: Exercicio[];
}

export interface PlanoTratamento {
  observacoes: string;
  fases: FaseTratamento[];
}

export interface Evolucao {
  data: string;
  sessao: string;
  doutor: string;
  texto: string;
}

export interface TUGResult { tipo: "tug"; tempoSegundos: number; distanciaMetros: number; }
export interface DinamometriaResult { tipo: "dinamometria"; esquerda: number; direita: number; }
export interface MRCResult { tipo: "mrc"; grupos: { nome: string; valor: number }[]; }
export interface SitToStandResult { tipo: "sit_to_stand"; repeticoes: number; }
export interface TenMWTResult { tipo: "10mwt"; tempoSegundos: number; distanciaMetros: number; velocidade: number; }
export interface DGIResult { tipo: "dgi"; itens: { nome: string; valor: number }[]; total: number; }
export interface TDRResult { tipo: "tdr"; observacao?: string; }
export interface MMSEResult { tipo: "mmse"; total: number; orientacaoTemporal?: number; orientacaoEspacial?: number; registro?: number; atencao?: number; evocacao?: number; linguagem?: number; }
export interface MoCAResult { tipo: "moca"; total: number; visuoespacial?: number; nomeacao?: number; atencao?: number; linguagem?: number; abstracao?: number; evocacao?: number; orientacao?: number; }

export type TesteResult = TUGResult | DinamometriaResult | MRCResult | SitToStandResult | TenMWTResult | DGIResult | TDRResult | MMSEResult | MoCAResult;

export interface AvaliacaoTeste {
  id: string;
  data: string;
  doutor: string;
  testes: TesteResult[];
}

export interface ProximaSessao {
  data: string;
  hora: string;
  label: string;
}

export interface Paciente {
  /** Unique patient identifier. */
  id: string;
  /** Full patient name. */
  nome: string;
  /** Two-letter initials for {@link Avatar}. */
  initials: string;
  /** Patient age in years. */
  idade: number;
  /** Biological sex label. */
  sexo: string;
  /** Current care status: `"Ativo"`, `"Avaliação"`, or `"Alta"`. */
  status: string;
  /** Primary diagnosis or condition description. */
  condicao: string;
  /** Number of sessions completed so far. */
  sessoes: number;
  /** Total sessions planned in the treatment protocol. */
  totalSessoes: number;
  /** Overall adherence percentage (0–100). */
  adesao: number;
  /** Adherence change vs previous period (positive = improved). */
  adesaoVariacao: number;
  /** Date string of the most recent visit. */
  ultimaVisita: string;
  /** Current pain level on the EVA scale (0–10). */
  dorEVA: number;
  /** Initial EVA score recorded at intake. */
  dorInicio: number;
  /** Expected discharge date string. */
  previsaoAlta: string;
  /** Upcoming session details, or `null` if none scheduled. */
  proximaSessao: ProximaSessao | null;
  /** Most recent clinical evolution note, or `null` if none exists. */
  ultimaEvolucao: Evolucao | null;
  /** Per-day adherence markers for the current week. */
  adesaoSemanal: AdesaoDia[];
  /** Active treatment plan, or `null` if none assigned. */
  planoTratamento: PlanoTratamento | null;
  /** Clinical assessment history (optional — may be absent on older records). */
  avaliacoes?: AvaliacaoTeste[];
  /** Session registration history (optional — may be absent on older records). */
  registrosSessoes?: RegistroSessao[];
}

export interface AgendaSemanal {
  id: string;
  dia: string;
  diaNum: number;
  hora: string;
  paciente: string;
  tipo: string;
  cor: string;
}

export interface MockData {
  doctor: Doctor;
  stats: Stats;
  agendaHoje: AgendaItem[];
  alertas: Alerta[];
  pacientes: Paciente[];
  agendaSemanal: AgendaSemanal[];
}

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  data: string;
}

export interface LibraryExercicio {
  id: string;
  nome: string;
  categoria: string;
  duracao: string;
  temVideo: boolean;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
}
