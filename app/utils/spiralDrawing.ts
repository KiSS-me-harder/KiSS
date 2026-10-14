/**
 * Utility functions for drawing spiral patterns on a canvas.
 */

import {
  drawClassicSpiral,
  drawConcentricRings,
  drawWaveSpiral,
  drawDoubleSpiral,
  drawFractalSpiral,
  drawHelixSpiral,
  drawStarburstSpiral,
  drawGalaxySpiral
} from './spiralTemplates'
import {
  drawMandalaSpiral,
  drawDNAHelix,
  drawKaleidoscopeSpiral,
  drawVortexTunnel
} from './spiralTemplatesExtra'

/**
 * Valid theme color role names that can be resolved to CSS variables.
 */
export const themeColorNames = ['primary', 'neutral', 'secondary', 'success', 'info', 'warning', 'error'] as const

/**
 * Type for valid theme color names.
 */
export type ThemeColorName = (typeof themeColorNames)[number]

/**
 * Checks if a string is a valid theme color name.
 * @param color - The color string to check.
 * @returns True if the color is a theme color name.
 */
export function isThemeColorName(color: string): color is ThemeColorName {
  return themeColorNames.includes(color as ThemeColorName)
}

/**
 * Default hex colors for Nuxt UI theme color roles.
 * These match Nuxt UI's defaults: secondary=blue, success=green, info=blue, warning=yellow, error=red.
 */
const defaultThemeColors: Record<string, string> = {
  secondary: '#3b82f6', // blue-500
  success: '#22c55e', // green-500
  info: '#3b82f6', // blue-500
  warning: '#eab308', // yellow-500
  error: '#ef4444' // red-500
}

/**
 * Cache for resolved theme colors to avoid repeated lookups.
 */
const resolvedColorCache: Record<string, string> = {}

/**
 * Converts an rgb/rgba CSS color value to a hex string.
 * @param value - The CSS color value (e.g. "rgb(255, 0, 0)" or "rgba(255, 0, 0, 1)").
 * @returns The hex color string, or null if parsing fails.
 */
function rgbToHex(value: string): string | null {
  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!rgbMatch || !rgbMatch[1] || !rgbMatch[2] || !rgbMatch[3]) return null
  const r = parseInt(rgbMatch[1], 10)
  const g = parseInt(rgbMatch[2], 10)
  const b = parseInt(rgbMatch[3], 10)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Resolves a CSS custom property value from the root element without DOM manipulation.
 * @param propertyName - The CSS property name (e.g. "--ui-primary").
 * @returns The resolved color value as a string, or empty string if not found.
 */
function resolveCssVariable(propertyName: string): string {
  if (!import.meta.client) {
    return ''
  }
  const rootStyles = getComputedStyle(document.documentElement)
  return rootStyles.getPropertyValue(propertyName).trim()
}

/**
 * Resolves a theme color name or hex value to a hex color string.
 * For primary and neutral, reads the CSS variable at runtime (customizable via app.config.ts).
 * For other colors, uses Nuxt UI default hex values.
 * Results are cached so repeated calls return instantly.
 * @param color - A theme color name or hex color string.
 * @returns The resolved hex color string.
 */
export function resolveThemeColor(color: string): string {
  // If it's already a hex color, return it directly
  if (typeof color !== 'string' || !color || color.startsWith('#')) {
    return color
  }

  // Check if it's a theme color name
  if (!isThemeColorName(color)) {
    return color
  }

  // Return from cache if already resolved
  if (resolvedColorCache[color]) {
    return resolvedColorCache[color]
  }

  // For non-customizable colors, return the default hex value directly
  if (defaultThemeColors[color]) {
    resolvedColorCache[color] = defaultThemeColors[color]
    return resolvedColorCache[color]
  }

  // Only resolve primary and neutral from CSS variables (they are customizable)
  if (!import.meta.client) {
    const fallback = color === 'neutral' ? '#5c5c7b' : '#ec4899'
    resolvedColorCache[color] = fallback
    return fallback
  }

  const cssVar = color === 'neutral' ? '--ui-neutral' : '--ui-primary'
  const value = resolveCssVariable(cssVar)

  if (!value) {
    const fallback = color === 'neutral' ? '#5c5c7b' : '#ec4899'
    resolvedColorCache[color] = fallback
    return fallback
  }

  // If the value is already a hex color, cache and return it
  if (value.startsWith('#')) {
    resolvedColorCache[color] = value
    return value
  }

  // If it's an rgb/rgba value, convert to hex, cache, and return
  const hex = rgbToHex(value)
  if (hex) {
    resolvedColorCache[color] = hex
    return hex
  }

  // Fallback
  const fallback = color === 'neutral' ? '#5c5c7b' : '#ec4899'
  resolvedColorCache[color] = fallback
  return fallback
}

/**
 * Clears the resolved color cache. Call this when the theme changes to force re-resolution.
 */
export function clearResolvedColorCache() {
  Object.assign(resolvedColorCache, {})
}

/**
 * Draws the spiral for the given template type.
 * @param ctx - The canvas rendering context.
 * @param template - The spiral template type.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param width - Canvas width.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees (wrapped 0-360).
 * @param cumulativeAngle - The total rotation angle in degrees (unwrapped, for smooth looping).
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawSpiralTemplate(
  ctx: CanvasRenderingContext2D,
  template: string,
  centerX: number,
  centerY: number,
  width: number,
  color: string,
  angle: number,
  cumulativeAngle: number,
  sizePercent: number = 100,
  viewportDiagonal: number = 800,
  arms: number = 1
) {
  switch (template) {
    case 'classic':
      drawClassicSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'concentric':
      drawConcentricRings(ctx, centerX, centerY, width, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'wave':
      drawWaveSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'double':
      drawDoubleSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'fractal':
      drawFractalSpiral(ctx, centerX, centerY, color, cumulativeAngle, sizePercent, viewportDiagonal, arms)
      break
    case 'helix':
      drawHelixSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'starburst':
      drawStarburstSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'galaxy':
      drawGalaxySpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'mandala':
      drawMandalaSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'dna':
      drawDNAHelix(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'kaleidoscope':
      drawKaleidoscopeSpiral(ctx, centerX, centerY, color, angle, sizePercent, viewportDiagonal, arms)
      break
    case 'vortex':
      drawVortexTunnel(ctx, centerX, centerY, color, cumulativeAngle, sizePercent, viewportDiagonal, arms)
      break
  }
}

/**
 * Spiral layer data structure for drawing.
 */
export interface SpiralLayerData {
  template: string
  color: string
  angle: number
  cumulativeAngle: number
  size: number
  speed: number
  direction: 'forward' | 'backward'
  intensity: number
}

/**
 * Draws all spiral layers on the given canvas context.
 * @param ctx - The canvas rendering context.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @param layers - Array of spiral layer data.
 */
export function drawSpiralLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layers: SpiralLayerData[]
) {
  const centerX = width / 2
  const centerY = height / 2
  // Calculate viewport diagonal for percentage-based sizing
  const viewportDiagonal = Math.sqrt(width * width + height * height)

  // Clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw each layer
  for (const layer of layers) {
    const resolvedColor = resolveThemeColor(layer.color)
    drawSpiralTemplate(
      ctx,
      layer.template,
      centerX,
      centerY,
      width,
      resolvedColor,
      layer.angle,
      layer.cumulativeAngle,
      layer.size,
      viewportDiagonal,
      layer.intensity
    )
  }
}

/**
 * Updates angles for all layers based on speed and direction.
 * The wrapped angle (0-360) is used for standard rotation, while the cumulative
 * angle tracks total rotation without wrapping for templates that need smooth
 * continuous animation (e.g., vortex tunnel depth effects).
 * @param layers - Array of spiral layer data to update.
 */
export function updateLayerAngles(layers: SpiralLayerData[]) {
  for (const layer of layers) {
    const dirMultiplier = layer.direction === 'forward' ? 1 : -1
    const delta = layer.speed * 0.05 * dirMultiplier
    layer.angle += delta
    layer.cumulativeAngle += delta
    if (layer.angle >= 360) layer.angle -= 360
    if (layer.angle < 0) layer.angle += 360
  }
}
