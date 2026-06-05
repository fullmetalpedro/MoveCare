import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * The one button. Replaces the ~20 bespoke `.btn-*` classes.
 * Compose with `variant` + `size` rather than writing new button CSS.
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
