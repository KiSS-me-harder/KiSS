import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'
import type { SpiralPreset } from '~/components/tools/SpiralPresets.vue'
import { isThemeColorName, resolveThemeColor, themeColorNames } from '~/utils/spiralDrawing'

/**
 * Manages spiral layer state: adding, removing, updating, reordering, and applying presets.
 * @param layers - Reactive array of spiral layers.
 * @param isPlaying - Ref indicating whether the animation is playing.
 * @param drawSpiral - Function to redraw the spiral canvas.
 * @param updateHash - Function to update the URL hash with current state.
 * @returns Object with layer management functions.
 */
export function useSpiralLayers(
  layers: Ref<SpiralLayer[]>,
  isPlaying: Ref<boolean>,
  drawSpiral: () => void,
  updateHash: () => void
) {
  /**
   * Adds a new spiral layer with default settings.
   * New layers cycle through theme colors so they don't all default to primary.
   */
  function addLayer() {
    const layerCount = layers.value.length
    const colorIndex = layerCount % themeColorNames.length
    const themeColor = themeColorNames[colorIndex]
    layers.value.push({
      id: Date.now(),
      template: 'classic',
      color: themeColor,
      size: 100,
      speed: 50,
      direction: 'forward',
      angle: 0,
      intensity: 1
    })
    if (import.meta.client && isThemeColorName(themeColor)) {
      layers.value[layers.value.length - 1].color = resolveThemeColor(themeColor)
    }
    if (!isPlaying.value) {
      drawSpiral()
    }
    updateHash()
  }

  /**
   * Removes a spiral layer by ID.
   * @param id - The layer ID to remove.
   */
  function removeLayer(id: number) {
    if (layers.value.length <= 1) return
    const index = layers.value.findIndex(l => l.id === id)
    if (index !== -1) {
      layers.value.splice(index, 1)
      if (!isPlaying.value) {
        drawSpiral()
      }
      updateHash()
    }
  }

  /**
   * Updates a specific property of a spiral layer.
   * @param id - The layer ID to update.
   * @param key - The property name to update.
   * @param value - The new value.
   */
  function updateLayer(id: number, key: string, value: unknown) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) {
      ;(layer as Record<string, unknown>)[key] = value
      if (!isPlaying.value) {
        drawSpiral()
      }
      updateHash()
    }
  }

  /**
   * Reorders a spiral layer by swapping it with an adjacent layer.
   * @param index - The current index of the layer to move.
   * @param direction - The direction to move (-1 for up, 1 for down).
   */
  function reorderLayers(index: number, direction: number) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= layers.value.length) return
    const temp = layers.value[index]
    layers.value[index] = layers.value[newIndex]
    layers.value[newIndex] = temp
    if (!isPlaying.value) {
      drawSpiral()
    }
    updateHash()
  }

  /**
   * Applies a preset configuration, replacing all current layers.
   * @param preset - The preset to apply.
   */
  function applyPreset(preset: SpiralPreset) {
    layers.value = preset.layers.map((layer, index) => ({
      ...layer,
      id: Date.now() + index,
      angle: 0
    }))
    if (import.meta.client) {
      for (const layer of layers.value) {
        if (isThemeColorName(layer.color)) {
          layer.color = resolveThemeColor(layer.color)
        }
      }
    }
    if (!isPlaying.value) {
      drawSpiral()
    }
    updateHash()
  }

  /**
   * Resolves theme color names to hex values for all layers.
   * Called on mount after hydration.
   */
  function resolveThemeColors() {
    for (const layer of layers.value) {
      if (isThemeColorName(layer.color)) {
        layer.color = resolveThemeColor(layer.color)
      }
    }
  }

  return {
    addLayer,
    removeLayer,
    updateLayer,
    reorderLayers,
    applyPreset,
    resolveThemeColors
  }
}
