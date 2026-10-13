<template>
  <div class="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-white/80">
        Layer {{ index }}
      </span>
      <NButton
        size="xs"
        color="error"
        variant="subtle"
        :disabled="!canRemove"
        @click="$emit('remove')"
      >
        <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
        Remove
      </NButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Template -->
      <div>
        <label class="block text-xs font-medium text-white/60 mb-1">
          Template
        </label>
        <TemplateSelector
          :model-value="layer.template"
          @update:model-value="(val) => $emit('update', 'template', val)"
        />
      </div>

      <!-- Color -->
      <div>
        <label class="block text-xs font-medium text-white/60 mb-1">
          Color
        </label>
        <div class="flex items-center gap-2">
          <input
            :value="colorInputValue"
            type="color"
            class="w-10 h-8 rounded border border-white/20 bg-white/5 cursor-pointer"
            @input="(e) => $emit('update', 'color', (e.target as HTMLInputElement).value)"
          >
          <span class="text-xs text-white/40">{{ colorLabel }}</span>
        </div>
      </div>

      <!-- Size -->
      <div>
        <label class="block text-xs font-medium text-white/60 mb-1">
          Size: {{ Math.round(layer.size) }}%
        </label>
        <input
          type="range"
          :value="layer.size"
          :min="10"
          :max="300"
          :step="5"
          class="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
          :style="{
            background: `linear-gradient(to right, #8b5cf6 ${(layer.size - 10) / 290 * 100}%, rgba(255,255,255,0.1) ${(layer.size - 10) / 290 * 100}%)`
          }"
          @input="(e) => $emit('update', 'size', Number((e.target as HTMLInputElement).value))"
        >
      </div>

      <!-- Speed -->
      <div>
        <label class="block text-xs font-medium text-white/60 mb-1">
          Speed: {{ layer.speed }}
        </label>
        <input
          type="range"
          :value="layer.speed"
          :min="1"
          :max="100"
          :step="1"
          class="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
          :style="{
            background: `linear-gradient(to right, #8b5cf6 ${(layer.speed - 1) / 99 * 100}%, rgba(255,255,255,0.1) ${(layer.speed - 1) / 99 * 100}%)`
          }"
          @input="(e) => $emit('update', 'speed', Number((e.target as HTMLInputElement).value))"
        >
      </div>

      <!-- Direction -->
      <div>
        <label class="block text-xs font-medium text-white/60 mb-1">
          Direction
        </label>
        <select
          :value="layer.direction"
          class="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
          @change="(e) => $emit('update', 'direction', (e.target as HTMLSelectElement).value)"
        >
          <option value="forward" class="bg-gray-900">
            Forward
          </option>
          <option value="backward" class="bg-gray-900">
            Backward
          </option>
        </select>
      </div>

      <!-- Intensity -->
      <div>
        <label class="block text-xs font-medium text-white/60 mb-1">
          Intensity: {{ layer.intensity }}
        </label>
        <input
          type="range"
          :value="layer.intensity"
          :min="1"
          :max="12"
          :step="1"
          class="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
          :style="{
            background: `linear-gradient(to right, #8b5cf6 ${(layer.intensity - 1) / 11 * 100}%, rgba(255,255,255,0.1) ${(layer.intensity - 1) / 11 * 100}%)`
          }"
          @input="(e) => $emit('update', 'intensity', Number((e.target as HTMLInputElement).value))"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SpiralLayer } from './SpiralLayers.vue'
import TemplateSelector from './TemplateSelector.vue'
import { isThemeColorName, resolveThemeColor } from '~/utils/spiralDrawing'

const props = defineProps<{
  index: number
  layer: SpiralLayer
  canRemove: boolean
}>()

const { layer } = toRefs(props)

defineEmits<{
  update: [key: string, value: unknown]
  remove: []
}>()

/**
 * Displays the color label - shows theme name if it's a theme color, otherwise the hex value.
 */
const colorLabel = computed(() => {
  if (!layer.value.color) return '#8b5cf6'
  return isThemeColorName(layer.value.color) ? layer.value.color : layer.value.color
})

/**
 * Provides a hex value for the color input element.
 * If the color is a theme name, resolves it to hex for the input.
 */
const colorInputValue = computed(() => {
  if (!layer.value.color) return '#8b5cf6'
  if (isThemeColorName(layer.value.color)) {
    return resolveThemeColor(layer.value.color)
  }
  return layer.value.color
})
</script>

<style scoped>
.range-slider {
  height: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.range-slider::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 9999px;
}

.range-slider::-moz-range-track {
  height: 8px;
  border-radius: 9999px;
  background: transparent;
}
</style>
