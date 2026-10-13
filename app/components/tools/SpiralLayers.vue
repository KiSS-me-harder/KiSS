<template>
  <div class="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">
        Spiral Layers
      </h2>
      <NButton
        size="sm"
        color="primary"
        @click="$emit('addLayer')"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4" />
        Add Layer
      </NButton>
    </div>

    <div v-if="layers.length === 0" class="text-sm text-white/40 text-center py-4">
      No layers yet. Click "Add Layer" to start creating spirals.
    </div>

    <div v-for="(layer, index) in layers" :key="layer.id" class="space-y-3">
      <LayerItem
        :index="index + 1"
        :layer="layer"
        :can-remove="layers.length > 1"
        @update="(key, value) => $emit('updateLayer', layer.id, key, value)"
        @remove="$emit('removeLayer', layer.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LayerItem from './LayerItem.vue'

export interface SpiralLayer {
  id: number
  template: 'classic' | 'concentric' | 'wave' | 'double' | 'fractal' | 'helix' | 'starburst' | 'galaxy' | 'mandala' | 'dna' | 'kaleidoscope' | 'vortex'
  color: string
  size: number
  speed: number
  direction: 'forward' | 'backward'
  angle: number
  cumulativeAngle?: number
  intensity: number
}

withDefaults(defineProps<{
  layers?: SpiralLayer[]
}>(), {
  layers: () => []
})

defineEmits<{
  addLayer: []
  removeLayer: [id: number]
  updateLayer: [id: number, key: string, value: unknown]
}>()
</script>
