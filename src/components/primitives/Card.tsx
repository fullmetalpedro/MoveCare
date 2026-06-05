import type { HTMLAttributes, ElementType, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "md" | "lg";
  /** Adds the hover lift used by clickable cards (stat cards, library cards). */
  interactive?: boolean;
  children?: ReactNode;
}

/** Standard surface. Base for stat/detail/library/section cards. */
export default function Card({
  as: Tag = "div",
  padding = "md",
  radius = "md",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const cls = [
    "ds-card",
    `ds-card--pad-${padding}`,
    `ds-card--radius-${radius}`,
    interactive && "ds-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
