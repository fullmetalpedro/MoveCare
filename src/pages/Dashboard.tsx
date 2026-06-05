import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, HeartPulse, Bell, ChevronRight } from "lucide-react";
import NotificationsDrawer from "../components/NotificationsDrawer";
import type { Stats, AgendaItem, Paciente } from "../types";
import "./Dashboard.css";

interface DashboardProps {
  /** High-level practice statistics for the current period. */
  stats: Stats;
  /** Today's schedule entries shown in the agenda section. */
  agendaHoje: AgendaItem[];
  /** Clinician's first name used in the "Bom dia, ..." greeting. */
  doctorName: string;
  /** Full patient list used to populate the recent-patients section. */
  pacientes: Paciente[];
}

/**
 * Landing page showing a stats overview, today's agenda, and recent patients.
 *
 * Receives all data as props from `App.tsx` (sourced via `dashboardService` and
 * `patientService`). Renders a loading skeleton for 800 ms on mount to simulate
 * an async fetch and prevent content from flashing in before styles settle.
 *
 * @param props - {@link DashboardProps}
 * @returns The dashboard layout `<div>` with stats grid, agenda, and patient shortcuts.
 *
 * @example
 * // Mounted at the root index route in App.tsx:
 * <Dashboard stats={overview.stats} agendaHoje={overview.agendaHoje}
 *   doctorName={doctor.name} pacientes={pacientes} />
 */

/**
 * Colored indicator dot mapping an appointment status string to a brand color.
 *
 * @param props.status - One of `"confirmado"`, `"avaliacao"`, or `"livre"`.
 * @returns A `<span>` styled as a small filled circle.
 */
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmado: "#34C759",
    avaliacao: "#007AFF",
    livre: "#C7C7CC",
  };
  return <span className="status-dot" style={{ background: colors[status] || "#C7C7CC" }} />;
}

/**
 * Placeholder skeleton layout shown while the dashboard data loads.
 *
 * @returns A `<div>` mimicking the dashboard layout with shimmer blocks.
 */
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

export default function Dashboard({ stats, agendaHoje, doctorName, pacientes }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const firstName = doctorName.split(" ").slice(1).join(" ");
  const idByNome = new Map(pacientes.map((p) => [p.nome, p.id]));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="dashboard content-appear">
      <div className="dashboard-header">
        <div>
          <h1>Bom dia, {firstName}</h1>
          <p className="header-subtitle">Terça-feira, 29 de Abril · {stats.pacientesHoje} pacientes hoje</p>
        </div>
        <button className="notification-btn" onClick={() => setNotifOpen(true)} aria-label="Notificações"><Bell size={18} /></button>
      </div>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      <div className="stats-grid">
        <Link to="/agenda?view=dia" className="stat-card clickable">
          <div className="stat-card-header">
            <span className="stat-label">Pacientes Hoje</span>
            <span className="stat-icon stat-icon-green"><Users size={18} /></span>
          </div>
          <div className="stat-value">{stats.pacientesHoje}</div>
          <div className="stat-detail">{stats.pacientesHojeDetalhe}</div>
        </Link>
        <Link to="/pacientes?filter=Ativos" className="stat-card clickable">
          <div className="stat-card-header">
            <span className="stat-label">Pacientes Ativos</span>
            <span className="stat-icon stat-icon-green"><HeartPulse size={18} /></span>
          </div>
          <div className="stat-value">{stats.pacientesAtivos}</div>
          <div className="stat-detail positive">{stats.pacientesEmAvaliacao} em avaliação</div>
        </Link>
        <div className="stat-card stat-card-centered">
          <span className="stat-label">Adesão Geral</span>
          <div className="stat-value stat-value-lg">{stats.adesaoGeral}%</div>
          <div className={`stat-detail ${stats.adesaoVariacao < 0 ? "negative" : "positive"}`}>
            {stats.adesaoVariacao < 0 ? "↓" : "↑"} {Math.abs(stats.adesaoVariacao)}% vs semana anterior
          </div>
        </div>
        <div className="stat-card stat-card-centered">
          <span className="stat-label">Receita do Mês</span>
          <div className="stat-value stat-value-lg">{stats.receitaMes}</div>
          <div className="stat-detail">{stats.receitaDetalhe}</div>
        </div>
      </div>

      <div className="card agenda-card">
        <div className="card-header">
          <h2>Agenda de Hoje</h2>
          <Link to="/agenda" className="card-link">Ver completa <ChevronRight size={14} /></Link>
        </div>
        <div className="agenda-list">
          {agendaHoje.map((item, i) => {
            const pid = item.paciente ? idByNome.get(item.paciente) : undefined;
            return (
              <div
                key={i}
                className={`agenda-row ${item.status === "livre" ? "livre" : ""} ${pid ? "clickable" : ""}`}
                onClick={pid ? () => navigate(`/pacientes/${pid}`) : undefined}
              >
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
