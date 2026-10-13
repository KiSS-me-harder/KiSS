import {
  calculateFocusPath,
  createDefaultFocusConfig,
  drawFocus,
  drawFocusPoints
} from '~/utils/spiralFocus'
import type {
  FocusConfig,
  FocusImageCache
} from '~/utils/spiralFocus'

/**
 * Manages focus overlay state and drawing for spiral visuals.
 * @param canvasRef - Ref to the canvas HTML element.
 * @param focusConfig - Reactive focus configuration.
 * @returns Object with focus state and control functions.
 */
export function useFocusOverlay(
  canvasRef: Ref<HTMLCanvasElement | null>,
  focusConfig: Ref<FocusConfig> = ref(createDefaultFocusConfig())
) {
  const cursorX = ref(0)
  const cursorY = ref(0)
  const focusImageCache = ref<FocusImageCache | undefined>(undefined)
  let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
  let animationStartTime = 0

  /**
   * Loads or reloads the focus image from the configured URL.
   */
  function loadFocusImage() {
    if (!import.meta.client) return
    const url = focusConfig.value.imageUrl
    if (!url || focusConfig.value.type !== 'image') {
      focusImageCache.value = undefined
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      focusImageCache.value = { img, loaded: true, error: false }
    }
    img.onerror = () => {
      focusImageCache.value = { img, loaded: false, error: true }
    }
    img.src = url
  }

  /**
   * Sets up the mouse move handler for cursor-follow mode.
   */
  function setupMouseTracking(onDraw: () => void) {
    if (!import.meta.client) return
    removeMouseTracking()

    const canvas = canvasRef.value
    if (!canvas) return

    mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      cursorX.value = e.clientX - rect.left
      cursorY.value = e.clientY - rect.top
      if (focusConfig.value.enabled && focusConfig.value.positionMode === 'cursor') {
        onDraw()
      }
    }

    canvas.addEventListener('mousemove', mouseMoveHandler)
    if (focusConfig.value.enabled && focusConfig.value.positionMode === 'cursor') {
      canvas.style.cursor = 'none'
    }
  }

  /**
   * Removes the mouse move handler.
   */
  function removeMouseTracking() {
    const canvas = canvasRef.value
    if (canvas && mouseMoveHandler) {
      canvas.removeEventListener('mousemove', mouseMoveHandler)
      mouseMoveHandler = null
    }
    if (canvas) {
      canvas.style.cursor = ''
    }
  }

  /**
   * Draws the focus element on top of the spirals.
   * @param ctx - Canvas rendering context.
   * @param width - Canvas width.
   * @param height - Canvas height.
   * @param elapsed - Elapsed animation time in ms.
   */
  function drawFocusOnCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, elapsed: number) {
    const config = focusConfig.value
    if (!config.enabled) return

    if (config.positionMode === 'fixed') {
      drawFocus(ctx, config, width / 2, height / 2, focusImageCache.value)
    } else if (config.positionMode === 'cursor') {
      drawFocus(ctx, config, cursorX.value, cursorY.value, focusImageCache.value)
    } else if (config.positionMode === 'path') {
      const points = calculateFocusPath(config, width, height, elapsed)
      drawFocusPoints(ctx, config, points, focusImageCache.value)
    }
  }

  /**
   * Cleans up mouse tracking on unmount.
   */
  function cleanup() {
    removeMouseTracking()
  }

  return {
    cursorX,
    cursorY,
    focusImageCache,
    animationStartTime,
    setAnimationStartTime: (time: number) => { animationStartTime = time },
    getElapsed: () => Date.now() - animationStartTime,
    loadFocusImage,
    setupMouseTracking,
    removeMouseTracking,
    drawFocusOnCanvas,
    cleanup
  }
}
