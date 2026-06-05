/**
 * Maps an EVA (Visual Analogue Scale) pain score string to a CSS color token.
 *
 * Scores 0–3 map to the success (green) token, 4–6 to warning (amber), and
 * 7–10 to the danger red `#FF3B30`. Non-numeric inputs fall through to red.
 *
 * @param val - The EVA score as a string (e.g. `"5"` or `form.dorEVA`).
 * @returns A CSS color string — either a `var(--...)` token or a hex value.
 *
 * @example
 * evaColor("2");  // "var(--success)"
 * evaColor("5");  // "var(--warning)"
 * evaColor("9");  // "#FF3B30"
 */
export function evaColor(val: string): string {
  const n = parseInt(val);
  if (n <= 3) return "var(--success)";
  if (n <= 6) return "var(--warning)";
  return "#FF3B30";
}

/**
 * Maps an adherence percentage to a CSS color for progress bars and labels.
 *
 * Thresholds: ≥ 80 % → success (green), ≥ 50 % → warning (amber),
 * below 50 % → danger (red).
 *
 * @param pct - Adherence percentage as a number in the range 0–100.
 * @returns A hex color string.
 *
 * @example
 * adherenceColor(85); // "#34C759"
 * adherenceColor(60); // "#FF9500"
 * adherenceColor(30); // "#FF3B30"
 */
export function adherenceColor(pct: number): string {
  if (pct >= 80) return "#34C759";
  if (pct >= 50) return "#FF9500";
  return "#FF3B30";
}
