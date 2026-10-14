/**
 * Additional spiral template drawing functions (part 2).
 * Extracted from spiralDrawing.ts to keep file sizes within ESLint limits.
 */

import { DEG_TO_RAD, parseHexColor, adjustColorBrightness } from './spiralColorUtils'

/**
 * Draws a mandala pattern with symmetrical geometric shapes.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawMandalaSpiral(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string,
  angle: number,
  sizePercent: number = 100,
  viewportDiagonal: number = 800,
  arms: number = 1
) {
  const size = viewportDiagonal * (sizePercent / 100)
  const [r, g, b] = parseHexColor(color)
  const segments = arms * 2
  const halfSize = size * 0.5
  const petalSize = size * 0.05
  const twoPi = Math.PI * 2
  const halfPi = Math.PI / 2

  for (let ring = 1; ring <= 8; ring++) {
    const radius = (ring / 8) * halfSize
    const alpha = 0.3 + (ring / 8) * 0.5
    const direction = ring % 2 === 0 ? 1 : -1

    for (let i = 0; i < segments; i++) {
      const theta = (((360 / segments) * i + angle * direction)) * DEG_TO_RAD
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)

      ctx.beginPath()
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.lineWidth = 1.5

      // Draw petal shapes
      ctx.ellipse(
        x, y, petalSize, petalSize * 0.5,
        theta + halfPi, 0, twoPi
      )
      ctx.stroke()

      // Connect to center
      if (ring === 1) {
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    }

    // Draw ring circle
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`
    ctx.lineWidth = 1
    ctx.arc(centerX, centerY, radius, 0, twoPi)
    ctx.stroke()
  }
}

/**
 * Draws a DNA double helix pattern.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawDNAHelix(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string,
  angle: number,
  sizePercent: number = 100,
  viewportDiagonal: number = 800,
  arms: number = 1
) {
  const size = viewportDiagonal * (sizePercent / 100)
  const [r, g, b] = parseHexColor(color)

  const points = 300
  const helixWidth = size * 0.15
  const sizeFactor = size * 0.8
  const startY = centerY - size * 0.4
  const fourPi = Math.PI * 4

  for (let arm = 0; arm < arms; arm++) {
    const armOffset = (360 / arms) * arm
    const angleRad = angle * 0.02

    // Draw backbone strands
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    for (let i = 0; i < points; i++) {
      const t = (i / points) * fourPi
      const y = startY + (i / points) * sizeFactor
      const x = centerX + Math.cos(t + angleRad + armOffset) * helixWidth

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    const darkerColor = adjustColorBrightness(color, -60)
    ctx.beginPath()
    ctx.strokeStyle = darkerColor
    ctx.lineWidth = 2
    for (let i = 0; i < points; i++) {
      const t = (i / points) * fourPi
      const y = startY + (i / points) * sizeFactor
      const x = centerX + Math.cos(t + angleRad + armOffset + Math.PI) * helixWidth

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw connecting rungs
    for (let i = 0; i < points; i += 10) {
      const t = (i / points) * fourPi
      const y = startY + (i / points) * sizeFactor
      const x1 = centerX + Math.cos(t + angleRad + armOffset) * helixWidth
      const x2 = centerX + Math.cos(t + angleRad + armOffset + Math.PI) * helixWidth

      const alpha = 0.3 + 0.3 * Math.abs(Math.cos(t))
      ctx.beginPath()
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.lineWidth = 1
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()
    }
  }
}

/**
 * Draws a kaleidoscope pattern with mirrored segments.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawKaleidoscopeSpiral(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string,
  angle: number,
  sizePercent: number = 100,
  viewportDiagonal: number = 800,
  arms: number = 1
) {
  const size = viewportDiagonal * (sizePercent / 100)
  const [r, g, b] = parseHexColor(color)
  const segments = arms * 2
  const halfSize = size * 0.5
  const curveRange = size * 0.05
  const dotSize = size * 0.02
  const twoPi = Math.PI * 2

  for (let seg = 0; seg < segments; seg++) {
    const segAngle = ((360 / segments) * seg + angle) * DEG_TO_RAD

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(segAngle)

    // Draw one segment's pattern
    for (let i = 0; i < 50; i++) {
      const t = i / 50
      const radius = t * halfSize
      const curve = Math.sin(i * 0.3) * curveRange

      const alpha = 0.3 + t * 0.5
      ctx.beginPath()
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.lineWidth = 1.5

      ctx.arc(curve, radius, dotSize * (1 - t), 0, twoPi)
      ctx.stroke()
    }

    ctx.restore()
  }
}

/**
 * Draws a vortex tunnel pattern that creates a depth illusion.
 * Uses cumulative angle (unwrapped) for smooth looping — the ring rotation
 * is multiplied by depth, so a wrapped angle would cause visible jumps at 360°.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param cumulativeAngle - The total rotation angle in degrees (not wrapped at 360).
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawVortexTunnel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string,
  cumulativeAngle: number,
  sizePercent: number = 100,
  viewportDiagonal: number = 800,
  arms: number = 1
) {
  const size = viewportDiagonal * (sizePercent / 100)
  const [r, g, b] = parseHexColor(color)

  const rings = 30
  const halfSize = size * 0.5
  const twoPi = Math.PI * 2

  for (let i = rings; i >= 0; i--) {
    const t = i / rings
    const radius = t * halfSize
    const ringAngle = cumulativeAngle * (1 - t) * 0.5

    const alpha = 0.1 + t * 0.6
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.lineWidth = 2 + (1 - t) * 3

    // Draw elliptical rings rotated to create tunnel effect
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(ringAngle * DEG_TO_RAD)
    ctx.scale(1, 0.3)
    ctx.arc(0, 0, radius, 0, twoPi)
    ctx.restore()
    ctx.stroke()

    // Draw spiral connectors
    if (i < rings) {
      const nextT = (i + 1) / rings
      const nextRadius = nextT * halfSize
      const nextAngle = cumulativeAngle * (1 - nextT) * 0.5

      for (let arm = 0; arm < arms; arm++) {
        const armAngle = (360 / arms) * arm
        const x1 = centerX + radius * Math.cos((armAngle + ringAngle) * DEG_TO_RAD)
        const y1 = centerY + radius * Math.sin((armAngle + ringAngle) * DEG_TO_RAD) * 0.3
        const x2 = centerX + nextRadius * Math.cos((armAngle + nextAngle) * DEG_TO_RAD)
        const y2 = centerY + nextRadius * Math.sin((armAngle + nextAngle) * DEG_TO_RAD) * 0.3

        ctx.beginPath()
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`
        ctx.lineWidth = 1
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }
  }
}
