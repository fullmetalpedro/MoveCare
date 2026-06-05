import type { ReactNode } from "react";
import "./form.css";

export interface FormSectionProps {
  title?: ReactNode;
  icon?: ReactNode;
  /** Override the icon badge color (defaults to accent). */
  iconColor?: string;
  /** Number of columns for the field grid (default 2). */
  columns?: 1 | 2;
  children: ReactNode;
}

/**
 * Card section with an icon+title header and a field grid.
 * Replaces .form-section / .cadex-section + .section-header.
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
