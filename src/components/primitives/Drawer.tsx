import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import "./overlay.css";

export interface DrawerProps {
  /** Controls visibility; `false` unmounts the portal entirely. */
  open: boolean;
  /** Called when the user closes via Escape key, the × button, or backdrop click. */
  onClose: () => void;
  /** Optional title rendered in the drawer header. */
  title?: ReactNode;
  children: ReactNode;
  /** Which edge the panel slides in from. @default "right" */
  side?: "right" | "left";
  /** Panel width as a pixel number or CSS length string. @default 380 */
  width?: number | string;
}

/**
 * Side-sliding panel rendered into `document.body` via a portal.
 *
 * Locks `overflow: hidden` on `<body>` while open and focuses the panel on
 * mount. Dismisses on Escape key and backdrop click.
 *
 * @param props - {@link DrawerProps}
 * @returns A portal containing the overlay and the sliding panel `<div>`, or `null` when closed.
 *
 * @example
 * <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
 *   <FilterPanel />
 * </Drawer>
 */
export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  width = 380,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`ds-overlay ds-overlay--${side}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`ds-drawer ds-drawer--${side}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <header className="ds-modal__header">
          {title && <h2 className="ds-modal__title">{title}</h2>}
          <button className="ds-modal__close" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className="ds-drawer__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
