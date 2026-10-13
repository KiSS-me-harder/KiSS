/**
 * Spiral template drawing functions.
 * Extracted from spiralDrawing.ts to keep file sizes within ESLint limits.
 */

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
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    for (let i = 0; i < 360; i++) {
      const theta = (i + angle + armAngle) * (Math.PI / 180)
      const radius = i * 0.7 * (size / 360)
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
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    for (let i = ringCount; i >= 0; i--) {
      const radius = i * ringSpacing + (angle % ringSpacing) + armAngle
      if (radius > maxRadius) continue
      const t = i / ringCount
      const alpha = 0.3 + t * 0.7
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
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
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    for (let i = 0; i < 720; i++) {
      const theta = (i + angle + armAngle) * (Math.PI / 180)
      const wave = Math.sin(i * 0.1) * 20
      const radius = (i * 0.35 + wave) * (size / 720)
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
  ctx.lineWidth = 2
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    ctx.beginPath()
    ctx.strokeStyle = color
    for (let i = 0; i < 360; i++) {
      const theta = (i + angle + armAngle) * (Math.PI / 180)
      const radius = i * 0.5 * (size / 360)
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
      const theta = (i + angle + armAngle + 180) * (Math.PI / 180)
      const radius = i * 0.5 * (size / 360)
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
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

/**
 * Draws a fractal-like spiral with self-similar branching arms.
 * @param ctx - The canvas rendering context.
 * @param centerX - Center X coordinate.
 * @param centerY - Center Y coordinate.
 * @param color - The spiral color in hex format.
 * @param angle - The current rotation angle in degrees.
 * @param sizePercent - Size as a percentage of the viewport diagonal (10 to 300).
 * @param viewportDiagonal - The diagonal of the viewport in pixels.
 * @param arms - Number of spiral arms (1 to 12).
 */
export function drawFractalSpiral(
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
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

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
    drawBranch(endX, endY, theta - branchAngle + angle * 0.01, length * shrinkFactor, depth - 1)
    drawBranch(endX, endY, theta + branchAngle + angle * 0.01, length * shrinkFactor, depth - 1)
  }

  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm * (Math.PI / 180)
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
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    ctx.beginPath()

    for (let i = 0; i < 1000; i++) {
      const t = i / 1000
      const theta = (i * 0.5 + angle + armAngle) * (Math.PI / 180)
      const radius = t * size * 0.5
      // 3D helix projection: modulate x with cosine to simulate depth
      const depth = Math.cos(theta)
      const x = centerX + radius * Math.cos(theta) * (0.5 + 0.5 * depth)
      const y = centerY + radius * Math.sin(theta)

      const alpha = 0.3 + 0.7 * ((depth + 1) / 2)
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.lineWidth = 1 + 2 * ((depth + 1) / 2)

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
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const rays = arms * 6

  for (let i = 0; i < rays; i++) {
    const theta = (360 / rays) * i + angle

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2

    for (let j = 0; j < 200; j++) {
      const t = j / 200
      const spiralOffset = t * 90
      const r = t * size * 0.5
      const x = centerX + r * Math.cos((theta + spiralOffset) * (Math.PI / 180))
      const y = centerY + r * Math.sin((theta + spiralOffset) * (Math.PI / 180))

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
    const radius = (ring / 5) * size * 0.5
    const alpha = 0.2 + (ring / 5) * 0.3
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.lineWidth = 1
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
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
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  // Draw core glow
  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.15)
  coreGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`)
  coreGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`)
  coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = coreGradient
  ctx.fillRect(centerX - size * 0.15, centerY - size * 0.15, size * 0.3, size * 0.3)

  // Draw spiral arms with scattered dots
  const dotsPerArm = 200
  for (let arm = 0; arm < arms; arm++) {
    const armAngle = (360 / arms) * arm
    for (let i = 0; i < dotsPerArm; i++) {
      const t = i / dotsPerArm
      const theta = (i * 2 + angle + armAngle) * (Math.PI / 180)
      const radius = t * size * 0.5
      const scatter = (Math.random() - 0.5) * size * 0.05

      const x = centerX + (radius + scatter) * Math.cos(theta)
      const y = centerY + (radius + scatter) * Math.sin(theta)

      const dotSize = (1 - t) * 3 + 0.5
      const alpha = (1 - t) * 0.8 + 0.1

      ctx.beginPath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
