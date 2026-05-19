import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { Paciente } from "../types";
import "./Pacientes.css";

interface PacientesProps {
  pacientes: Paciente[];
}

type FilterType = "Todos" | "Ativos" | "Avaliação" | "Alta";

function AdesaoBar({ value }: { value: number }) {
  let color = "#34C759";
  if (value < 50) color = "#E04F5F";
  else if (value < 70) color = "#E8973A";
  return (
    <div className="adesao-cell">
      <div className="adesao-bar-bg">
        <div className="adesao-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="adesao-value">{value}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "Ativo" ? "badge-ativo" : status === "Avaliação" ? "badge-avaliacao" : "badge-alta";
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

export default function Pacientes({ pacientes }: PacientesProps) {
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const updateSlider = useCallback(() => {
    if (!tabsRef.current) return;
    const active = tabsRef.current.querySelector(".filter-tab.active") as HTMLElement | null;
    if (active) {
      const parentRect = tabsRef.current.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setSlider({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, []);

  useEffect(() => { updateSlider(); }, [filter, updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  const filtered = pacientes.filter(p => {
    if (filter !== "Todos" && p.status !== (filter === "Ativos" ? "Ativo" : filter)) return false;
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pacientes-page">
      <PageHeader title="Pacientes" backTo="/">
        <button className="btn-novo-paciente" onClick={() => navigate("/pacientes/novo")}><Plus size={16} /> Novo Paciente</button>
      </PageHeader>

      <div className="pacientes-filters">
        <div className="search-box">
          <span className="search-icon"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="slide-tabs" ref={tabsRef}>
          <div className="slide-indicator" style={{ left: slider.left, width: slider.width }} />
          {(["Todos", "Ativos", "Avaliação", "Alta"] as FilterType[]).map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="pacientes-table" key={filter}>
        <div className="table-header">
          <span className="col-paciente">PACIENTE</span>
          <span className="col-idade">IDADE</span>
          <span className="col-status">STATUS</span>
          <span className="col-sessoes">SESSÕES</span>
          <span className="col-adesao">ADESÃO</span>
          <span className="col-ultima">ÚLTIMA</span>
          <span className="col-action" />
        </div>
        <div className="fade-list">
        {filtered.map(p => (
          <div key={p.id} className="table-row" onClick={() => navigate(`/pacientes/${p.id}`)}>
            <span className="col-paciente">
                  <img
                className="pac-avatar"
                src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(p.nome)}`}
                alt={p.initials}
              />
              <span className="pac-nome">{p.nome}</span>
            </span>
            <span className="col-idade">{p.idade}</span>
            <span className="col-status"><StatusBadge status={p.status} /></span>
            <span className="col-sessoes">{p.sessoes}</span>
            <span className="col-adesao"><AdesaoBar value={p.adesao} /></span>
            <span className="col-ultima">{p.ultimaVisita}</span>
            <span className="col-action"><ChevronRight size={16} /></span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
