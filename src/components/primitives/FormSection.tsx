import type { ReactNode } from "react";
import "./form.css";

export interface FormSectionProps {
  /** Section heading text or element. */
  title?: ReactNode;
  /** Icon rendered in the colored badge next to the title. */
  icon?: ReactNode;
  /** Overrides the icon badge color (defaults to the accent CSS token). */
  iconColor?: string;
  /** Number of columns in the internal field grid. @default 2 */
  columns?: 1 | 2;
  children: ReactNode;
}

/**
 * Styled `<section>` with an icon-badge header and a 1- or 2-column field grid.
 * Groups related {@link FormField} elements into a visually distinct block.
 *
 * @param props - {@link FormSectionProps}
 * @returns A `<section>` with an optional icon+title header above a field grid.
 *
 * @example
 * <FormSection title="Dados Pessoais" icon={<User size={16} />}>
 *   <FormField label="Nome" required htmlFor="nome">
 *     <TextField id="nome" value={form.nome} onChange={...} />
 *   </FormField>
 * </FormSection>
 */
export default function FormSection({
  title,
  icon,
  iconColor,
  columns = 2,
  children,
}: FormSectionProps) {
  return (
    <section className="ds-form-section">
      {(title || icon) && (
        <header className="ds-form-section__header">
          {icon && (
            <span
              className="ds-form-section__icon"
              style={iconColor ? { background: `${iconColor}1f`, color: iconColor } : undefined}
            >
              {icon}
            </span>
          )}
          {title && <h2 className="ds-form-section__title">{title}</h2>}
        </header>
      )}
      <div className={`ds-form-grid ds-form-grid--cols-${columns}`}>{children}</div>
    </section>
  );
}
