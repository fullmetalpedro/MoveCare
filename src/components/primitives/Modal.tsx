import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import "./overlay.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnOverlayClick?: boolean;
}

/**
 * Centered dialog. Portal + Escape-to-close + scroll-lock + initial focus.
 * Consolidates the per-page modal/overlay implementations.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="ds-overlay ds-overlay--center"
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`ds-modal ds-modal--${size}`}
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
        <div className="ds-modal__body">{children}</div>
        {footer && <footer className="ds-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
