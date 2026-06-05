import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import "./SearchInput.css";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Fixed width (px or CSS length). Omit to fill the container. */
  width?: number | string;
}

/** Search box with a leading icon. Replaces .search-box / .bib-search-box / .mag-search. */
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
