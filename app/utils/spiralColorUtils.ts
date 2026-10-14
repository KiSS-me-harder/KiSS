/**
 * Color utility functions for spiral drawing.
 */

/** Degrees to radians conversion factor. */
export const DEG_TO_RAD = Math.PI / 180

/**
 * Parses a hex color string into an RGB tuple.
 * @param color - The hex color string (e.g. "#ff0000").
 * @returns Tuple of [r, g, b] values, or [0, 0, 0] if parsing fails.
 */
export function parseHexColor(color: string): [number, number, number] {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return [0, 0, 0]
  return [r, g, b]
}

/**
 * Adjusts the brightness of a hex color.
 * @param hex - The hex color string.
 * @param amount - The brightness adjustment amount (-255 to 255).
 * @returns The adjusted hex color string.
 */
export function adjustColorBrightness(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
