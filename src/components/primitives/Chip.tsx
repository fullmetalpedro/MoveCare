import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from "react";
import "./Chip.css";

export type ChipTone = "accent" | "success" | "warning" | "danger" | "neutral";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: ChipTone;
  size?: "sm" | "md";
  /** Arbitrary brand color for the selected state (e.g. exercise category). Overrides `tone`. */
  color?: string;
  children?: ReactNode;
}

/** Interactive selectable pill. Replaces cadex-chip, cadex-cat-btn, cadex-nivel-btn, select-chip. */
export default function Chip({
  selected = false,
  tone = "accent",
  size = "sm",
  color,
  className,
  style,
  children,
  type = "button",
  ...rest
}: ChipProps) {
  const cls = [
    "ds-chip",
    !color && `ds-chip--${tone}`,
    `ds-chip--${size}`,
    selected && "is-selected",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const customStyle: CSSProperties | undefined =
    color && selected ? { background: `${color}1f`, borderColor: color, color, ...style } : style;

  return (
    <button className={cls} type={type} aria-pressed={selected} style={customStyle} {...rest}>
      {children}
    </button>
  );
}
