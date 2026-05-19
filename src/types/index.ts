export interface Doctor {
  id: string;
  name: string;
  initials: string;
  role: string;
  crefito: string;
}

export interface Stats {
  pacientesHoje: number;
  pacientesHojeDetalhe: string;
  adesaoGeral: number;
  adesaoVariacao: number;
  receitaMes: string;
  receitaDetalhe: string;
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
  id: string;
  nome: string;
  initials: string;
  idade: number;
  sexo: string;
  status: string;
  condicao: string;
  sessoes: number;
  totalSessoes: number;
  adesao: number;
  adesaoVariacao: number;
  ultimaVisita: string;
  dorEVA: number;
  dorInicio: number;
  previsaoAlta: string;
  proximaSessao: ProximaSessao | null;
  ultimaEvolucao: Evolucao | null;
  adesaoSemanal: AdesaoDia[];
  planoTratamento: PlanoTratamento | null;
  avaliacoes?: AvaliacaoTeste[];
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
