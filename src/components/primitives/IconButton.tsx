import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./IconButton.css";

export type IconButtonVariant = "subtle" | "outline" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible text label (required) — applied as both `aria-label` and `title`. */
  label: string;
  /** The icon element to render, e.g. `<X size={18} />`. */
  icon: ReactNode;
  /** Visual style variant. @default "subtle" */
  variant?: IconButtonVariant;
  /** Size preset. @default "md" */
  size?: IconButtonSize;
  /** Shape of the button background. @default "square" */
  shape?: "square" | "circle";
}

/**
 * Icon-only button with a mandatory accessible label.
 *
 * The `label` prop is required and is applied as both `aria-label` and
 * `title`, ensuring the button is accessible and shows a tooltip on hover.
 * Spreads all native `ButtonHTMLAttributes`.
 *
 * @param props - {@link IconButtonProps}
 * @returns A `<button>` containing only the icon, with `aria-label` set.
 *
 * @example
 * <IconButton
 *   label="Fechar"
 *   icon={<X size={18} />}
 *   variant="ghost"
 *   onClick={handleClose}
 * />
 */
export default function IconButton({
  label,
  icon,
  variant = "subtle",
  size = "md",
  shape = "square",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const cls = [
    "ds-iconbtn",
    `ds-iconbtn--${variant}`,
    `ds-iconbtn--${size}`,
    `ds-iconbtn--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} type={type} aria-label={label} title={label} {...rest}>
      {icon}
    </button>
  );
}
