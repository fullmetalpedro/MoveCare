import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, BellOff } from "lucide-react";
import "./NotificationsDrawer.css";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={`drawer-overlay${closing ? " closing" : ""}`} onClick={handleClose}>
      <aside
        className={`drawer-panel${closing ? " closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Notificações"
      >
        <div className="drawer-header">
          <h2 className="drawer-title">Notificações</h2>
          <button className="drawer-close" onClick={handleClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-empty">
          <div className="drawer-empty-icon">
            <BellOff size={28} />
          </div>
          <h3 className="drawer-empty-title">Tudo em dia!</h3>
          <p className="drawer-empty-text">
            Você não tem notificações no momento. Novos alertas aparecerão aqui.
          </p>
        </div>
      </aside>
    </div>,
    document.body
  );
}
