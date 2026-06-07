import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Users, HeartPulse, Bell, ChevronRight } from "lucide-react";
import NotificationsDrawer from "../components/NotificationsDrawer";
import { useDashboard, usePacientes } from "../hooks";
import "./Dashboard.css";

/**
 * Landing page showing a stats overview, today's agenda, and recent patients.
 *
 * Sources its data via live IndexedDB queries ({@link useDashboard} and
 * {@link usePacientes}). Renders a loading skeleton while those queries resolve
 * and for a brief settle delay, preventing content from flashing in before
 * styles settle.
 *
 * @returns The dashboard layout `<div>` with stats grid, agenda, and patient shortcuts.
 *
 * @example
 * // Mounted at the root index route in App.tsx:
 * <Dashboard />
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

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const overview = useDashboard();
  const pacientes = usePacientes();
  const [settled, setSettled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!settled || !overview || !pacientes) return <DashboardSkeleton />;

  const { stats, agendaHoje, doctor } = overview;
  const firstName = doctor ? doctor.name.split(" ").slice(1).join(" ") : "";
  const idByNome = new Map(pacientes.map((p) => [p.nome, p.id]));

  // Real current date, localized (e.g. "Terça-feira, 28 de abril"), capitalized.
  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const dataHoje = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <div className="dashboard content-appear">
      <div className="dashboard-header">
        <div>
          <h1>{t("dashboard.greeting", { name: firstName })}</h1>
          <p className="header-subtitle">{t("dashboard.headerSubtitle", { date: dataHoje, count: stats.pacientesHoje })}</p>
        </div>
        <button className="notification-btn" onClick={() => setNotifOpen(true)} aria-label={t("dashboard.notifications")}>
          <Bell size={18} aria-hidden="true" />
        </button>
      </div>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      <div className="stats-grid">
        <Link to="/agenda?view=dia" className="stat-card clickable">
          <div className="stat-card-header">
            <span className="stat-label">{t("dashboard.stats.pacientesHoje")}</span>
            <span className="stat-icon stat-icon-green"><Users size={18} aria-hidden="true" /></span>
          </div>
          <div className="stat-value">{stats.pacientesHoje}</div>
          <div className="stat-detail">{stats.pacientesHojeDetalhe}</div>
        </Link>
        <Link to="/pacientes?filter=Ativos" className="stat-card clickable">
          <div className="stat-card-header">
            <span className="stat-label">{t("dashboard.stats.pacientesAtivos")}</span>
            <span className="stat-icon stat-icon-green"><HeartPulse size={18} aria-hidden="true" /></span>
          </div>
          <div className="stat-value">{stats.pacientesAtivos}</div>
          <div className="stat-detail positive">{stats.pacientesEmAvaliacao} {t("dashboard.stats.emAvaliacao")}</div>
        </Link>
        <div className="stat-card stat-card-centered">
          <span className="stat-label">{t("dashboard.stats.adesaoGeral")}</span>
          <div className="stat-value stat-value-lg">{stats.adesaoGeral}%</div>
          <div className={`stat-detail ${stats.adesaoVariacao < 0 ? "negative" : "positive"}`}>
            {stats.adesaoVariacao < 0 ? "↓" : "↑"} {Math.abs(stats.adesaoVariacao)}{t("dashboard.stats.vsWeekPrior")}
          </div>
        </div>
      </div>

      <div className="card agenda-card">
        <div className="card-header">
          <h2>{t("dashboard.agenda.title")}</h2>
          <Link to="/agenda" className="card-link" aria-label={t("dashboard.agenda.viewFullAriaLabel")}>
            {t("dashboard.agenda.viewFull")} <ChevronRight size={14} aria-hidden="true" />
          </Link>
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
                {item.paciente && <span className="agenda-arrow"><ChevronRight size={16} aria-hidden="true" /></span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
