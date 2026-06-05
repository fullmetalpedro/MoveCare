import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronLeft, TrendingUp, CalendarDays, Heart, Clock, ClipboardList, Stethoscope, BarChart3, FolderOpen, ClipboardPlus } from "lucide-react";
import type { Paciente } from "../types";
import Avatar from "../components/Avatar";
import { Badge } from "../components/primitives";
import type { BadgeTone } from "../components/primitives";
import "./PacienteDetail.css";

interface PacienteDetailProps {
  /** Full patient list used to look up the active patient by the `:id` URL param. */
  pacientes: Paciente[];
}

/**
 * Patient detail layout shell that provides the patient context to all nested
 * sub-pages via `<Outlet context={paciente}>`.
 *
 * Resolves the active patient from `pacientes` using the `:id` URL parameter
 * and redirects to `/pacientes` if none is found. Sub-pages (`PacienteResumo`,
 * `PlanoTratamento`, `Evolucao`, `NovaAvaliacao`, `PacienteDocumentos`) access
 * the patient via `useOutletContext<Paciente>()` — no further prop-drilling needed.
 *
 * @param props - {@link PacienteDetailProps}
 * @returns The patient detail layout `<div>` with a header, contextual nav
 *   tabs, and the `<Outlet>` rendering the active sub-page.
 *
 * @example
 * // Mounted at /pacientes/:id in App.tsx — child routes render via Outlet:
 * <PacienteDetail pacientes={pacientes} />
 */
const STATUS_TONE: Record<string, BadgeTone> = {
  Ativo: "success",
  Avaliação: "warning",
  Alta: "neutral",
};

export default function PacienteDetail({ pacientes }: PacienteDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [slider, setSlider] = useState({ top: 0, left: 0, width: 0, height: 0, visible: false, nova: false });

  const updateSlider = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector(".ctx-link.active") as HTMLElement | null;
    if (!active) {
      setSlider(s => ({ ...s, visible: false }));
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    setSlider({
      top: rect.top - navRect.top,
      left: rect.left - navRect.left,
      width: rect.width,
      height: rect.height,
      visible: true,
      // "Nova avaliação" uses a white highlight instead of the blue tint.
      nova: active.classList.contains("ctx-link-nova"),
    });
  }, []);

  useEffect(() => { updateSlider(); }, [location.pathname, updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return <div className="not-found">Paciente não encontrado</div>;
  }

  return (
    <div className="paciente-detail">
      <div className="detail-top-card">
        <div className="detail-info">
          <button className="back-btn" onClick={() => navigate("/pacientes")}>
            <ChevronLeft size={20} />
          </button>
          <Avatar
            className="detail-avatar"
            name={paciente.nome}
            initials={paciente.initials}
            size={56}
          />
          <div>
            <h1 className="detail-name">{paciente.nome}</h1>
            <p className="detail-meta">
              {paciente.idade} anos · {paciente.sexo} · {paciente.condicao}
            </p>
            <div className="detail-badges">
              <Badge tone={STATUS_TONE[paciente.status] ?? "neutral"}>{paciente.status}</Badge>
              <span className="session-badge">Sessão #{paciente.sessoes} de {paciente.totalSessoes}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-stats">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Adesão</span>
            <span className="stat-icon stat-icon-green"><TrendingUp size={18} /></span>
          </div>
          <div className="stat-value">{paciente.adesao}%</div>
          <div className={`stat-detail ${paciente.adesaoVariacao >= 0 ? "positive" : "negative"}`}>
            {paciente.adesaoVariacao >= 0 ? "↑" : "↓"} {Math.abs(paciente.adesaoVariacao)}% vs mês anterior
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Sessões</span>
            <span className="stat-icon stat-icon-green"><CalendarDays size={18} /></span>
          </div>
          <div className="stat-value">{paciente.sessoes}/{paciente.totalSessoes}</div>
          <div className="stat-detail">Previsão alta: {paciente.previsaoAlta}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Dor (EVA)</span>
            <span className="stat-icon stat-icon-green"><Heart size={18} /></span>
          </div>
          <div className="stat-value">{paciente.dorEVA}/10</div>
          <div className="stat-detail">Início: {paciente.dorInicio}/10</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Próxima Sessão</span>
            <span className="stat-icon stat-icon-green"><Clock size={18} /></span>
          </div>
          <div className="stat-value">{paciente.proximaSessao?.data ?? "—"}</div>
          <div className="stat-detail">
            {paciente.proximaSessao ? `${paciente.proximaSessao.hora} — ${paciente.proximaSessao.label}` : "Sem sessão agendada"}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <nav className="detail-sidebar-nav" ref={navRef}>
          <span
            className={`ctx-slider${slider.nova ? " nova" : ""}`}
            style={{
              top: slider.top,
              left: slider.left,
              width: slider.width,
              height: slider.height,
              opacity: slider.visible ? 1 : 0,
            }}
          />
          <NavLink to={`/pacientes/${id}`} end className={({ isActive }) => `ctx-link ${isActive ? "active" : ""}`}>
            <ClipboardList size={16} /> Resumo
          </NavLink>
          <NavLink to={`/pacientes/${id}/plano`} className={({ isActive }) => `ctx-link ${isActive ? "active" : ""}`}>
            <Stethoscope size={16} /> Plano de Trat.
          </NavLink>
          <NavLink to={`/pacientes/${id}/evolucao`} className={({ isActive }) => `ctx-link ${isActive ? "active" : ""}`}>
            <BarChart3 size={16} /> Evolução
          </NavLink>
          <NavLink to={`/pacientes/${id}/documentos`} className={({ isActive }) => `ctx-link ${isActive ? "active" : ""}`}>
            <FolderOpen size={16} /> Documentos
          </NavLink>
          <NavLink to={`/pacientes/${id}/avaliacao/nova`} className={({ isActive }) => `ctx-link ctx-link-nova ${isActive ? "active" : ""}`}>
            <ClipboardPlus size={16} /> Nova avaliação
          </NavLink>
        </nav>

        <div className="detail-main">
          <div key={location.pathname} className="detail-outlet-wrap">
            <Suspense fallback={<div className="route-fallback"><span className="route-spinner" /></div>}>
              <Outlet context={paciente} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
