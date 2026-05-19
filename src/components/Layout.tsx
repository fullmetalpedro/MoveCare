import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import type { Doctor } from "../types";
import "./Layout.css";

interface LayoutProps {
  doctor: Doctor;
  alertCount: number;
}

export default function Layout({ doctor, alertCount }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => { if (!mq.matches) setMobileOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className={`layout ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-nav-open" : ""}`}>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <Menu size={22} />
      </button>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <Sidebar doctor={doctor} alertCount={alertCount} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="main-content" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  );
}
