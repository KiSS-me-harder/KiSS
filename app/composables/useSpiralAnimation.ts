import { createDefaultFocusConfig } from '~/utils/spiralFocus'
import type { FocusConfig } from '~/utils/spiralFocus'
import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'
import { useFocusOverlay } from './useFocusOverlay'
import { useFullscreen } from './useFullscreen'
import { useSpiralCanvas } from './useSpiralCanvas'

/**
 * Manages spiral canvas animation, including drawing, play/pause, fullscreen, and focus.
 * @param canvasRef - Ref to the canvas HTML element.
 * @param canvasContainerRef - Ref to the canvas container div.
 * @param layers - Reactive array of spiral layers to draw.
 * @param focusConfig - Reactive focus configuration.
 * @returns Object with isPlaying, isFullscreen, and animation control functions.
 */
export function useSpiralAnimation(
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasContainerRef: Ref<HTMLDivElement | null>,
  layers: Ref<SpiralLayer[]>,
  focusConfig: Ref<FocusConfig> = ref(createDefaultFocusConfig())
) {
  const isPlaying = ref(false)
  const { isFullscreen, toggleFullscreen } = useFullscreen(canvasContainerRef)
  const focusOverlay = useFocusOverlay(canvasRef, focusConfig)
  const canvas = useSpiralCanvas(canvasRef, canvasContainerRef, layers, isPlaying, focusOverlay)

  let resizeObserver: ResizeObserver | null = null

  function startAnimation() {
    if (isPlaying.value) return
    isPlaying.value = true
    focusOverlay.setAnimationStartTime(Date.now())
    canvas.startAnimation()
  }

  function stopAnimation() {
    isPlaying.value = false
    canvas.stopAnimation()
  }

  function init() {
    canvas.resizeCanvas()
    canvas.drawSpiral()
    focusOverlay.setupMouseTracking(() => {
      if (!isPlaying.value) canvas.drawSpiral()
    })
    resizeObserver = new ResizeObserver(canvas.onResize)
    if (canvasContainerRef.value) {
      resizeObserver.observe(canvasContainerRef.value)
    }
  }

  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    focusOverlay.cleanup()
  }

  function loadFocusImage() {
    focusOverlay.loadFocusImage()
    if (!isPlaying.value) canvas.drawSpiral()
  }

  function setupMouseTracking() {
    focusOverlay.setupMouseTracking(() => {
      if (!isPlaying.value) canvas.drawSpiral()
    })
  }

  return {
    isPlaying,
    isFullscreen,
    startAnimation,
    stopAnimation,
    toggleFullscreen,
    drawSpiral: canvas.drawSpiral,
    init,
    cleanup,
    focusConfig,
    loadFocusImage,
    setupMouseTracking
  }
}
