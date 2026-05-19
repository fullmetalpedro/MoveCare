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
