import { useParams, useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { MessageSquare, FileText, ChevronLeft, TrendingUp, CalendarDays, Heart, Clock, ClipboardList, Stethoscope, BarChart3, FolderOpen, ClipboardPlus } from "lucide-react";
import type { Paciente } from "../types";
import "./PacienteDetail.css";

interface PacienteDetailProps {
  pacientes: Paciente[];
}

export default function PacienteDetail({ pacientes }: PacienteDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
          <img
            className="detail-avatar"
            src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(paciente.nome)}`}
            alt={paciente.initials}
          />
          <div>
            <h1 className="detail-name">{paciente.nome}</h1>
            <p className="detail-meta">
              {paciente.idade} anos · {paciente.sexo} · {paciente.condicao}
            </p>
            <div className="detail-badges">
              <span className={`status-badge ${paciente.status === "Ativo" ? "badge-ativo" : paciente.status === "Avaliação" ? "badge-avaliacao" : "badge-alta"}`}>
                {paciente.status}
              </span>
              <span className="session-badge">Sessão #{paciente.sessoes} de {paciente.totalSessoes}</span>
            </div>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn-outline"><MessageSquare size={14} /> Mensagem</button>
          <button className="btn-outline"><FileText size={14} /> Documentos</button>
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
        <nav className="detail-sidebar-nav">
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
            <Outlet context={paciente} />
          </div>
        </div>
      </div>
    </div>
  );
}
