<template>
  <div class="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">
        Focus
      </h2>
      <NButton
        size="xs"
        variant="subtle"
        color="gray"
        @click="toggleEnabled"
      >
        <UIcon v-if="localConfig.enabled" name="i-lucide-eye" class="w-4 h-4" />
        <UIcon v-else name="i-lucide-eye-off" class="w-4 h-4" />
        {{ localConfig.enabled ? 'Enabled' : 'Disabled' }}
      </NButton>
    </div>

    <div v-if="localConfig.enabled" class="space-y-4">
      <!-- Focus Type -->
      <div>
        <label class="block text-sm font-medium text-white/60 mb-2">Focus Type</label>
        <div class="flex gap-2">
          <NButton
            size="xs"
            :color="localConfig.type === 'dot' ? 'primary' : 'gray'"
            variant="soft"
            @click="update('type', 'dot')"
          >
            <UIcon name="i-lucide-circle" class="w-3.5 h-3.5" /> Dot
          </NButton>
          <NButton
            size="xs"
            :color="localConfig.type === 'preset' ? 'primary' : 'gray'"
            variant="soft"
            @click="update('type', 'preset')"
          >
            <UIcon name="i-lucide-shapes" class="w-3.5 h-3.5" /> Preset
          </NButton>
          <NButton
            size="xs"
            :color="localConfig.type === 'image' ? 'primary' : 'gray'"
            variant="soft"
            @click="update('type', 'image')"
          >
            <UIcon name="i-lucide-image" class="w-3.5 h-3.5" /> Image
          </NButton>
        </div>
      </div>

      <!-- Color and Size for dot/preset -->
      <div v-if="localConfig.type !== 'image'" class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-white/60 mb-1">Color</label>
          <input
            :value="localConfig.color"
            type="color"
            class="w-full h-8 rounded cursor-pointer bg-white/5 border border-white/10"
            @input="update('color', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-white/60 mb-1">Size: {{ localConfig.size }}px</label>
          <input
            :value="localConfig.size"
            type="range"
            min="10"
            max="100"
            step="1"
            class="w-full"
            @input="update('size', Number(($event.target as HTMLInputElement).value))"
          >
        </div>
      </div>

      <!-- Preset shape selection -->
      <div v-if="localConfig.type === 'preset'">
        <label class="block text-sm font-medium text-white/60 mb-2">Shape</label>
        <FocusPresetSelector :selected="localConfig.presetType" @select="update('presetType', $event)" />
      </div>

      <!-- Image URL for image type -->
      <div v-if="localConfig.type === 'image'" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-white/60 mb-1">Image URL</label>
          <NInput :value="localConfig.imageUrl" placeholder="https://example.com/focus-image.png" @update:value="update('imageUrl', $event)" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-white/60 mb-1">Size: {{ localConfig.size }}px</label>
            <input
              :value="localConfig.size"
              type="range"
              min="10"
              max="200"
              step="1"
              class="w-full"
              @input="update('size', Number(($event.target as HTMLInputElement).value))"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-white/60 mb-1">Fallback Color</label>
            <input
              :value="localConfig.color"
              type="color"
              class="w-full h-8 rounded cursor-pointer bg-white/5 border border-white/10"
              @input="update('color', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>

      <!-- Position Mode -->
      <div>
        <label class="block text-sm font-medium text-white/60 mb-2">Position Mode</label>
        <div class="flex gap-2">
          <NButton
            size="xs"
            :color="localConfig.positionMode === 'fixed' ? 'primary' : 'gray'"
            variant="soft"
            @click="update('positionMode', 'fixed')"
          >
            <UIcon name="i-lucide-pin" class="w-3.5 h-3.5" /> Fixed Center
          </NButton>
          <NButton
            size="xs"
            :color="localConfig.positionMode === 'cursor' ? 'primary' : 'gray'"
            variant="soft"
            @click="update('positionMode', 'cursor')"
          >
            <UIcon name="i-lucide-pointer" class="w-3.5 h-3.5" /> Follow Cursor
          </NButton>
          <NButton
            size="xs"
            :color="localConfig.positionMode === 'path' ? 'primary' : 'gray'"
            variant="soft"
            @click="update('positionMode', 'path')"
          >
            <UIcon name="i-lucide-route" class="w-3.5 h-3.5" /> Path
          </NButton>
        </div>
      </div>

      <!-- Path settings -->
      <FocusPathSelector
        v-if="localConfig.positionMode === 'path'"
        :selected="localConfig.pathType"
        :speed="localConfig.pathSpeed"
        @select="update('pathType', $event)"
        @update:speed="update('pathSpeed', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FocusConfig } from '~/utils/spiralFocus'
import FocusPresetSelector from './FocusPresetSelector.vue'
import FocusPathSelector from './FocusPathSelector.vue'

const props = defineProps<{ config: FocusConfig }>()
const emit = defineEmits<{ update: [config: FocusConfig] }>()

const localConfig = ref<FocusConfig>({ ...props.config })
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

function update(key: keyof FocusConfig, value: unknown) {
  localConfig.value = { ...localConfig.value, [key]: value }
  emit('update', localConfig.value)
}

function toggleEnabled() {
  update('enabled', !localConfig.value.enabled)
}
</script>
