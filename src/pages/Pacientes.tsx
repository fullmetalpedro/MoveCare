import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, ChevronRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import { Button, SearchInput, Tabs, Badge } from "../components/primitives";
import type { BadgeTone } from "../components/primitives";
import type { Paciente } from "../types";
import { filterPatients } from "../lib/patient";
import "./Pacientes.css";

interface PacientesProps {
  /** Full patient list to display; filtering is applied client-side via {@link filterPatients}. */
  pacientes: Paciente[];
}

/**
 * Patient list page with status tab filtering and free-text search.
 *
 * Filtering is performed client-side by {@link filterPatients} from
 * `src/lib/patient.ts`. The active filter can be pre-set via the `?filter=`
 * query parameter (used by Dashboard shortcuts).
 *
 * @param props - {@link PacientesProps}
 * @returns The patients page `<div>` with a search bar, tab filters, and a
 *   sortable table of patient rows.
 *
 * @example
 * // Mounted at /pacientes in App.tsx:
 * <Pacientes pacientes={pacientes} />
 */

type FilterType = "Todos" | "Ativos" | "Avaliação" | "Alta";

/**
 * Horizontal progress bar visualizing a patient's overall adherence percentage.
 *
 * @param props.value - Adherence as a number 0–100.
 * @returns A bar + numeric label colored green/amber/red by threshold.
 */
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

/**
 * {@link Badge} wrapper that maps a patient status string to a semantic tone
 * and displays a translated label.
 *
 * @param props.status - One of `"Ativo"`, `"Avaliação"`, or `"Alta"`.
 * @returns A `<Badge>` with the appropriate tone applied.
 */
function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const label = t(`pacientes.statusLabels.${status}`, { defaultValue: status });
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{label}</Badge>;
}

const FILTERS: FilterType[] = ["Todos", "Ativos", "Avaliação", "Alta"];

export default function Pacientes({ pacientes }: PacientesProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const paramFilter = searchParams.get("filter") as FilterType | null;
  const initialFilter: FilterType =
    paramFilter && FILTERS.includes(paramFilter) ? paramFilter : "Todos";
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = filterPatients(pacientes, filter, search);

  const filterItems = FILTERS.map(f => ({
    value: f,
    label: t(`pacientes.filters.${f}`),
  }));

  return (
    <div className="pacientes-page">
      <PageHeader title={t("pacientes.pageTitle")} backTo="/">
        <Button
          variant="primary"
          className="ds-btn--lift"
          iconLeft={<Plus size={16} aria-hidden="true" />}
          onClick={() => navigate("/pacientes/novo")}
        >
          {t("pacientes.newPatient")}
        </Button>
      </PageHeader>

      <div className="pacientes-filters">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("pacientes.searchPlaceholder")}
          width={220}
          aria-label={t("common.search")}
        />
        <Tabs
          value={filter}
          onChange={v => setFilter(v as FilterType)}
          items={filterItems}
        />
      </div>

      <div
        className="pacientes-table"
        key={filter}
        role="table"
        aria-label={t("pacientes.pageTitle")}
      >
        <div className="table-header" role="row">
          <span className="col-paciente" role="columnheader" aria-sort="none">
            {t("pacientes.columns.patient")}
          </span>
          <span className="col-idade" role="columnheader">
            {t("pacientes.columns.age")}
          </span>
          <span className="col-status" role="columnheader">
            {t("pacientes.columns.status")}
          </span>
          <span className="col-sessoes" role="columnheader">
            {t("pacientes.columns.sessions")}
          </span>
          <span className="col-adesao" role="columnheader">
            {t("pacientes.columns.adherence")}
          </span>
          <span className="col-ultima" role="columnheader">
            {t("pacientes.columns.lastVisit")}
          </span>
          <span className="col-action" role="columnheader" aria-hidden="true" />
        </div>
        <div className="fade-list" role="rowgroup">
          {filtered.map(p => (
            <div
              key={p.id}
              className="table-row"
              role="row"
              tabIndex={0}
              aria-label={t("pacientes.rowAriaLabel", { name: p.nome })}
              onClick={() => navigate(`/pacientes/${p.id}`)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/pacientes/${p.id}`);
                }
              }}
            >
              <span className="col-paciente" role="cell">
                <Avatar className="pac-avatar" name={p.nome} initials={p.initials} size={34} />
                <span className="pac-nome">{p.nome}</span>
              </span>
              <span className="col-idade" role="cell">{p.idade}</span>
              <span className="col-status" role="cell"><StatusBadge status={p.status} /></span>
              <span className="col-sessoes" role="cell">{p.sessoes}</span>
              <span className="col-adesao" role="cell"><AdesaoBar value={p.adesao} /></span>
              <span className="col-ultima" role="cell">{p.ultimaVisita}</span>
              <span className="col-action" role="cell" aria-hidden="true">
                <ChevronRight size={16} aria-hidden="true" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
