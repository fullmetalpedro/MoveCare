import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import "./overlay.css";

export interface ModalProps {
  /** Controls visibility; `false` unmounts the portal entirely. */
  open: boolean;
  /** Called when the user closes via Escape key, the × button, or overlay click. */
  onClose: () => void;
  /** Optional title rendered in the modal header. */
  title?: ReactNode;
  children: ReactNode;
  /** Optional content rendered in the modal footer. */
  footer?: ReactNode;
  /** Width preset. @default "md" */
  size?: "sm" | "md" | "lg";
  /** When `true`, clicking the backdrop calls `onClose`. @default true */
  closeOnOverlayClick?: boolean;
}

/**
 * Centered dialog rendered into `document.body` via a portal.
 *
 * Locks `overflow: hidden` on `<body>` while open and releases it on close.
 * Focuses the dialog container on mount so keyboard navigation starts inside
 * the modal. Dismisses on Escape key and, optionally, backdrop click.
 *
 * @param props - {@link ModalProps}
 * @returns A portal containing the overlay and dialog `<div>`, or `null` when closed.
 *
 * @example
 * <Modal
 *   open={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   title="Confirmar exclusão"
 *   footer={<Button variant="danger" onClick={handleDelete}>Excluir</Button>}
 * >
 *   Tem certeza que deseja excluir este registro?
 * </Modal>
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
