import { drawSpiralLayers, updateLayerAngles } from '~/utils/spiralDrawing'
import { mapLayerData } from '~/utils/spiralLayerData'
import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'

/**
 * Manages spiral canvas resize and drawing logic.
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

  function resizeCanvas() {
    const canvas = canvasRef.value
    const container = canvasContainerRef.value
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    const padding = 32
    const width = Math.floor(rect.width - padding * 2)
    const height = Math.floor(rect.height - padding * 2)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
  }

  function drawSpiral() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const layerData = mapLayerData(layers.value)
    drawSpiralLayers(ctx, canvas.width, canvas.height, layerData)
    focusOverlay.drawFocusOnCanvas(ctx, canvas.width, canvas.height, focusOverlay.getElapsed())

    if (isPlaying.value) {
      updateLayerAngles(layerData)
      for (let i = 0; i < layers.value.length; i++) {
        const layer = layers.value[i]
        const data = layerData[i]
        if (layer && data) {
          layer.angle = data.angle
        }
      }
      animationId = requestAnimationFrame(drawSpiral)
    }
  }

  function startAnimation() {
    if (import.meta.client) {
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

  return { resizeCanvas, drawSpiral, startAnimation, stopAnimation, onResize }
}
