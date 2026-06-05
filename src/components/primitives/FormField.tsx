import type { ReactNode } from "react";
import "./form.css";

export interface FormFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Error message; presence also flags the group with `.has-error`. */
  error?: string | null;
  hint?: ReactNode;
  /** Span both columns inside a 2-column FormSection. */
  colSpan?: 1 | 2;
  children: ReactNode;
}

/**
 * Wraps a label + control + hint/error. Owns the `.has-error` class that
 * `scrollToFirstError` (src/utils/scrollToError.ts) queries.
 * Replaces .form-group / .cadex-group + label + error patterns.
 */
export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  colSpan = 1,
  children,
}: FormFieldProps) {
  const cls = [
    "ds-field-group",
    colSpan === 2 && "ds-field-group--col-2",
    error && "has-error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      {label && (
        <label className="ds-field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ds-field-req" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="ds-field-hint">{hint}</span>}
      {error && <span className="ds-field-error">{error}</span>}
    </div>
  );
}
