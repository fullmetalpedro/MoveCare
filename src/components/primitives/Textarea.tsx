import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import "./field.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/** Multi-line text input. Replaces .form-textarea / .cadex-textarea. */
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
