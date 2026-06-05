import type { ReactNode } from "react";
import "./form.css";

export interface FormFieldProps {
  /** Label content — can include icons or plain text. */
  label?: ReactNode;
  /** `id` of the associated control, used as the `<label htmlFor>` target. */
  htmlFor?: string;
  /** When `true`, renders a required asterisk after the label. @default false */
  required?: boolean;
  /** Error message; its presence also adds `.has-error` which `scrollToFirstError` queries. */
  error?: string | null;
  /** Hint text rendered below the control when no error is present. */
  hint?: ReactNode;
  /** Column span inside a 2-column {@link FormSection} grid. @default 1 */
  colSpan?: 1 | 2;
  children: ReactNode;
}

/**
 * Wraps a label, form control, and hint/error message in a consistent layout.
 *
 * Applies the `.has-error` CSS class when `error` is set, which is the anchor
 * that `scrollToFirstError` (`src/utils/scrollToError.ts`) uses to scroll the
 * viewport to the first invalid field on form submission.
 *
 * @param props - {@link FormFieldProps}
 * @returns A `<div>` containing the optional label, control slot, and hint/error.
 *
 * @example
 * <FormField label="Nome completo" required htmlFor="nome" error={errors.nome}>
 *   <TextField id="nome" value={form.nome} onChange={...} error={!!errors.nome} />
 * </FormField>
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
