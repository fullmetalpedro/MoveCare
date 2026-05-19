import { useRef, useEffect, useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, Calendar, Users, BookOpen, FileText, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Doctor } from "../types";
import "./Sidebar.css";

interface SidebarProps {
  doctor: Doctor;
  alertCount: number;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ doctor, alertCount, collapsed, onToggle }: SidebarProps) {
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

  useEffect(() => { updateSlider(); }, [location.pathname, collapsed, updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <span className="logo-icon"><Heart size={22} /></span>
        {!collapsed && (
          <div>
            <div className="logo-title">MoveCare</div>
            <div className="logo-subtitle">FISIOTERAPIA</div>
          </div>
        )}
      </div>

      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? "Expandir menu" : "Recolher menu"}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      <nav className="sidebar-nav" ref={navRef}>
        <div
          className="nav-slider"
          style={{
            top: slider.top,
            height: slider.height,
            opacity: ready ? 1 : 0,
          }}
        />
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Dashboard">
          <span className="nav-icon"><LayoutDashboard size={18} /></span>
          {!collapsed && <span>Dashboard</span>}
          {!collapsed && alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
          {collapsed && alertCount > 0 && <span className="nav-badge-dot" />}
        </NavLink>
        <NavLink to="/agenda" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Agenda">
          <span className="nav-icon"><Calendar size={18} /></span>
          {!collapsed && <span>Agenda</span>}
        </NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Pacientes">
          <span className="nav-icon"><Users size={18} /></span>
          {!collapsed && <span>Pacientes</span>}
        </NavLink>
        <NavLink to="/biblioteca" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Biblioteca">
          <span className="nav-icon"><BookOpen size={18} /></span>
          {!collapsed && <span>Biblioteca</span>}
        </NavLink>
        <NavLink to="/documentos" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title="Documentos">
          <span className="nav-icon"><FileText size={18} /></span>
          {!collapsed && <span>Documentos</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="doctor-avatar">{doctor.initials}</div>
        {!collapsed && (
          <div className="doctor-info">
            <div className="doctor-name">{doctor.name}</div>
            <div className="doctor-role">{doctor.role} · {doctor.crefito}</div>
          </div>
        )}
        {!collapsed && <span className="settings-icon"><Settings size={16} /></span>}
      </div>
    </aside>
  );
}
