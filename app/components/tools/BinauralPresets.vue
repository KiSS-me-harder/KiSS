<template>
  <div class="flex justify-center items-center gap-4 pt-4 pb-2">
    <button
      v-for="(preset, index) in presets"
      :key="preset.name"
      class="flex flex-col items-center gap-1 group"
      @click="$emit('select', index)"
    >
      <div
        class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
        :style="{
          borderColor: 'rgba(255,255,255,0.3)',
          backgroundColor: 'rgba(255,255,255,0.05)'
        }"
      >
        <span class="text-lg">{{ preset.icon }}</span>
      </div>
      <span class="text-xs text-white/50 group-hover:text-white/80 transition-colors">
        {{ preset.name.split(' ')[0] }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  presets: { name: string, icon: string }[]
}>()

defineEmits<{
  select: [index: number]
}>()
</script>
