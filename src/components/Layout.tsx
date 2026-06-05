import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import type { Doctor } from "../types";
import "./Layout.css";

interface LayoutProps {
  /** Authenticated clinician profile; forwarded to {@link Sidebar} for identity display. */
  doctor: Doctor;
  /** Total number of active patient alerts — drives the red badge on the Dashboard nav item. */
  alertCount: number;
}

/**
 * Root application shell that renders the navigation {@link Sidebar} alongside
 * the active route's content via React Router's `<Outlet>`.
 *
 * Manages sidebar collapsed/expanded state and the mobile slide-over overlay.
 * The `page-fade` wrapper is keyed on the first three path segments so
 * entrance animations re-trigger on top-level route changes without flashing
 * on patient sub-tab navigation.
 *
 * @param props - {@link LayoutProps}
 * @returns A two-panel `<div>` containing the sidebar and a `<main>` content
 *   area rendered by `<Outlet>`.
 *
 * @example
 * // Registered as a parent route element in App.tsx:
 * <Route element={<Layout doctor={doctor} alertCount={alertCount} />}>
 *   <Route index element={<Dashboard />} />
 * </Route>
 */
export default function Layout({ doctor, alertCount }: LayoutProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sidebar on navigation. Adjusting state during render
  // (guarded by a path change) is React's recommended alternative to calling
  // setState synchronously inside an effect.
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const handler = () => { if (!mq.matches) setMobileOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className={`layout ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-nav-open" : ""}`}>
      <a className="skip-link" href="#main-content">{t("common.skipToContent", "Pular para o conteúdo")}</a>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label={t("common.openMenu")}
        aria-expanded={mobileOpen}
        aria-controls="primary-sidebar"
      >
        <Menu size={22} aria-hidden="true" />
      </button>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <Sidebar doctor={doctor} alertCount={alertCount} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="main-content" id="main-content">
        <div className="page-fade" key={location.pathname.split("/").slice(0, 3).join("/")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
