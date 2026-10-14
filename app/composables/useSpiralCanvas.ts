import {
  initSpiralWebGL,
  renderSpiralFrame,
  resizeWebGLCanvas,
  cleanupWebGL,
  hexToRGB01,
  templateIds,
  type WebGLLayerData,
  type SpiralWebGLRenderer
} from '~/utils/spiralWebGLRenderer'
import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'

/**
 * Maps SpiralLayer props to WebGLLayerData for rendering.
 * @param layer - A spiral layer from the UI.
 * @returns WebGL-compatible layer data.
 */
function mapToWebGLLayer(layer: SpiralLayer): WebGLLayerData {
  const templateId = templateIds[layer.template] ?? 0
  const color = hexToRGB01(layer.color)
  const direction = layer.direction === 'forward' ? 1 : -1
  return {
    template: templateId,
    color,
    angle: layer.angle,
    cumulativeAngle: layer.cumulativeAngle ?? layer.angle,
    size: layer.size,
    speed: layer.speed,
    direction,
    intensity: layer.intensity
  }
}

/**
 * Updates angles for all layers based on speed and direction.
 * @param layers - Array of spiral layers to update.
 */
function updateLayerAngles(layers: SpiralLayer[]) {
  for (const layer of layers) {
    const dirMultiplier = layer.direction === 'forward' ? 1 : -1
    const delta = layer.speed * 0.05 * dirMultiplier
    layer.angle += delta
    layer.cumulativeAngle = (layer.cumulativeAngle ?? layer.angle) + delta
    if (layer.angle >= 360) layer.angle -= 360
    if (layer.angle < 0) layer.angle += 360
  }
}

/**
 * Creates or resizes the overlay canvas for focus drawing.
 * The overlay canvas sits on top of the WebGL canvas using absolute positioning.
 * @param container - The container element.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @returns The overlay canvas element.
 */
function ensureOverlayCanvas(container: HTMLDivElement, width: number, height: number): HTMLCanvasElement {
  let overlay = container.querySelector('canvas.overlay-canvas') as HTMLCanvasElement | null
  if (!overlay) {
    overlay = document.createElement('canvas')
    overlay.className = 'overlay-canvas'
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;'
    container.appendChild(overlay)
  }
  if (overlay.width !== width || overlay.height !== height) {
    overlay.width = width
    overlay.height = height
  }
  return overlay
}

/**
 * Manages spiral canvas resize and WebGL drawing logic.
 * @param canvasRef - Ref to the canvas HTML element.
 * @param canvasContainerRef - Ref to the canvas container div.
 * @param layers - Reactive array of spiral layers.
 * @param isPlaying - Ref indicating whether animation is playing.
 * @param focusOverlay - Focus overlay composable for drawing focus on canvas.
 * @returns Object with resizeCanvas, drawSpiral, and onResize functions.
 */
export function useSpiralCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasContainerRef: Ref<HTMLDivElement | null>,
  layers: Ref<SpiralLayer[]>,
  isPlaying: Ref<boolean>,
  focusOverlay: { drawFocusOnCanvas: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void, getElapsed: () => number }
) {
  let animationId: number | null = null
  let renderer: SpiralWebGLRenderer | null = null
  let startTime = 0

  function resizeCanvas() {
    const canvas = canvasRef.value
    const container = canvasContainerRef.value
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    if (renderer) {
      resizeWebGLCanvas(renderer, width, height)
    } else if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
  }

  function initRenderer() {
    const canvas = canvasRef.value
    if (!canvas || renderer) return
    renderer = initSpiralWebGL(canvas)
  }

  function drawSpiral() {
    const canvas = canvasRef.value
    const container = canvasContainerRef.value
    if (!canvas || !container) return

    // Initialize WebGL renderer if not yet done
    if (!renderer) {
      initRenderer()
    }

    if (renderer) {
      const webglLayers = layers.value.map(mapToWebGLLayer)
      const elapsed = (Date.now() - startTime) / 1000
      renderSpiralFrame(renderer, webglLayers, elapsed)
    }

    // Draw focus overlay on a separate overlay canvas
    const overlay = ensureOverlayCanvas(container, canvas.width, canvas.height)
    const overlayCtx = overlay.getContext('2d')
    if (overlayCtx) {
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height)
      focusOverlay.drawFocusOnCanvas(overlayCtx, overlay.width, overlay.height, focusOverlay.getElapsed())
    }

    if (isPlaying.value) {
      updateLayerAngles(layers.value)
      animationId = requestAnimationFrame(drawSpiral)
    }
  }

  function startAnimation() {
    if (import.meta.client) {
      startTime = Date.now()
      drawSpiral()
    }
  }

  function stopAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function onResize() {
    resizeCanvas()
    if (!isPlaying.value) {
      drawSpiral()
    }
  }

  function cleanup() {
    if (renderer) {
      cleanupWebGL(renderer)
      renderer = null
    }
  }

  return { resizeCanvas, drawSpiral, startAnimation, stopAnimation, onResize, cleanup }
}
