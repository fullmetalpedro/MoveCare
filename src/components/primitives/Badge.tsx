import type { HTMLAttributes, ReactNode, CSSProperties } from "react";
import "./Badge.css";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Arbitrary brand color (e.g. exercise category). Overrides `tone`. */
  color?: string;
  children?: ReactNode;
}

/**
 * Non-interactive status pill. Replaces nivel-badge, session-badge,
 * sessoes-count, ex-cat-badge, delta-*, tl-chip.
 * Pass `color` for data-driven colors (category palette) — it renders a soft
 * tint background with the color as text, matching the old `${color}15` trick.
 */
export default function Badge({
  tone = "neutral",
  color,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const cls = ["ds-badge", !color && `ds-badge--${tone}`, className]
    .filter(Boolean)
    .join(" ");

  const customStyle: CSSProperties | undefined = color
    ? { color, background: `${color}1a`, ...style }
    : style;

  return (
    <span className={cls} style={customStyle} {...rest}>
      {children}
    </span>
  );
}
