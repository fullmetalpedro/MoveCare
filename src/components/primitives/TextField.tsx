import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./field.css";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leadingIcon?: ReactNode;
}

/** Single-line text input. Replaces .form-input / .cadex-input / .nav-input. */
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
