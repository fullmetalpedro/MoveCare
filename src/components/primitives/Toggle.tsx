import type { ReactNode } from "react";
import "./Toggle.css";

export interface ToggleProps {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the new `checked` value when the user toggles. */
  onChange: (checked: boolean) => void;
  /** When provided, renders a full-width bordered row with title and optional description. */
  label?: ReactNode;
  /** Secondary descriptive text rendered below `label` in the row variant. */
  description?: ReactNode;
  /** When `true`, the toggle is non-interactive. @default false */
  disabled?: boolean;
}

/**
 * iOS-style switch toggle with two render modes.
 *
 * - **Standalone** (no `label`): renders as a bare switch `<button>`.
 * - **Row** (with `label`): renders a full-width bordered row with the label
 *   and optional description on the left and the switch on the right.
 *
 * @param props - {@link ToggleProps}
 * @returns A `<button role="switch">` with `aria-checked` reflecting the current state.
 *
 * @example
 * // Standalone switch:
 * <Toggle checked={enabled} onChange={setEnabled} />
 *
 * @example
 * // Full row variant:
 * <Toggle
 *   checked={form.temVideo}
 *   onChange={v => setField("temVideo", v)}
 *   label="Possui vídeo demonstrativo"
 *   description="Informe o link do vídeo para o paciente assistir"
 * />
 */
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
