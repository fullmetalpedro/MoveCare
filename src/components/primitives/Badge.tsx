import type { HTMLAttributes, ReactNode, CSSProperties } from "react";
import "./Badge.css";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic color tone. Ignored when `color` is provided. @default "neutral" */
  tone?: BadgeTone;
  /** Arbitrary hex/CSS color (e.g. an exercise category color). Overrides `tone` and renders a soft tint background. */
  color?: string;
  children?: ReactNode;
}

/**
 * Non-interactive status pill for labelling entities with a status, level, or category.
 *
 * Pass a semantic `tone` for standard status colors, or an arbitrary `color` hex
 * string for data-driven palettes such as exercise categories. When `color` is
 * set it renders a `${color}1a` tint background with `color` as the text.
 *
 * @param props - {@link BadgeProps}
 * @returns A `<span>` styled as a small pill.
 *
 * @example
 * <Badge tone="success">Ativo</Badge>
 * <Badge color="#AF52DE">Mobilidade</Badge>
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
