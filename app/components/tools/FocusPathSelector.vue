<template>
  <div class="space-y-3">
    <div>
      <label class="block text-sm font-medium text-white/60 mb-2">
        Path Type
      </label>
      <div class="flex gap-2 flex-wrap">
        <NButton
          v-for="path in pathOptions"
          :key="path.value"
          size="xs"
          :color="selected === path.value ? 'primary' : 'gray'"
          variant="soft"
          @click="$emit('select', path.value)"
        >
          <UIcon :name="path.icon" class="w-3.5 h-3.5" />
          {{ path.label }}
        </NButton>
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium text-white/60 mb-1">
        Path Speed: {{ speed }}
      </label>
      <input
        :value="speed"
        type="range"
        min="1"
        max="100"
        step="1"
        class="w-full"
        @input="$emit('update:speed', Number(($event.target as HTMLInputElement).value))"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FocusPathType } from '~/utils/spiralFocus'

defineProps<{
  selected: FocusPathType
  speed: number
}>()

defineEmits<{
  'select': [value: FocusPathType]
  'update:speed': [value: number]
}>()

const pathOptions = [
  { value: 'pendulum' as FocusPathType, label: 'Pendulum', icon: 'i-lucide-move-horizontal' },
  { value: 'dual-spiral' as FocusPathType, label: 'Dual Spiral', icon: 'i-lucide-git-merge' },
  { value: 'minigame' as FocusPathType, label: 'Minigame', icon: 'i-lucide-gamepad-2' }
]
</script>
