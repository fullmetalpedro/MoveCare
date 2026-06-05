import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, LayoutDashboard, Calendar, Users, BookOpen, FileText, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Doctor } from "../types";
import Avatar from "./Avatar";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Sidebar.css";

interface SidebarProps {
  /** Clinician profile data rendered in the bottom footer. */
  doctor: Doctor;
  /** Number of active alerts; shows a badge on the Dashboard link when greater than 0. */
  alertCount: number;
  /** Whether the sidebar is in narrow (icon-only) collapsed mode. */
  collapsed: boolean;
  /** Called when the user clicks the expand/collapse toggle button. */
  onToggle: () => void;
}

/**
 * Primary navigation sidebar with an animated active-item highlight slider.
 *
 * The sliding indicator is repositioned with `useLayoutEffect` so it sits
 * behind the active `<NavLink>` before the browser paints — preventing a
 * visible jump on the first render. Resize events and route changes both
 * trigger a re-measurement.
 *
 * @param props - {@link SidebarProps}
 * @returns An `<aside>` element containing the branding logo, navigation
 *   links, and the clinician footer row.
 *
 * @example
 * <Sidebar
 *   doctor={doctor}
 *   alertCount={3}
 *   collapsed={false}
 *   onToggle={() => setCollapsed(c => !c)}
 * />
 */
export default function Sidebar({ doctor, alertCount, collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const [slider, setSlider] = useState({ top: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const updateSlider = useCallback(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector(".nav-item.active") as HTMLElement | null;
    if (active) {
      const parentRect = navRef.current.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setSlider({ top: rect.top - parentRect.top, height: rect.height });
      if (!ready) setReady(true);
    }
  }, [ready]);

  // Layout effect (not effect) so the slider is repositioned before the browser
  // paints — otherwise the active item highlights a frame before the slide starts.
  useLayoutEffect(() => { updateSlider(); }, [location.pathname, collapsed, updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} id="primary-sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon"><Heart size={22} aria-hidden="true" /></span>
        <div className="logo-text">
          <div className="logo-title">MoveCare</div>
          <div className="logo-subtitle">{t("nav.brandSubtitle")}</div>
        </div>
      </div>

      <nav className="sidebar-nav" ref={navRef} aria-label={t("nav.dashboard")}>
        <div
          className="nav-slider"
          style={{
            top: slider.top,
            height: slider.height,
            opacity: ready ? 1 : 0,
          }}
          aria-hidden="true"
        />
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title={t("nav.dashboard")}>
          <span className="nav-icon"><LayoutDashboard size={18} aria-hidden="true" /></span>
          <span className="nav-label">{t("nav.dashboard")}</span>
          {alertCount > 0 && <span className="nav-badge" aria-label={t("nav.alertsLabel", { count: alertCount })}>{alertCount}</span>}
          {alertCount > 0 && <span className="nav-badge-dot" aria-hidden="true" />}
        </NavLink>
        <NavLink to="/agenda" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title={t("nav.agenda")}>
          <span className="nav-icon"><Calendar size={18} aria-hidden="true" /></span>
          <span className="nav-label">{t("nav.agenda")}</span>
        </NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title={t("nav.patients")}>
          <span className="nav-icon"><Users size={18} aria-hidden="true" /></span>
          <span className="nav-label">{t("nav.patients")}</span>
        </NavLink>
        <NavLink to="/biblioteca" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title={t("nav.library")}>
          <span className="nav-icon"><BookOpen size={18} aria-hidden="true" /></span>
          <span className="nav-label">{t("nav.library")}</span>
        </NavLink>
        <NavLink to="/documentos" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title={t("nav.documents")}>
          <span className="nav-icon"><FileText size={18} aria-hidden="true" /></span>
          <span className="nav-label">{t("nav.documents")}</span>
        </NavLink>
      </nav>

      <div className="sidebar-lang">
        <LanguageSwitcher />
      </div>

      <div className="sidebar-footer">
        <Avatar className="doctor-avatar" name={doctor.name} initials={doctor.initials} size={34} />
        <div className="doctor-info">
          <div className="doctor-name">{doctor.name}</div>
          <div className="doctor-role">{doctor.role} · {doctor.crefito}</div>
        </div>
        <span className="settings-icon" aria-hidden="true"><Settings size={16} /></span>
      </div>

      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={collapsed ? t("nav.expand") : t("nav.collapse")}
        aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
        aria-expanded={!collapsed}
      >
        {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
      </button>
    </aside>
  );
}
