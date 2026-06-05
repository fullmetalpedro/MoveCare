import type { ReactNode } from "react";
import "./Toggle.css";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** When provided, renders a full bordered row with text + switch. */
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/** iOS-style switch. Replaces .cadex-toggle(-row/-knob). */
export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  const track = (
    <span className={`ds-toggle ${checked ? "is-on" : ""}`} aria-hidden="true">
      <span className="ds-toggle__knob" />
    </span>
  );

  const common = {
    type: "button" as const,
    role: "switch" as const,
    "aria-checked": checked,
    disabled,
    onClick: () => onChange(!checked),
  };

  if (label) {
    return (
      <button {...common} className="ds-toggle-row">
        <span className="ds-toggle-row__text">
          <span className="ds-toggle-row__title">{label}</span>
          {description && <span className="ds-toggle-row__sub">{description}</span>}
        </span>
        {track}
      </button>
    );
  }

  return (
    <button {...common} className="ds-toggle-btn" aria-label="Toggle">
      {track}
    </button>
  );
}
