import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus, ChevronLeft, Trash2, Search, Loader2, X,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import NotificationsDrawer from "../components/NotificationsDrawer";
import "./DesignSystem.css";

// ── helpers ──────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="ds-section">
      <p className="ds-section-label">{label}</p>
      {children}
    </section>
  );
}

function Token({ name, value, bg }: { name: string; value: string; bg?: string }) {
  return (
    <div className="ds-token">
      <div
        className="ds-token-swatch"
        style={{
          background: bg ?? value,
          border: value === "#FFFFFF" || value === "var(--card-bg)" ? "1px solid var(--border)" : undefined,
        }}
      />
      <span className="ds-token-name">{name}</span>
    </div>
  );
}

// ── Underline tabs (like PacienteDetail) ─────────────────────────────────────

function UnderlineTabs() {
  const items = ["Fase 1", "Fase 2", "Fase 3"];
  const [active, setActive] = useState(0);
  return (
    <div className="ds-underline-tabs">
      {items.map((t, i) => (
        <button
          key={t}
          className={`ds-underline-tab${active === i ? " active" : ""}`}
          onClick={() => setActive(i)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Slide tabs (global .slide-tabs) ──────────────────────────────────────────

function SlideTabs() {
  const items = ["Mês", "Semana", "Dia"];
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const updateSlider = useCallback(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector(".filter-tab.active") as HTMLElement | null;
    if (activeEl) {
      const parentRect = tabsRef.current.getBoundingClientRect();
      const rect = activeEl.getBoundingClientRect();
      setSlider({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, []);

  useEffect(() => { updateSlider(); }, [active, updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <div className="slide-tabs ds-slide-tabs-fit" ref={tabsRef}>
      <div className="slide-indicator" style={{ left: slider.left, width: slider.width }} />
      {items.map((t, i) => (
        <button
          key={t}
          className={`filter-tab${active === i ? " active" : ""}`}
          onClick={() => setActive(i)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`ds-toggle${checked ? " on" : ""}`}
      onClick={onChange}
    />
  );
}

// ── Modal demo ────────────────────────────────────────────────────────────────

function DemoModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <span className="modal-title">Exemplo de Modal</span>
          <button className="ds-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Conteúdo do modal renderizado via portal no <code>document.body</code>.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="ds-btn-primary" onClick={onClose}>Confirmar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DesignSystem() {
  const [chip, setChip] = useState(0);
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [emailVal, setEmailVal] = useState("invalido@");
  const emailError = emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

  const COLOR_TOKENS = [
    { name: "--accent",          value: "#007AFF" },
    { name: "--accent-light",    value: "#5AC8FA" },
    { name: "--success",         value: "#34C759" },
    { name: "--warning",         value: "#E8973A" },
    { name: "--danger",          value: "#E04F5F" },
    { name: "--whatsapp",        value: "#25D366", bg: "#25D366" },
    { name: "--bg",              value: "var(--bg)",      bg: "#F5F5F7" },
    { name: "--card-bg",         value: "#FFFFFF" },
    { name: "--text-primary",    value: "#1D1D1F" },
    { name: "--text-secondary",  value: "#6E6E73" },
    { name: "--text-muted",      value: "#86868B" },
    { name: "--border",          value: "#E8E8ED" },
  ];

  const CHIPS = ["Opção A", "Opção B", "Opção C", "Success", "Warning"];
  const chipColors: Record<number, { border: string; color: string; bg: string } | null> = {
    3: { border: "#34C759", color: "#34C759", bg: "rgba(52,199,89,0.08)" },
    4: { border: "#E8973A", color: "#E8973A", bg: "rgba(232,151,58,0.08)" },
  };

  return (
    <div className="ds-page">
      <PageHeader
        title="MoveCare Design System"
        subtitle="Living reference for tokens & primitives. Compose these — don't write new component CSS."
      />

      {/* COLOR TOKENS */}
      <Section label="COLOR TOKENS">
        <div className="ds-tokens-grid">
          {COLOR_TOKENS.map(t => (
            <Token key={t.name} name={t.name} value={t.value} bg={t.bg} />
          ))}
        </div>
      </Section>

      {/* BUTTON — VARIANTS */}
      <Section label="BUTTON — VARIANTS">
        <div className="ds-row ds-row-wrap">
          <button className="ds-btn-primary">Primary</button>
          <button className="ds-btn-secondary">Secondary</button>
          <button className="ds-btn-ghost">Ghost</button>
          <button className="ds-btn-danger">Danger</button>
          <button className="ds-btn-primary" disabled>Disabled</button>
          <button className="ds-btn-primary ds-btn-loading" disabled>
            <Loader2 size={14} className="ds-spin" /> Loading
          </button>
        </div>
      </Section>

      {/* BUTTON — SIZES & ICONS */}
      <Section label="BUTTON — SIZES & ICONS">
        <div className="ds-row ds-row-wrap">
          <button className="ds-btn-primary ds-btn-sm">Small</button>
          <button className="ds-btn-primary">Medium</button>
          <button className="ds-btn-primary ds-btn-lg">Large</button>
          <button className="ds-btn-primary"><Plus size={14} /> With icon</button>
        </div>
      </Section>

      {/* ICONBUTTON */}
      <Section label="ICONBUTTON">
        <div className="ds-row">
          <button className="ds-icon-btn"><ChevronLeft size={16} /></button>
          <button className="ds-icon-btn"><Plus size={16} /></button>
          <button className="ds-icon-btn ds-icon-btn-danger"><Trash2 size={16} /></button>
        </div>
      </Section>

      {/* CARD */}
      <Section label="CARD">
        <div className="ds-row ds-row-wrap">
          <div className="ds-card">Static card</div>
          <div className="ds-card ds-card-interactive">Interactive (hover)</div>
          <div className="ds-card ds-card-lg">Large radius / padding</div>
        </div>
      </Section>

      {/* BADGE */}
      <Section label="BADGE">
        <div className="ds-row ds-row-wrap">
          <span className="ds-badge ds-badge-neutral">Neutral</span>
          <span className="ds-badge ds-badge-accent">Accent</span>
          <span className="status-badge badge-ativo">Ativo</span>
          <span className="status-badge badge-avaliacao">Avaliação</span>
          <span className="status-badge badge-alta">Alta</span>
          <span className="ds-badge ds-badge-cat" style={{ background: "rgba(175,82,222,0.12)", color: "#AF52DE" }}>Mobilidade</span>
        </div>
      </Section>

      {/* CHIP (SELECTABLE) */}
      <Section label="CHIP (SELECTABLE)">
        <div className="ds-row ds-row-wrap">
          {CHIPS.map((c, i) => {
            const isActive = chip === i;
            const custom = chipColors[i];
            return (
              <button
                key={c}
                className={`select-chip${isActive ? " active" : ""} ${isActive && !custom ? "chip-ativo" : ""}`}
                style={isActive && custom ? {
                  background: custom.bg,
                  borderColor: custom.border,
                  color: custom.color,
                  fontWeight: 600,
                } : undefined}
                onClick={() => setChip(i)}
              >
                {c}
              </button>
            );
          })}
        </div>
      </Section>

      {/* TABS */}
      <Section label="TABS">
        <div className="ds-col">
          <SlideTabs />
          <UnderlineTabs />
        </div>
      </Section>

      {/* TOGGLE */}
      <Section label="TOGGLE">
        <div className="ds-col">
          <Toggle checked={toggle1} onChange={() => setToggle1(v => !v)} />

          <div className="ds-toggle-row">
            <div>
              <div className="ds-toggle-label">Exercício em casa</div>
              <div className="ds-toggle-sublabel">Disponível no app do paciente</div>
            </div>
            <Toggle checked={toggle2} onChange={() => setToggle2(v => !v)} />
          </div>
        </div>
      </Section>

      {/* SEARCHINPUT */}
      <Section label="SEARCHINPUT">
        <div className="search-box" style={{ width: 220 }}>
          <span className="search-icon"><Search size={14} /></span>
          <input type="text" placeholder="Buscar..." />
        </div>
      </Section>

      {/* FORM PRIMITIVES */}
      <Section label="FORM PRIMITIVES">
        <div className="form-section" style={{ maxWidth: 600 }}>
          <div className="section-header">
            <span className="section-icon" style={{ fontSize: 15 }}>📅</span>
            <h2 className="section-title">Dados do paciente</h2>
          </div>
          <div className="form-grid">
            <div className="form-group col-2">
              <label className="form-label">Nome <span className="required">*</span></label>
              <input className="form-input" type="text" placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label className="form-label">Condição</label>
              <select className="form-input">
                <option>Selecione</option>
                <option>Lombalgia</option>
                <option>Tendinite</option>
              </select>
            </div>
            <div className={`form-group${emailError ? " has-error" : ""}`}>
              <label className="form-label">E-mail</label>
              <input
                className="form-input"
                type="email"
                placeholder="email@exemplo.com"
                value={emailVal}
                onChange={e => setEmailVal(e.target.value)}
              />
              {emailError && <span className="form-error">E-mail inválido</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" type="tel" placeholder="(00) 00000-0000" />
              <span className="ds-input-hint">Com DDD</span>
            </div>
            <div className="form-group col-2">
              <label className="form-label">Observações</label>
              <textarea className="form-input form-textarea" placeholder="Notas..." rows={3} />
            </div>
          </div>
        </div>
      </Section>

      {/* OVERLAYS */}
      <Section label="OVERLAYS">
        <div className="ds-row">
          <button className="ds-btn-primary" onClick={() => setShowModal(true)}>Open Modal</button>
          <button className="ds-btn-secondary" onClick={() => setShowDrawer(true)}>Open Drawer</button>
        </div>
      </Section>

      {showModal && <DemoModal onClose={() => setShowModal(false)} />}
      <NotificationsDrawer open={showDrawer} onClose={() => setShowDrawer(false)} />
    </div>
  );
}
