<template>
  <div class="flex gap-2 flex-wrap">
    <NButton
      v-for="preset in presetOptions"
      :key="preset.value"
      size="xs"
      :color="selected === preset.value ? 'primary' : 'gray'"
      variant="soft"
      @click="$emit('select', preset.value)"
    >
      <UIcon :name="preset.icon" class="w-3.5 h-3.5" />
      {{ preset.label }}
    </NButton>
  </div>
</template>

<script setup lang="ts">
import type { FocusPreset } from '~/utils/spiralFocus'

defineProps<{
  selected: FocusPreset
}>()

defineEmits<{
  select: [value: FocusPreset]
}>()

const presetOptions = [
  { value: 'star' as FocusPreset, label: 'Star', icon: 'i-lucide-star' },
  { value: 'heart' as FocusPreset, label: 'Heart', icon: 'i-lucide-heart' },
  { value: 'diamond' as FocusPreset, label: 'Diamond', icon: 'i-lucide-diamond' },
  { value: 'cross' as FocusPreset, label: 'Cross', icon: 'i-lucide-plus' },
  { value: 'triangle' as FocusPreset, label: 'Triangle', icon: 'i-lucide-triangle' }
]
</script>
