import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import "./field.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** When `true`, applies the error ring style and sets `aria-invalid`. @default false */
  error?: boolean;
  children?: ReactNode;
}

/**
 * Native `<select>` styled with a custom dropdown chevron.
 *
 * Forwards a ref to the underlying `<select>`. Spreads all native
 * `SelectHTMLAttributes`, so `value`, `onChange`, `disabled`, etc. work directly.
 *
 * @param props - {@link SelectProps}
 * @param ref - Forwarded ref to the underlying `<select>` element.
 * @returns A `<select>` element with consistent input styling.
 *
 * @example
 * <Select value={form.categoria} onChange={e => setField("categoria", e.target.value)}>
 *   <option value="Fortalecimento">Fortalecimento</option>
 *   <option value="Mobilidade">Mobilidade</option>
 * </Select>
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { error = false, className, children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={["ds-input", "ds-input--select", error && "is-error", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={error || undefined}
      {...rest}
    >
      {children}
    </select>
  );
});

export default Select;
