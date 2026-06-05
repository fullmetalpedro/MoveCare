import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, BellOff } from "lucide-react";
import "./NotificationsDrawer.css";

interface NotificationsDrawerProps {
  /** Whether the drawer is currently visible; `false` unmounts the portal entirely. */
  open: boolean;
  /** Invoked after the closing CSS transition (~220 ms) completes. */
  onClose: () => void;
}

/**
 * Slide-in notifications panel rendered into `document.body` via a portal.
 *
 * Handles its own close animation: the overlay/panel fade-out runs for ~220 ms
 * before `onClose` is called, so the parent should not forcibly unmount before
 * that. Dismisses on Escape key press and backdrop click.
 *
 * @param props - {@link NotificationsDrawerProps}
 * @returns A portal containing the drawer overlay and slide-in panel, or
 *   `null` when `open` is `false`.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <NotificationsDrawer open={open} onClose={() => setOpen(false)} />
 */
export default function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const { t } = useTranslation();
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  if (!open) return null;

  return createPortal(
    <div className={`drawer-overlay${closing ? " closing" : ""}`} onClick={handleClose}>
      <aside
        className={`drawer-panel${closing ? " closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("notifications.drawer.ariaLabel")}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">{t("notifications.drawer.title")}</h2>
          <button className="drawer-close" onClick={handleClose} aria-label={t("common.close")}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="drawer-empty">
          <div className="drawer-empty-icon">
            <BellOff size={28} aria-hidden="true" />
          </div>
          <h3 className="drawer-empty-title">{t("notifications.drawer.emptyTitle")}</h3>
          <p className="drawer-empty-text">{t("notifications.drawer.emptyText")}</p>
        </div>
      </aside>
    </div>,
    document.body
  );
}
