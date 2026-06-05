import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./Tabs.css";

export interface TabItem {
  /** Unique string identifier matched against the `value` prop. */
  value: string;
  /** Display content for the tab button. */
  label: ReactNode;
}

export interface TabsProps {
  /** Array of tab descriptors. */
  items: TabItem[];
  /** Currently active tab value. */
  value: string;
  /** Called with the new value when the user clicks a tab. */
  onChange: (value: string) => void;
  /**
   * Indicator style. `"slide"` renders an animated pill behind the active tab;
   * `"flat"` uses font weight and color only. @default "slide"
   */
  variant?: "slide" | "flat";
  /** When `true`, each tab stretches equally to fill the container. @default false */
  fullWidth?: boolean;
}

/**
 * Segmented control with an animated active-tab indicator.
 *
 * The sliding pill is positioned with `useLayoutEffect` to avoid a visible
 * jump on first render. Window resize events trigger a re-measurement so the
 * indicator stays aligned at any viewport width.
 *
 * @param props - {@link TabsProps}
 * @returns A `<div role="tablist">` containing one `<button role="tab">` per item.
 *
 * @example
 * <Tabs
 *   value={filtro}
 *   onChange={setFiltro}
 *   items={CATEGORIAS.map(cat => ({ value: cat, label: cat }))}
 * />
 */
export default function Tabs({
  items,
  value,
  onChange,
  variant = "slide",
  fullWidth = false,
}: TabsProps) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const activeIndex = items.findIndex((i) => i.value === value);

  const measure = useCallback(() => {
    const el = btnRefs.current[activeIndex];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeIndex]);

  useLayoutEffect(measure, [measure, items.length, fullWidth]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      className={[
        "ds-tabs",
        `ds-tabs--${variant}`,
        fullWidth && "ds-tabs--full",
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
    >
      {variant === "slide" && (
        <span
          className="ds-tabs__indicator"
          style={{ left: indicator.left, width: indicator.width }}
          aria-hidden="true"
        />
      )}
      {items.map((item, i) => (
        <button
          key={item.value}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          className={`ds-tab ${item.value === value ? "is-active" : ""}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
