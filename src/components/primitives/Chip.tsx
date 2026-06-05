import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from "react";
import "./Chip.css";

export type ChipTone = "accent" | "success" | "warning" | "danger" | "neutral";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this chip is in the selected/active state. @default false */
  selected?: boolean;
  /** Semantic color tone for the selected state. @default "accent" */
  tone?: ChipTone;
  /** Size preset. @default "sm" */
  size?: "sm" | "md";
  /** Arbitrary hex/CSS color for the selected state (overrides `tone`). */
  color?: string;
  children?: ReactNode;
}

/**
 * Interactive selectable pill used for filter groups and category or level pickers.
 *
 * Renders as a `<button>` with `aria-pressed` so screen readers announce the
 * selected state. Pass `color` for data-driven selection colors (e.g. exercise
 * categories).
 *
 * @param props - {@link ChipProps}
 * @returns A `<button>` styled as a chip, reflecting the `selected` state.
 *
 * @example
 * // Status filter group:
 * {["Todos", "Ativos", "Alta"].map(f => (
 *   <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
 * ))}
 *
 * @example
 * // Category picker with a custom color:
 * <Chip color="#E04F5F" selected={cat === "Fortalecimento"} onClick={...}>
 *   Fortalecimento
 * </Chip>
 */
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
