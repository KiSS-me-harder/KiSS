<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="breadcrumbs" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-white">
            Spiral Visuals Creator
          </h1>
          <p class="text-white/60 mt-1">
            Create and customize hypnotic spiral visual effects for focus and relaxation.
          </p>
        </div>

        <!-- Canvas container -->
        <div
          ref="canvasContainerRef"
          class="rounded-xl border border-white/10 bg-black/50 flex items-center justify-center relative"
          :style="{ minHeight: '400px' }"
        >
          <!-- Fullscreen button (hidden when fullscreen) -->
          <NButton
            v-if="!isFullscreen"
            class="absolute top-4 right-4 z-30"
            color="gray"
            variant="ghost"
            size="sm"
            @click="toggleFullscreen"
          >
            <UIcon name="i-lucide-maximize-2" class="w-4 h-4" />
          </NButton>
          <canvas
            ref="canvasRef"
            class="w-full h-full rounded-xl"
          />
          <!-- Centered play/pause button overlay -->
          <div
            v-if="!isPlaying"
            class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <NButton
              class="pointer-events-auto"
              color="gray"
              variant="soft"
              size="xl"
              @click="togglePlay"
            >
              <UIcon
                name="i-lucide-play"
                class="w-12 h-12 text-white/80 ml-1"
              />
            </NButton>
          </div>
        </div>

        <!-- Presets -->
        <SpiralPresets @apply="applyPreset" />

        <!-- Focus settings -->
        <FocusSettings :config="focusConfig" @update="updateFocusConfig" />

        <!-- Layer controls -->
        <SpiralLayers
          :layers="layers"
          @add-layer="addLayer"
          @remove-layer="removeLayer"
          @update-layer="updateLayer"
        />

        <!-- Info -->
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-lg font-semibold text-white mb-2">
            Hypnotic Spirals
          </h2>
          <p class="text-sm text-white/60">
            Hypnotic spiral visuals can help with focus and relaxation by providing a steady,
            mesmerizing visual pattern. Add multiple layers, adjust their size, speed, and
            direction to create complex visual effects.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import SpiralLayers from '~/components/tools/SpiralLayers.vue'
import SpiralPresets from '~/components/tools/SpiralPresets.vue'
import FocusSettings from '~/components/tools/FocusSettings.vue'
import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'
import type { SpiralPreset } from '~/components/tools/SpiralPresets.vue'
import { createDefaultFocusConfig } from '~/utils/spiralFocus'
import type { FocusConfig } from '~/utils/spiralFocus'
import { isThemeColorName, resolveThemeColor, themeColorNames } from '~/utils/spiralDrawing'
import { readSpiralHashFromUrl, restoreLayer } from '~/utils/spiralHashState'
import { useSpiralHashState } from '~/composables/useSpiralHashState'

const breadcrumbs = [
  { label: 'Tools', to: '/tools' },
  { label: 'Spiral Visuals Creator' }
]

// Load state from URL hash if present, otherwise use defaults
const hashState = readSpiralHashFromUrl()
const layers = ref<SpiralLayer[]>(
  hashState
    ? hashState.layers.map((hl, i) => restoreLayer(hl, Date.now() + i))
    : [{
        id: Date.now(),
        template: 'classic',
        color: 'primary',
        size: 100,
        speed: 50,
        direction: 'forward',
        angle: 0,
        intensity: 1
      }]
)

const focusConfig = ref<FocusConfig>(hashState ? hashState.focus : createDefaultFocusConfig())

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasContainerRef = ref<HTMLDivElement | null>(null)

const {
  isPlaying,
  isFullscreen,
  startAnimation,
  stopAnimation,
  toggleFullscreen,
  drawSpiral,
  init,
  cleanup,
  loadFocusImage,
  setupMouseTracking
} = useSpiralAnimation(canvasRef, canvasContainerRef, layers, focusConfig)

const { updateHash, setupListener, cleanupListener } = useSpiralHashState(layers, focusConfig, drawSpiral)

/**
 * Toggles play/pause state.
 */
function togglePlay() {
  if (isPlaying.value) {
    stopAnimation()
  } else {
    startAnimation()
  }
}

/**
 * Handles keyboard events for spacebar toggle and fullscreen.
 * @param event - The keyboard event.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.code === 'Space' && event.target === document.body) {
    event.preventDefault()
    togglePlay()
  }
  if (event.code === 'KeyF' && event.target === document.body) {
    event.preventDefault()
    toggleFullscreen()
  }
}

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
  // Resolve theme color name to hex value on client side
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
 * Applies a preset configuration, replacing all current layers.
 * @param preset - The preset to apply.
 */
function applyPreset(preset: SpiralPreset) {
  layers.value = preset.layers.map((layer, index) => ({
    ...layer,
    id: Date.now() + index,
    angle: 0
  }))
  // Resolve theme color names to hex values on client side
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
 * Updates the focus configuration and triggers side effects.
 * @param config - The new focus configuration.
 */
function updateFocusConfig(config: FocusConfig) {
  focusConfig.value = config
  // Reload image if URL changed
  if (config.type === 'image' && config.imageUrl) {
    loadFocusImage()
  }
  // Re-setup mouse tracking if position mode changed
  if (config.positionMode === 'cursor' && config.enabled) {
    setupMouseTracking()
  }
  if (!isPlaying.value) {
    drawSpiral()
  }
  updateHash()
}

// Setup keyboard listener and canvas
onMounted(() => {
  // Resolve theme color names to their actual hex values
  for (const layer of layers.value) {
    if (isThemeColorName(layer.color)) {
      layer.color = resolveThemeColor(layer.color)
    }
  }
  init()
  if (import.meta.client) {
    document.addEventListener('keydown', onKeydown)
    updateHash()
    setupListener()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
  if (import.meta.client) {
    document.removeEventListener('keydown', onKeydown)
    cleanupListener()
  }
})

useHead({
  title: 'Spiral Visuals Creator — KiSS'
})
</script>
