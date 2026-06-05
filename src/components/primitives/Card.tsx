import type { HTMLAttributes, ElementType, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** HTML element to render as. @default "div" */
  as?: ElementType;
  /** Inner padding preset. @default "md" */
  padding?: "none" | "sm" | "md" | "lg";
  /** Border-radius preset. @default "md" */
  radius?: "md" | "lg";
  /** Adds the hover-lift shadow used by clickable cards (stat cards, library cards). @default false */
  interactive?: boolean;
  children?: ReactNode;
}

/**
 * Standard surface container — the foundational building block for stat cards,
 * detail panels, library cards, and section boxes.
 *
 * Renders as any HTML element via `as` (useful for `<section>`, `<article>`,
 * etc.) and forwards all native HTML attributes.
 *
 * @param props - {@link CardProps}
 * @returns The element specified by `as` (default `<div>`) styled as a card.
 *
 * @example
 * <Card padding="lg" interactive onClick={() => navigate(`/pacientes/${id}`)}>
 *   <h2>{paciente.nome}</h2>
 * </Card>
 */
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
