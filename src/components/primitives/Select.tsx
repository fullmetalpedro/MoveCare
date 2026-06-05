import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import "./field.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  children?: ReactNode;
}

/** Native select with a custom chevron. New standardized dropdown. */
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
