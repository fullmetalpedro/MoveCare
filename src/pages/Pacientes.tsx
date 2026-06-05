import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import { Button, SearchInput, Tabs, Badge } from "../components/primitives";
import type { BadgeTone } from "../components/primitives";
import type { Paciente } from "../types";
import "./Pacientes.css";

interface PacientesProps {
  pacientes: Paciente[];
}

type FilterType = "Todos" | "Ativos" | "Avaliação" | "Alta";

function AdesaoBar({ value }: { value: number }) {
  let color = "var(--success)";
  if (value < 50) color = "var(--danger)";
  else if (value < 70) color = "var(--warning)";
  return (
    <div className="adesao-cell">
      <div className="adesao-bar-bg">
        <div className="adesao-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="adesao-value">{value}%</span>
    </div>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Ativo: "success",
  Avaliação: "warning",
  Alta: "neutral",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status}</Badge>;
}

const FILTERS: FilterType[] = ["Todos", "Ativos", "Avaliação", "Alta"];

export default function Pacientes({ pacientes }: PacientesProps) {
  const [searchParams] = useSearchParams();
  const paramFilter = searchParams.get("filter") as FilterType | null;
  const initialFilter: FilterType =
    paramFilter && FILTERS.includes(paramFilter) ? paramFilter : "Todos";
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = pacientes.filter(p => {
    if (filter !== "Todos" && p.status !== (filter === "Ativos" ? "Ativo" : filter)) return false;
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pacientes-page">
      <PageHeader title="Pacientes" backTo="/">
        <Button variant="primary" iconLeft={<Plus size={16} />} onClick={() => navigate("/pacientes/novo")}>
          Novo Paciente
        </Button>
      </PageHeader>

      <div className="pacientes-filters">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          width={220}
        />
        <Tabs
          value={filter}
          onChange={v => setFilter(v as FilterType)}
          items={FILTERS.map(f => ({ value: f, label: f }))}
        />
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
              <Avatar className="pac-avatar" name={p.nome} initials={p.initials} size={34} />
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
