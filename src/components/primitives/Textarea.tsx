import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import "./field.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** When `true`, applies the error ring style and sets `aria-invalid`. @default false */
  error?: boolean;
}

/**
 * Multi-line text input with optional error state.
 *
 * Forwards a ref to the underlying `<textarea>`. Spreads all native
 * `TextareaHTMLAttributes`, so `rows`, `placeholder`, `onChange`, etc.
 * work directly.
 *
 * @param props - {@link TextareaProps}
 * @param ref - Forwarded ref to the underlying `<textarea>` element.
 * @returns A `<textarea>` styled to match {@link TextField}.
 *
 * @example
 * <Textarea
 *   id="observacoes"
 *   placeholder="Observações iniciais..."
 *   rows={4}
 *   value={form.observacoes}
 *   onChange={e => setField("observacoes", e.target.value)}
 * />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error = false, className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={["ds-input", "ds-input--textarea", error && "is-error", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={error || undefined}
      {...rest}
    />
  );
});

export default Textarea;
