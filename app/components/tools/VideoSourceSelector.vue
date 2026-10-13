<template>
  <NCard>
    <template #header>
      <h3 class="font-semibold text-white">
        Load Video
      </h3>
    </template>

    <div class="space-y-4">
      <!-- Tab Selection -->
      <div class="flex gap-2">
        <NButton
          :color="sourceMode === 'file' ? 'primary' : 'white'"
          variant="soft"
          size="sm"
          @click="sourceMode = 'file'"
        >
          Upload File
        </NButton>
        <NButton
          :color="sourceMode === 'url' ? 'primary' : 'white'"
          variant="soft"
          size="sm"
          @click="sourceMode = 'url'"
        >
          Use URL
        </NButton>
      </div>

      <!-- File Upload -->
      <div v-if="sourceMode === 'file'" class="space-y-2">
        <label class="block text-sm text-white/70">
          Select a video file from your device
        </label>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
          @change="handleFileUpload"
        >
      </div>

      <!-- URL Input -->
      <div v-if="sourceMode === 'url'" class="space-y-2">
        <label class="block text-sm text-white/70">
          Enter the video URL
        </label>
        <NInputGroup>
          <NInput
            v-model="videoUrl"
            type="url"
            placeholder="https://example.com/video.mp4"
          />
          <NButton
            color="primary"
            :disabled="!videoUrl"
            @click="loadFromUrl"
          >
            Load
          </NButton>
        </NInputGroup>
        <p class="text-xs text-white/40">
          Note: The video URL must allow cross-origin access (CORS) for blur processing to work.
        </p>
      </div>
    </div>
  </NCard>
</template>

<script setup lang="ts">
const sourceMode = defineModel<'file' | 'url'>('sourceMode', { default: 'file' })
const videoUrl = defineModel<string>('videoUrl', { default: '' })

const fileInput = ref<HTMLInputElement | null>(null)

/**
 * Emits the loaded event when a file is selected.
 * @param event - The file input change event.
 */
function handleFileUpload(event: Event) {
  emit('loaded', event)
}

/**
 * Emits the load-url event when the URL load button is clicked.
 */
function loadFromUrl() {
  emit('loadUrl')
}

const emit = defineEmits<{
  loaded: [event: Event]
  loadUrl: []
}>()
</script>
