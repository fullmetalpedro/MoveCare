import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Dumbbell, StretchHorizontal, Activity, Footprints, HeartPulse, Wind } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Button, SearchInput, Tabs, Badge } from "../components/primitives";
import { exerciseService } from "../services";
import type { LibraryExercicio } from "../types";
import "./Biblioteca.css";

const CATEGORIAS = ["Todos", "Fortalecimento", "Estabilização", "Flexibilidade", "Mobilidade", "Funcional", "Relaxamento"];

const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  Fortalecimento: <Dumbbell size={28} />,
  Estabilização: <Activity size={28} />,
  Flexibilidade: <StretchHorizontal size={28} />,
  Mobilidade: <Footprints size={28} />,
  Funcional: <HeartPulse size={28} />,
  Relaxamento: <Wind size={28} />,
};

const CATEGORIA_COLORS: Record<string, string> = {
  Fortalecimento: "#E04F5F",
  Estabilização: "#007AFF",
  Flexibilidade: "#E8973A",
  Mobilidade: "#AF52DE",
  Funcional: "#34C759",
  Relaxamento: "#5AC8FA",
};

const EXERCICIOS = exerciseService.getLibrary();

/**
 * {@link Badge} that maps an exercise difficulty level to a brand color.
 *
 * @param props.nivel - One of `"Iniciante"`, `"Intermediário"`, or `"Avançado"`.
 * @returns A colored `<Badge>` with the level label.
 */
function NivelBadge({ nivel }: { nivel: string }) {
  const colors: Record<string, string> = {
    Iniciante: "#34C759",
    Intermediário: "#007AFF",
    Avançado: "#AF52DE",
  };
  return <Badge color={colors[nivel] ?? "#86868B"}>{nivel}</Badge>;
}

/**
 * Placeholder skeleton grid shown while the exercise library data loads.
 *
 * @returns A `<div>` with 8 shimmer card placeholders matching the library grid layout.
 */
function BibliotecaSkeleton() {
  return (
    <div className="biblioteca-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bib-card">
          <div className="skel" style={{ height: 100 }} />
          <div style={{ padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="skel" style={{ height: 15, width: "80%" }} />
            <div className="skel" style={{ height: 12, width: "60%" }} />
          </div>
          <div style={{ padding: "8px 16px 14px" }}>
            <div className="skel" style={{ height: 20, width: 80, borderRadius: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Exercise library page showing the full exercise catalogue with category tab
 * filtering and free-text search.
 *
 * Data is sourced from {@link exerciseService.getLibrary}. Renders a skeleton
 * grid for 800 ms on mount before fading in the content.
 * Mounted at `/biblioteca`.
 *
 * @returns The library page `<div>` with a search bar, category tabs, and an
 *   exercise card grid.
 *
 * @example
 * // Rendered at /biblioteca
 */
export default function Biblioteca() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered: LibraryExercicio[] = EXERCICIOS.filter(ex => {
    if (filtro !== "Todos" && ex.categoria !== filtro) return false;
    if (search && !ex.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="biblioteca-page">
      <PageHeader title="Biblioteca de Exercícios" backTo="/">
        <Button variant="primary" className="ds-btn--lift" iconLeft={<Plus size={16} />} onClick={() => navigate("/biblioteca/novo")}>
          Novo Exercício
        </Button>
      </PageHeader>

      <div className="biblioteca-filters">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar exercício..."
          width={220}
        />
        <Tabs
          value={filtro}
          onChange={setFiltro}
          items={CATEGORIAS.map(cat => ({ value: cat, label: cat }))}
        />
      </div>

      {loading ? <BibliotecaSkeleton /> : (
      <div className="biblioteca-grid fade-list" key={filtro}>
        {filtered.map(ex => {
          const color = CATEGORIA_COLORS[ex.categoria] ?? "#86868B";
          const icon = CATEGORIA_ICONS[ex.categoria] ?? <Dumbbell size={28} />;

          return (
            <div key={ex.id} className="bib-card">
              <div className="bib-thumb" style={{ background: `${color}10` }}>
                <span style={{ color }}>{icon}</span>
                {ex.temVideo && (
                  <span className="bib-play" style={{ background: color }}>
                    <Play size={12} fill="#fff" color="#fff" />
                  </span>
                )}
              </div>
              <div className="bib-info">
                <span className="bib-nome">{ex.nome}</span>
                <span className="bib-meta">
                  <span className="bib-cat-dot" style={{ background: color }} />
                  {ex.categoria} · {ex.duracao}
                </span>
              </div>
              <div className="bib-footer">
                <NivelBadge nivel={ex.nivel} />
              </div>
            </div>
          );
        })}

        <div className="add-doc-zone" onClick={() => navigate("/biblioteca/novo")} style={{ cursor: "pointer" }}>
          <Plus size={24} />
          <span>Clique para adicionar um novo exercício à biblioteca</span>
        </div>
      </div>
      )}
    </div>
  );
}
