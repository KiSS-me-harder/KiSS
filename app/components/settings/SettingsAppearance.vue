<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-palette" class="size-5 text-white/40" />
        <h2 class="text-lg font-semibold text-white">
          Appearance
        </h2>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <label class="text-xs text-white/40 uppercase tracking-wider">Theme</label>
        <USelect
          :model-value="theme"
          :items="themeOptions"
          class="mt-1"
          @update:model-value="update('theme', $event)"
        />
      </div>
      <div>
        <label class="text-xs text-white/40 uppercase tracking-wider">Font Size</label>
        <USelect
          :model-value="fontSize"
          :items="fontSizeOptions"
          class="mt-1"
          @update:model-value="update('fontSize', $event)"
        />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Compact Mode
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Reduce spacing for more content
          </p>
        </div>
        <USwitch :model-value="compactMode" @update:model-value="update('compactMode', $event)" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  settings: {
    theme: string
    fontSize: string
    compactMode: boolean
  }
  themeOptions: string[]
  fontSizeOptions: string[]
}>()

const emit = defineEmits<{
  'update:settings': [settings: typeof props.settings]
}>()

const theme = computed(() => props.settings.theme)
const fontSize = computed(() => props.settings.fontSize)
const compactMode = computed(() => props.settings.compactMode)

function update(key: keyof typeof props.settings, value: string | boolean) {
  emit('update:settings', { ...props.settings, [key]: value })
}
</script>
