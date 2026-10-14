/**
 * Spiral template drawing functions.
 * Extracted from spiralDrawing.ts to keep file sizes within ESLint limits.
 */

import { DEG_TO_RAD, parseHexColor, adjustColorBrightness } from './spiralColorUtils'

/**
 * Draws the classic spiral pattern with multiple arms.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawClassicSpiral(
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
  const sizeFactor = 0.7 * (size / 360)
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    const baseAngle = (angle + armAngle) * DEG_TO_RAD
    ctx.beginPath()
    for (let i = 0; i < 360; i++) {
      const theta = i * DEG_TO_RAD + baseAngle
      const radius = i * sizeFactor
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

/**
 * Draws the concentric rings pattern with gradient effect.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param width - Canvas width.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawConcentricRings(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  color: string,
  angle: number,
  sizePercent: number = 100,
  viewportDiagonal: number = 800,
  arms: number = 1
) {
  const maxRadius = (viewportDiagonal / 2) * (sizePercent / 100)
  const ringCount = 20
  const ringSpacing = maxRadius / ringCount
  const [r, g, b] = parseHexColor(color)
  const twoPi = Math.PI * 2
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    for (let i = ringCount; i >= 0; i--) {
      const radius = i * ringSpacing + (angle % ringSpacing) + armAngle
      if (radius > maxRadius) continue
      const t = i / ringCount
      const alpha = 0.3 + t * 0.7
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, twoPi)
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.lineWidth = ringSpacing * 0.6
      ctx.stroke()
    }
  }
}

/**
 * Draws the wave spiral pattern with sinusoidal modulation.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawWaveSpiral(
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
  const sizeFactor = size / 720
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    const baseAngle = (angle + armAngle) * DEG_TO_RAD
    ctx.beginPath()
    for (let i = 0; i < 720; i++) {
      const theta = i * DEG_TO_RAD + baseAngle
      const wave = Math.sin(i * 0.1) * 20
      const radius = (i * 0.35 + wave) * sizeFactor
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

/**
 * Draws the double spiral (yin-yang style) pattern with multiple arms.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawDoubleSpiral(
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
  const sizeFactor = 0.5 * (size / 360)
  ctx.lineWidth = 2
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    const baseAngle = (angle + armAngle) * DEG_TO_RAD
    const baseAngle2 = (angle + armAngle + 180) * DEG_TO_RAD
    ctx.beginPath()
    ctx.strokeStyle = color
    for (let i = 0; i < 360; i++) {
      const theta = i * DEG_TO_RAD + baseAngle
      const radius = i * sizeFactor
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.beginPath()
    const darkerColor = adjustColorBrightness(color, -40)
    ctx.strokeStyle = darkerColor
    for (let i = 0; i < 360; i++) {
      const theta = i * DEG_TO_RAD + baseAngle2
      const radius = i * sizeFactor
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

/**
 * Draws a fractal-like spiral with self-similar branching arms.
 * Uses cumulative angle (unwrapped) for arm rotation to avoid jumps at 360° boundaries.
 * Uses a periodic sine-based sway for branch modulation so the pattern loops smoothly.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param cumulativeAngle - The total rotation angle in degrees (not wrapped at 360).
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawFractalSpiral(
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

  // Periodic sway that loops smoothly — completes one full cycle every 360° of rotation
  const sway = Math.sin(cumulativeAngle * DEG_TO_RAD) * 0.5
  const cumulativeRad = cumulativeAngle * DEG_TO_RAD

  function drawBranch(x: number, y: number, theta: number, length: number, depth: number) {
    if (depth <= 0 || length < 2) return

    const alpha = 0.3 + (depth / 5) * 0.7
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.lineWidth = depth * 0.5

    const endX = x + length * Math.cos(theta)
    const endY = y + length * Math.sin(theta)
    ctx.moveTo(x, y)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    const branchAngle = Math.PI / 4
    const shrinkFactor = 0.7
    drawBranch(endX, endY, theta - branchAngle + sway, length * shrinkFactor, depth - 1)
    drawBranch(endX, endY, theta + branchAngle - sway, length * shrinkFactor, depth - 1)
  }

  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm * DEG_TO_RAD + cumulativeRad
    drawBranch(centerX, centerY, armAngle, size * 0.3, 5)
  }
}

/**
 * Draws a helix pattern that simulates a 3D helix projected onto 2D.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawHelixSpiral(
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
  const halfSize = size * 0.5

  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    const baseAngle = (angle + armAngle) * DEG_TO_RAD
    ctx.beginPath()

    for (let i = 0; i < 1000; i++) {
      const t = i / 1000
      const theta = i * 0.5 * DEG_TO_RAD + baseAngle
      const radius = t * halfSize
      // 3D helix projection: modulate x with cosine to simulate depth
      const cosTheta = Math.cos(theta)
      const depth = cosTheta
      const x = centerX + radius * cosTheta * (1 + 0.5 * depth)
      const y = centerY + radius * Math.sin(theta)

      const depthFactor = (depth + 1) * 0.5
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + 0.7 * depthFactor})`
      ctx.lineWidth = 1 + 2 * depthFactor

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }
}

/**
 * Draws a starburst pattern with radiating lines that spiral outward.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawStarburstSpiral(
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
  const [cr, cg, cb] = parseHexColor(color)
  const rays = arms * 6
  const halfSize = size * 0.5
  const twoPi = Math.PI * 2

  for (let i = 0; i < rays; i++) {
    const theta = ((360 / rays) * i + angle) * DEG_TO_RAD

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2

    for (let j = 0; j < 200; j++) {
      const t = j / 200
      const spiralOffset = t * 90 * DEG_TO_RAD
      const radius = t * halfSize
      const angle = theta + spiralOffset
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  // Draw connecting arcs
  for (let ring = 1; ring <= 5; ring++) {
    const radius = (ring / 5) * halfSize
    const alpha = 0.2 + (ring / 5) * 0.3
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`
    ctx.lineWidth = 1
    ctx.arc(centerX, centerY, radius, 0, twoPi)
    ctx.stroke()
  }
}

/**
 * Draws a galaxy pattern with multiple spiral arms and a bright core.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawGalaxySpiral(
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
  const halfSize = size * 0.5
  const twoPi = Math.PI * 2
  const coreRadius = size * 0.15

  // Draw core glow
  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius)
  coreGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`)
  coreGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`)
  coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = coreGradient
  ctx.fillRect(centerX - coreRadius, centerY - coreRadius, coreRadius * 2, coreRadius * 2)

  // Draw spiral arms with scattered dots
  const dotsPerArm = 200
  const scatterRange = size * 0.05
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    const baseAngle = (angle + armAngle) * DEG_TO_RAD
    for (let i = 0; i < dotsPerArm; i++) {
      const t = i / dotsPerArm
      const theta = i * 2 * DEG_TO_RAD + baseAngle
      const radius = t * halfSize
      const scatter = (Math.random() - 0.5) * scatterRange

      const x = centerX + (radius + scatter) * Math.cos(theta)
      const y = centerY + (radius + scatter) * Math.sin(theta)

      const dotSize = (1 - t) * 3 + 0.5
      const alpha = (1 - t) * 0.8 + 0.1

      ctx.beginPath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.arc(x, y, dotSize, 0, twoPi)
      ctx.fill()
    }
  }
}
