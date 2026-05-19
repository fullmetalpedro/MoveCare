import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Search, Dumbbell, StretchHorizontal, Activity, Footprints, HeartPulse, Wind } from "lucide-react";
import PageHeader from "../components/PageHeader";
import "./Biblioteca.css";

interface Exercicio {
  id: string;
  nome: string;
  categoria: string;
  duracao: string;
  temVideo: boolean;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
}

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
  Fortalecimento: "#FF3B30",
  Estabilização: "#007AFF",
  Flexibilidade: "#FF9500",
  Mobilidade: "#AF52DE",
  Funcional: "#34C759",
  Relaxamento: "#5AC8FA",
};

const MOCK_EXERCICIOS: Exercicio[] = [
  { id: "ex1", nome: "Agachamento Livre", categoria: "Fortalecimento", duracao: "3x12 rep", temVideo: true, nivel: "Intermediário" },
  { id: "ex2", nome: "Prancha Isométrica", categoria: "Estabilização", duracao: "3x30s", temVideo: true, nivel: "Iniciante" },
  { id: "ex3", nome: "Alongamento Isquiotibiais", categoria: "Flexibilidade", duracao: "3x30s", temVideo: true, nivel: "Iniciante" },
  { id: "ex4", nome: "Ponte de Glúteo", categoria: "Fortalecimento", duracao: "3x15 rep", temVideo: true, nivel: "Iniciante" },
  { id: "ex5", nome: "Rotação de Quadril", categoria: "Mobilidade", duracao: "2x15 rep", temVideo: false, nivel: "Iniciante" },
  { id: "ex6", nome: "Leg Press 45°", categoria: "Fortalecimento", duracao: "4x10 rep", temVideo: true, nivel: "Avançado" },
  { id: "ex7", nome: "Bird Dog", categoria: "Estabilização", duracao: "3x10 rep", temVideo: true, nivel: "Iniciante" },
  { id: "ex8", nome: "Caminhada Lateral com Elástico", categoria: "Funcional", duracao: "3x12 rep", temVideo: true, nivel: "Intermediário" },
  { id: "ex9", nome: "Alongamento de Panturrilha", categoria: "Flexibilidade", duracao: "3x30s", temVideo: false, nivel: "Iniciante" },
  { id: "ex10", nome: "Dead Bug", categoria: "Estabilização", duracao: "3x10 rep", temVideo: true, nivel: "Intermediário" },
  { id: "ex11", nome: "Step-Up Funcional", categoria: "Funcional", duracao: "3x12 rep", temVideo: true, nivel: "Intermediário" },
  { id: "ex12", nome: "Respiração Diafragmática", categoria: "Relaxamento", duracao: "5 min", temVideo: true, nivel: "Iniciante" },
  { id: "ex13", nome: "Abdução de Quadril", categoria: "Fortalecimento", duracao: "3x15 rep", temVideo: true, nivel: "Iniciante" },
  { id: "ex14", nome: "Mobilização de Tornozelo", categoria: "Mobilidade", duracao: "2x20 rep", temVideo: false, nivel: "Iniciante" },
  { id: "ex15", nome: "Flexão de Ombro com Bastão", categoria: "Flexibilidade", duracao: "3x15 rep", temVideo: true, nivel: "Iniciante" },
];

function NivelBadge({ nivel }: { nivel: string }) {
  const colors: Record<string, string> = {
    Iniciante: "#34C759",
    Intermediário: "#FF9500",
    Avançado: "#FF3B30",
  };
  const c = colors[nivel] ?? "#86868B";
  return <span className="nivel-badge" style={{ background: `${c}15`, color: c }}>{nivel}</span>;
}

export default function Biblioteca() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("Todos");
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    updateSlider();
  }, [filtro, updateSlider]);

  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  const filtered = MOCK_EXERCICIOS.filter(ex => {
    if (filtro !== "Todos" && ex.categoria !== filtro) return false;
    if (search && !ex.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="biblioteca-page">
      <PageHeader title="Biblioteca de Exercícios" backTo="/">
        <button className="btn-novo-exercicio" onClick={() => navigate("/biblioteca/novo")}><Plus size={16} /> Novo Exercício</button>
      </PageHeader>

      <div className="biblioteca-filters">
        <div className="bib-search-box">
          <span className="search-icon"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Buscar exercício..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="slide-tabs" ref={tabsRef}>
          <div
            className="slide-indicator"
            style={{ left: slider.left, width: slider.width }}
          />
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              className={`filter-tab ${filtro === cat ? "active" : ""}`}
              onClick={() => setFiltro(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  );
}
