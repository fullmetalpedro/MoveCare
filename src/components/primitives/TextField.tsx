import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./field.css";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** When `true`, applies the error ring style and sets `aria-invalid`. @default false */
  error?: boolean;
  /** Icon rendered inside the leading edge of the input. */
  leadingIcon?: ReactNode;
}

/**
 * Single-line text input with optional error state and leading icon.
 *
 * Forwards a ref to the underlying `<input>`, making it compatible with
 * focus management utilities like `scrollToFirstError`. Spreads all native
 * `InputHTMLAttributes`, so `type`, `placeholder`, `onChange`, etc. work directly.
 *
 * @param props - {@link TextFieldProps}
 * @param ref - Forwarded ref to the underlying `<input>` element.
 * @returns A bare `<input>` or, when `leadingIcon` is set, an icon-wrapped `<input>`.
 *
 * @example
 * <TextField
 *   id="nome"
 *   placeholder="Nome completo"
 *   value={form.nome}
 *   error={!!errors.nome}
 *   onChange={e => setField("nome", e.target.value)}
 * />
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { error = false, leadingIcon, className, ...rest },
  ref
) {
  const input = (
    <input
      ref={ref}
      className={["ds-input", error && "is-error", className].filter(Boolean).join(" ")}
      aria-invalid={error || undefined}
      {...rest}
    />
  );

  if (!leadingIcon) return input;

  return (
    <span className="ds-input-wrap">
      <span className="ds-input-wrap__icon">{leadingIcon}</span>
      {input}
    </span>
  );
});

export default TextField;
