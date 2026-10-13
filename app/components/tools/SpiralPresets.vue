<template>
  <div class="rounded-xl border border-white/10 bg-white/5 p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">
        Presets
      </h2>
      <NButton
        size="xs"
        variant="subtle"
        color="gray"
        @click="isExpanded = !isExpanded"
      >
        <UIcon
          name="i-lucide-chevron-down"
          class="w-4 h-4 transition-transform"
          :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
        />
        {{ isExpanded ? 'Show less' : 'Show more' }}
      </NButton>
    </div>

    <div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <div
        v-for="preset in visiblePresets"
        :key="preset.name"
        class="group relative rounded-lg border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        @click="$emit('apply', preset)"
      >
        <div class="flex flex-col items-center text-center gap-2">
          <UIcon
            :name="preset.icon"
            class="w-8 h-8 text-white/60 group-hover:text-white/80 transition-colors"
          />
          <span class="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            {{ preset.name }}
          </span>
          <span class="text-xs text-white/40">
            {{ preset.layers.length }} layer{{ preset.layers.length > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { presets } from '../../utils/spiralPresets.data'
import type { SpiralPreset } from '../../utils/spiralPresets.data'

defineEmits<{
  apply: [preset: SpiralPreset]
}>()

const isExpanded = ref(false)

/** Number of columns per breakpoint for calculating first row size. */
const columnsPerBreakpoint = { sm: 2, md: 3, lg: 4, xl: 6 }

/** Calculate how many presets fit in one row based on screen width. */
const firstRowSize = computed(() => {
  if (typeof window === 'undefined') return columnsPerBreakpoint.xl
  const width = window.innerWidth
  if (width >= 1280) return columnsPerBreakpoint.xl
  if (width >= 1024) return columnsPerBreakpoint.lg
  if (width >= 768) return columnsPerBreakpoint.md
  return columnsPerBreakpoint.sm
})

/** Presets to display — limited to one row when collapsed. */
const visiblePresets = computed(() => {
  if (isExpanded.value) return presets
  return presets.slice(0, firstRowSize.value)
})
</script>
