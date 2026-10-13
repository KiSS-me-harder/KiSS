import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'
import type { FocusConfig } from '~/utils/spiralFocus'
import { writeSpiralHashToUrl, readSpiralHashFromUrl, restoreLayer } from '~/utils/spiralHashState'

/**
 * Composable for managing URL hash-based state for spiral visuals.
 * Handles loading state from hash on init, writing updates live,
 * and responding to browser back/forward navigation.
 * @param layers - Reactive array of spiral layers.
 * @param focusConfig - Reactive focus configuration.
 * @param drawSpiral - Callback to redraw the spiral canvas (optional).
 */
export function useSpiralHashState(
  layers: Ref<SpiralLayer[]>,
  focusConfig: Ref<FocusConfig>,
  drawSpiral?: () => void
) {
  /**
   * Updates the URL hash to reflect the current spiral state.
   */
  function updateHash() {
    writeSpiralHashToUrl(layers.value, focusConfig.value)
  }

  /**
   * Handles browser hash change events to restore state when navigating back/forward.
   * @param draw - Optional callback to redraw the canvas after restoring state.
   */
  function onHashChange(draw?: () => void) {
    const state = readSpiralHashFromUrl()
    if (state) {
      layers.value = state.layers.map((hl, i) => restoreLayer(hl, Date.now() + i))
      focusConfig.value = state.focus
      if (draw) {
        draw()
      }
    }
  }

  /**
   * Sets up the hashchange event listener.
   * Should be called on mount.
   */
  function setupListener() {
    if (import.meta.client) {
      window.addEventListener('hashchange', () => onHashChange(drawSpiral))
    }
  }

  /**
   * Removes the hashchange event listener.
   * Should be called on unmount.
   */
  function cleanupListener() {
    if (import.meta.client) {
      window.removeEventListener('hashchange', () => onHashChange(drawSpiral))
    }
  }

  return {
    updateHash,
    onHashChange,
    setupListener,
    cleanupListener
  }
}
