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
            Video Censor
          </h1>
          <p class="text-white/60 mt-1">
            Censor videos by blurring content in real-time. All processing happens locally in your browser — your videos are never uploaded.
          </p>
        </div>

        <!-- Privacy Notice -->
        <NCard class="bg-green-900/20 border-green-700/30">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 class="font-semibold text-green-300">
                Privacy First
              </h3>
              <p class="text-sm text-green-200/70 mt-1">
                All video processing happens locally in your browser. Your video files are never uploaded to any server.
              </p>
            </div>
          </div>
        </NCard>

        <!-- Video Source Selection -->
        <VideoSourceSelector
          v-model:source-mode="sourceMode"
          v-model:video-url="videoUrl"
          @loaded="handleFileUpload"
          @load-url="loadFromUrl"
        />

        <!-- Video Player with Blur -->
        <VideoPlayer
          v-if="videoSrc"
          :src="videoSrc"
          :blur-enabled="blurEnabled"
          :blur-intensity="blurIntensity"
          @update:blur-enabled="blurEnabled = $event"
          @update:blur-intensity="blurIntensity = $event"
        />

        <!-- Empty State -->
        <NCard v-else>
          <div class="flex flex-col items-center justify-center py-12 text-white/40">
            <UIcon name="i-lucide-video" class="w-12 h-12 mb-3" />
            <p class="text-lg font-medium">
              No video loaded
            </p>
            <p class="text-sm mt-1">
              Upload a file or enter a URL above to get started.
            </p>
          </div>
        </NCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const breadcrumbs = [
  { label: 'Tools', to: '/tools' },
  { label: 'Video Censor' }
]

useHead({
  title: 'Video Censor — KiSS'
})

// ── State ──

const sourceMode = ref<'file' | 'url'>('file')
const videoUrl = ref('')
const videoSrc = ref('')
const blurEnabled = ref(true)
const blurIntensity = ref(10)

// ── Video Loading ──

/**
 * Handles file upload and loads the video into the player.
 * @param event - The file input change event.
 */
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  videoSrc.value = URL.createObjectURL(file)
}

/**
 * Loads a video from a URL.
 */
function loadFromUrl() {
  if (!videoUrl.value) return
  videoSrc.value = videoUrl.value
}
</script>
