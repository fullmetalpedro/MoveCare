import { Users, TrendingUp, DollarSign, HeartPulse, Bell, AlertTriangle, ChevronRight } from "lucide-react";
import type { Stats, AgendaItem, Alerta } from "../types";
import "./Dashboard.css";

interface DashboardProps {
  stats: Stats;
  agendaHoje: AgendaItem[];
  alertas: Alerta[];
  doctorName: string;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmado: "#34C759",
    avaliacao: "#FF9500",
    livre: "#C7C7CC",
  };
  return <span className="status-dot" style={{ background: colors[status] || "#C7C7CC" }} />;
}

function AlertSeverityColor(sev: string): string {
  switch (sev) {
    case "alta": return "rgba(255, 59, 48, 0.06)";
    case "media": return "rgba(255, 149, 0, 0.06)";
    case "baixa": return "rgba(255, 149, 0, 0.06)";
    default: return "var(--border-light)";
  }
}

export default function Dashboard({ stats, agendaHoje, alertas, doctorName }: DashboardProps) {
  const firstName = doctorName.split(" ").slice(1).join(" ");

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Bom dia, {firstName}</h1>
          <p className="header-subtitle">Terça-feira, 29 de Abril · {stats.pacientesHoje} pacientes hoje</p>
        </div>
        <button className="notification-btn"><Bell size={18} /></button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pacientes Hoje</span>
            <span className="stat-icon stat-icon-green"><Users size={18} /></span>
          </div>
          <div className="stat-value">{stats.pacientesHoje}</div>
          <div className="stat-detail">{stats.pacientesHojeDetalhe}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Adesão Geral</span>
            <span className="stat-icon stat-icon-green"><TrendingUp size={18} /></span>
          </div>
          <div className="stat-value">{stats.adesaoGeral}%</div>
          <div className={`stat-detail ${stats.adesaoVariacao < 0 ? "negative" : "positive"}`}>
            {stats.adesaoVariacao < 0 ? "↓" : "↑"} {Math.abs(stats.adesaoVariacao)}% vs semana anterior
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Receita do Mês</span>
            <span className="stat-icon stat-icon-green"><DollarSign size={18} /></span>
          </div>
          <div className="stat-value">{stats.receitaMes}</div>
          <div className="stat-detail">{stats.receitaDetalhe}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pacientes Ativos</span>
            <span className="stat-icon stat-icon-green"><HeartPulse size={18} /></span>
          </div>
          <div className="stat-value">{stats.pacientesAtivos}</div>
          <div className="stat-detail positive">{stats.pacientesEmAvaliacao} em avaliação</div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="card agenda-card">
          <div className="card-header">
            <h2>Agenda de Hoje</h2>
            <a href="/agenda" className="card-link">Ver completa →</a>
          </div>
          <div className="agenda-list">
            {agendaHoje.map((item, i) => (
              <div key={i} className={`agenda-row ${item.status === "livre" ? "livre" : ""}`}>
                <span className="agenda-hora">{item.hora}</span>
                <StatusDot status={item.status} />
                {item.paciente ? (
                  <>
                    <span className="agenda-paciente">{item.paciente}</span>
                    <span className="agenda-tipo">{item.tipo}</span>
                  </>
                ) : (
                  <span className="agenda-livre">— {item.tipo} —</span>
                )}
                {item.paciente && <span className="agenda-arrow"><ChevronRight size={16} /></span>}
              </div>
            ))}
          </div>
        </div>

        <div className="card alertas-card">
          <div className="card-header">
            <h2>Alertas de Adesão</h2>
            <span className="alertas-count">{alertas.length} alertas</span>
          </div>
          <div className="alertas-list">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="alerta-item"
                style={{ background: AlertSeverityColor(alerta.severidade) }}
              >
                <span className="alerta-icon"><AlertTriangle size={16} /></span>
                <div>
                  <div className="alerta-paciente">{alerta.paciente}</div>
                  <div className="alerta-msg">{alerta.mensagem}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
