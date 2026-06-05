import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant. @default "primary" */
  variant?: ButtonVariant;
  /** Size preset controlling padding and font size. @default "md" */
  size?: ButtonSize;
  /** Icon rendered to the left of the label. */
  iconLeft?: ReactNode;
  /** Icon rendered to the right of the label. */
  iconRight?: ReactNode;
  /** When `true`, replaces content with a spinner and disables the button. @default false */
  loading?: boolean;
  /** When `true`, the button stretches to fill its container's width. @default false */
  fullWidth?: boolean;
}

/**
 * The single button primitive for the entire app.
 *
 * Composes `variant` + `size` instead of writing per-feature button CSS.
 * Spreads all native `<button>` attributes, so `onClick`, `type`, `disabled`,
 * and `aria-*` props all work directly.
 *
 * @param props - {@link ButtonProps}
 * @returns A `<button>` element styled according to `variant` and `size`.
 *
 * @example
 * <Button variant="primary" iconLeft={<Plus size={16} />} onClick={save}>
 *   Salvar Paciente
 * </Button>
 *
 * @example
 * // Loading state (auto-disables the button):
 * <Button variant="primary" loading={isSaving}>Salvar</Button>
 */
export default function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = [
    "ds-btn",
    `ds-btn--${variant}`,
    `ds-btn--${size}`,
    fullWidth && "ds-btn--full",
    loading && "ds-btn--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} type={type} disabled={disabled || loading} {...rest}>
      {loading && <span className="ds-btn__spinner" aria-hidden="true" />}
      {iconLeft && <span className="ds-btn__icon" aria-hidden="true">{iconLeft}</span>}
      {children != null && <span className="ds-btn__label">{children}</span>}
      {iconRight && <span className="ds-btn__icon" aria-hidden="true">{iconRight}</span>}
    </button>
  );
}
