import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import "./SearchInput.css";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Fixed width as a pixel number or CSS length string. Omit to fill the container. */
  width?: number | string;
}

/**
 * Search input with a leading magnifier icon.
 *
 * Forwards a ref to the underlying `<input type="search">`. Spreads all native
 * `InputHTMLAttributes`, so `value`, `onChange`, `placeholder`, etc. work directly.
 *
 * @param props - {@link SearchInputProps}
 * @param ref - Forwarded ref to the underlying `<input>` element.
 * @returns A `<div>` containing the icon and the search input field.
 *
 * @example
 * <SearchInput
 *   value={search}
 *   onChange={e => setSearch(e.target.value)}
 *   placeholder="Buscar paciente..."
 *   width={220}
 * />
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { width, className, style, type = "search", ...rest },
  ref
) {
  return (
    <div
      className={["ds-search", className].filter(Boolean).join(" ")}
      style={width != null ? { width, ...style } : style}
    >
      <Search size={16} className="ds-search__icon" aria-hidden="true" />
      <input ref={ref} className="ds-search__input" type={type} {...rest} />
    </div>
  );
});

export default SearchInput;
