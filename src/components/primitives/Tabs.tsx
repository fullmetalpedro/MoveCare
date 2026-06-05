import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./Tabs.css";

export interface TabItem {
  value: string;
  label: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  /** "slide" = sliding pill indicator (default); "flat" = underline/weight only. */
  variant?: "slide" | "flat";
  fullWidth?: boolean;
}

/**
 * Segmented control. Encapsulates the sliding-indicator logic that was
 * reimplemented in Biblioteca / Pacientes / Agenda (measure offsetLeft/Width
 * of the active tab in a layout effect + on resize).
 * Replaces .slide-tabs/.slide-indicator/.filter-tab, .view-btn, .fase-tab.
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
