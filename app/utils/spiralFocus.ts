/**
 * Utility functions for the focus feature on spiral visuals.
 * The focus is an overlay element drawn on top of spirals that can be
 * positioned at the center, follow the cursor, or move along predefined paths.
 */

/**
 * Positioning mode for the focus element.
 */
export type FocusPositionMode = 'fixed' | 'cursor' | 'path'

/**
 * Type of focus visual.
 */
export type FocusType = 'dot' | 'preset' | 'image'

/**
 * Preset focus shapes available without custom images.
 */
export type FocusPreset = 'star' | 'heart' | 'diamond' | 'cross' | 'triangle'

/**
 * Predefined path patterns for focus movement.
 */
export type FocusPathType = 'pendulum' | 'dual-spiral' | 'minigame'

/**
 * A single focus point for path-based positioning.
 */
export interface FocusPoint {
  x: number
  y: number
  color: string
}

/**
 * Configuration for the focus feature on spiral visuals.
 */
export interface FocusConfig {
  /** Whether the focus is enabled. */
  enabled: boolean
  /** Type of focus visual: dot, preset shape, or custom image. */
  type: FocusType
  /** Color of the focus (hex value). */
  color: string
  /** Size of the focus in pixels. */
  size: number
  /** Positioning mode: fixed at center, follows cursor, or moves along path. */
  positionMode: FocusPositionMode
  /** Preset shape type when type is 'preset'. */
  presetType: FocusPreset
  /** Custom image URL when type is 'image'. */
  imageUrl: string
  /** Path type when positionMode is 'path'. */
  pathType: FocusPathType
  /** Speed of path animation (1-100). */
  pathSpeed: number
}

/**
 * Loaded image cache for focus images.
 */
export interface FocusImageCache {
  img: HTMLImageElement
  loaded: boolean
  error: boolean
}

/**
 * Default focus configuration.
 * @returns A new FocusConfig with default values.
 */
export function createDefaultFocusConfig(): FocusConfig {
  return {
    enabled: false,
    type: 'dot',
    color: '#ec4899',
    size: 15,
    positionMode: 'fixed',
    presetType: 'star',
    imageUrl: '',
    pathType: 'pendulum',
    pathSpeed: 50
  }
}

// ─── Focus Drawing Functions ───────────────────────────────────────────────────

/**
 * Draws a dot focus at the specified position.
 * @param ctx - Canvas rendering context.
 * @param x - X coordinate.
 * @param y - Y coordinate.
 * @param color - Hex color string.
 * @param size - Diameter in pixels.
 */
export function drawDotFocus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const radius = size / 2
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.5, color + '80')
  gradient.addColorStop(1, 'transparent')
  ctx.beginPath()
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Draws a star shape at the specified position.
 * @param ctx - Canvas rendering context.
 * @param x - Center X coordinate.
 * @param y - Center Y coordinate.
 * @param color - Hex color string.
 * @param size - Outer diameter in pixels.
 */
export function drawStarFocus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const spikes = 5
  const outerRadius = size / 2
  const innerRadius = outerRadius * 0.4
  const rotation = -Math.PI / 2

  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = rotation + (i * Math.PI) / spikes
    const px = x + radius * Math.cos(angle)
    const py = y + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Draws a heart shape at the specified position.
 * @param ctx - Canvas rendering context.
 * @param x - Center X coordinate.
 * @param y - Center Y coordinate.
 * @param color - Hex color string.
 * @param size - Outer diameter in pixels.
 */
export function drawHeartFocus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const s = size / 20
  ctx.beginPath()
  for (let i = 0; i < Math.PI * 2; i += 0.01) {
    const hx = x + 16 * Math.pow(Math.sin(i), 3) * s
    const hy = y - (13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i)) * s
    if (i === 0) ctx.moveTo(hx, hy)
    else ctx.lineTo(hx, hy)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Draws a diamond shape at the specified position.
 * @param ctx - Canvas rendering context.
 * @param x - Center X coordinate.
 * @param y - Center Y coordinate.
 * @param color - Hex color string.
 * @param size - Outer diameter in pixels.
 */
export function drawDiamondFocus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const half = size / 2
  ctx.beginPath()
  ctx.moveTo(x, y - half)
  ctx.lineTo(x + half, y)
  ctx.lineTo(x, y + half)
  ctx.lineTo(x - half, y)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Draws a cross/plus shape at the specified position.
 * @param ctx - Canvas rendering context.
 * @param x - Center X coordinate.
 * @param y - Center Y coordinate.
 * @param color - Hex color string.
 * @param size - Outer diameter in pixels.
 */
export function drawCrossFocus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const half = size / 2
  const thickness = size / 4
  ctx.fillStyle = color
  ctx.fillRect(x - thickness / 2, y - half, thickness, size)
  ctx.fillRect(x - half, y - thickness / 2, size, thickness)
}

/**
 * Draws a triangle shape at the specified position.
 * @param ctx - Canvas rendering context.
 * @param x - Center X coordinate.
 * @param y - Center Y coordinate.
 * @param color - Hex color string.
 * @param size - Outer diameter in pixels.
 */
export function drawTriangleFocus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const half = size / 2
  const height = half * Math.sqrt(3)
  ctx.beginPath()
  ctx.moveTo(x, y - height / 2)
  ctx.lineTo(x + half, y + height / 2)
  ctx.lineTo(x - half, y + height / 2)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Draws the preset focus shape at the specified position.
 * @param ctx - Canvas rendering context.
 * @param presetType - The preset shape type.
 * @param x - X coordinate.
 * @param y - Y coordinate.
 * @param color - Hex color string.
 * @param size - Size in pixels.
 */
export function drawPresetFocus(
  ctx: CanvasRenderingContext2D,
  presetType: FocusPreset,
  x: number,
  y: number,
  color: string,
  size: number
) {
  switch (presetType) {
    case 'star':
      drawStarFocus(ctx, x, y, color, size)
      break
    case 'heart':
      drawHeartFocus(ctx, x, y, color, size)
      break
    case 'diamond':
      drawDiamondFocus(ctx, x, y, color, size)
      break
    case 'cross':
      drawCrossFocus(ctx, x, y, color, size)
      break
    case 'triangle':
      drawTriangleFocus(ctx, x, y, color, size)
      break
  }
}

/**
 * Draws the focus element on the canvas.
 * @param ctx - Canvas rendering context.
 * @param config - Focus configuration.
 * @param x - X coordinate to draw at.
 * @param y - Y coordinate to draw at.
 * @param imageCache - Optional cached image for image-type focus.
 */
export function drawFocus(
  ctx: CanvasRenderingContext2D,
  config: FocusConfig,
  x: number,
  y: number,
  imageCache?: FocusImageCache
) {
  if (!config.enabled) return

  switch (config.type) {
    case 'dot':
      drawDotFocus(ctx, x, y, config.color, config.size)
      break
    case 'preset':
      drawPresetFocus(ctx, config.presetType, x, y, config.color, config.size)
      break
    case 'image':
      if (imageCache?.loaded && !imageCache.error) {
        const half = config.size / 2
        ctx.drawImage(imageCache.img, x - half, y - half, config.size, config.size)
      } else {
        drawDotFocus(ctx, x, y, config.color, config.size)
      }
      break
  }
}

/**
 * Draws multiple focus points for path-based modes.
 * @param ctx - Canvas rendering context.
 * @param config - Focus configuration.
 * @param points - Array of focus points with positions and colors.
 * @param imageCache - Optional cached image for image-type focus.
 */
export function drawFocusPoints(
  ctx: CanvasRenderingContext2D,
  config: FocusConfig,
  points: FocusPoint[],
  imageCache?: FocusImageCache
) {
  for (const point of points) {
    const pointConfig = { ...config, color: point.color }
    drawFocus(ctx, pointConfig, point.x, point.y, imageCache)
  }
}

// ─── Focus Path Animation Functions ────────────────────────────────────────────

/**
 * Calculates focus position for pendulum path mode.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @param time - Animation time in milliseconds.
 * @param speed - Speed factor (1-100).
 * @returns Array of focus points.
 */
export function calculatePendulumPath(
  width: number,
  height: number,
  time: number,
  speed: number
): FocusPoint[] {
  const centerX = width / 2
  const topY = height * 0.15
  const swingLength = height * 0.5
  const swingAngle = Math.sin(time * 0.002 * (speed / 50)) * 0.8

  const x = centerX + swingLength * Math.sin(swingAngle)
  const y = topY + swingLength * Math.cos(swingAngle)

  return [{ x, y, color: '#ffffff' }]
}

/**
 * Calculates focus positions for dual-spiral path mode.
 * Two focuses move in opposite spiral directions.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @param time - Animation time in milliseconds.
 * @param speed - Speed factor (1-100).
 * @returns Array of two focus points.
 */
export function calculateDualSpiralPath(
  width: number,
  height: number,
  time: number,
  speed: number
): FocusPoint[] {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.25
  const angle = time * 0.003 * (speed / 50)

  const x1 = centerX + radius * Math.cos(angle)
  const y1 = centerY + radius * Math.sin(angle)
  const x2 = centerX + radius * Math.cos(angle + Math.PI)
  const y2 = centerY + radius * Math.sin(angle + Math.PI)

  return [
    { x: x1, y: y1, color: '#ffffff' },
    { x: x2, y: y2, color: '#ec4899' }
  ]
}

/**
 * Calculates focus positions for minigame path mode.
 * Multiple focuses move along different paths with color changes.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @param time - Animation time in milliseconds.
 * @param speed - Speed factor (1-100).
 * @returns Array of focus points.
 */
export function calculateMinigamePath(
  width: number,
  height: number,
  time: number,
  speed: number
): FocusPoint[] {
  const centerX = width / 2
  const centerY = height / 2
  const t = time * 0.001 * (speed / 50)
  const points: FocusPoint[] = []

  const count = 4
  for (let i = 0; i < count; i++) {
    const phase = (Math.PI * 2 / count) * i
    const radiusX = width * 0.3
    const radiusY = height * 0.25

    const x = centerX + radiusX * Math.cos(t + phase)
    const y = centerY + radiusY * Math.sin(t * 1.5 + phase)

    const hue = ((t * 50 + i * 90) % 360).toFixed(0)
    const color = `hsl(${hue}, 80%, 60%)`

    points.push({ x, y, color })
  }

  return points
}

/**
 * Calculates the focus points for the current time based on the path type.
 * @param config - Focus configuration.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @param time - Current animation time in milliseconds.
 * @returns Array of focus points.
 */
export function calculateFocusPath(
  config: FocusConfig,
  width: number,
  height: number,
  time: number
): FocusPoint[] {
  switch (config.pathType) {
    case 'pendulum':
      return calculatePendulumPath(width, height, time, config.pathSpeed)
    case 'dual-spiral':
      return calculateDualSpiralPath(width, height, time, config.pathSpeed)
    case 'minigame':
      return calculateMinigamePath(width, height, time, config.pathSpeed)
    default:
      return [{ x: width / 2, y: height / 2, color: config.color }]
  }
}
