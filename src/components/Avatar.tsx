import "./Avatar.css";

type AvatarProps = {
  /** Full name — used to derive initials (when not given) and the background color. */
  name: string;
  /** Explicit initials; falls back to deriving them from `name`. */
  initials?: string;
  /** Diameter in px (also drives the font size). */
  size?: number;
  /** Extra class for surrounding layout (margins, flex-shrink, etc.). */
  className?: string;
};

// Brand-adjacent palette; index chosen deterministically from the name so a
// given person always gets the same color.
const PALETTE = [
  "#007AFF", "#34C759", "#5AC8FA", "#AF52DE",
  "#FF9500", "#FF2D55", "#E04F5F", "#5856D6",
];

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/**
 * Lightweight, offline-friendly avatar that renders initials on a
 * deterministically color-hashed circle — no image required.
 *
 * The background color is derived from `name` so the same person always gets
 * the same color across renders and sessions.
 *
 * @param props - {@link AvatarProps}
 * @returns A `<span>` styled as a circle with the initials centered inside.
 *
 * @example
 * // Explicit initials (e.g. from a Doctor record):
 * <Avatar name="Dr. Carlos Reis" initials="CR" size={34} />
 *
 * // Auto-derived initials from a full name:
 * <Avatar name="Maria Silva" size={40} />
 */
export default function Avatar({ name, initials, size = 40, className }: AvatarProps) {
  const text = initials?.trim() || deriveInitials(name);
  return (
    <span
      className={className ? `avatar ${className}` : "avatar"}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: colorFor(name) }}
      role="img"
      aria-label={name}
    >
      {text}
    </span>
  );
}
