import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./IconButton.css";

export type IconButtonVariant = "subtle" | "outline" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label (required — icon-only buttons need a name). */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: "square" | "circle";
}

/** Icon-only button. Replaces `.back-btn`, `.wa-close-btn`, `.rep-btn`, nav arrows. */
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
