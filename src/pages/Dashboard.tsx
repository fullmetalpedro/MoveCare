import { useState, useEffect } from "react";
import { Users, TrendingUp, DollarSign, HeartPulse, Bell, ChevronRight } from "lucide-react";
import type { Stats, AgendaItem } from "../types";
import "./Dashboard.css";

interface DashboardProps {
  stats: Stats;
  agendaHoje: AgendaItem[];
  doctorName: string;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmado: "#34C759",
    avaliacao: "#007AFF",
    livre: "#C7C7CC",
  };
  return <span className="status-dot" style={{ background: colors[status] || "#C7C7CC" }} />;
}

function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="skel" style={{ height: 32, width: 220, marginBottom: 8 }} />
          <div className="skel" style={{ height: 16, width: 300 }} />
        </div>
        <div className="skel" style={{ width: 40, height: 40, borderRadius: "50%" }} />
      </div>
      <div className="stats-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="skel" style={{ height: 14, width: 100 }} />
              <div className="skel" style={{ height: 28, width: 28, borderRadius: 8 }} />
            </div>
            <div className="skel" style={{ height: 36, width: 80, marginBottom: 8 }} />
            <div className="skel" style={{ height: 13, width: 140 }} />
          </div>
        ))}
      </div>
      <div className="card agenda-card">
        <div className="card-header">
          <div className="skel" style={{ height: 20, width: 140 }} />
          <div className="skel" style={{ height: 14, width: 90 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 0" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
              <div className="skel" style={{ height: 14, width: 44 }} />
              <div className="skel" style={{ height: 8, width: 8, borderRadius: "50%", flexShrink: 0 }} />
              <div className="skel" style={{ height: 14, width: 120 }} />
              <div className="skel" style={{ height: 12, width: 80, marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ stats, agendaHoje, doctorName }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const firstName = doctorName.split(" ").slice(1).join(" ");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <DashboardSkeleton />;

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

      <div className="card agenda-card">
        <div className="card-header">
          <h2>Agenda de Hoje</h2>
          <a href="/agenda" className="card-link">Ver completa <ChevronRight size={14} /></a>
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
    </div>
  );
}
