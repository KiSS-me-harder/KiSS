<template>
  <NCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-white">
          Video Player
        </h3>
        <div class="flex items-center gap-2">
          <NToggle
            :model-value="blurEnabled"
            on-icon="i-lucide-eye-off"
            off-icon="i-lucide-eye"
            on-color="purple"
            off-color="zinc"
            size="sm"
            @update:model-value="$emit('update:blurEnabled', $event)"
          />
          <span class="text-sm text-white/70">
            {{ blurEnabled ? 'Blur Enabled' : 'Blur Disabled' }}
          </span>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Video Container -->
      <div class="relative w-full bg-black rounded-lg overflow-hidden" style="aspect-ratio: 16/9;">
        <video
          ref="sourceVideo"
          class="hidden"
          crossorigin="anonymous"
          playsinline
          @loadedmetadata="onVideoLoaded"
          @ended="onVideoEnded"
        />
        <canvas
          ref="canvas"
          class="w-full h-full"
        />
      </div>

      <!-- Blur Intensity Control -->
      <div v-if="blurEnabled" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm text-white/70">
            Blur Intensity
          </label>
          <span class="text-sm text-white/50">
            {{ blurIntensity }}px
          </span>
        </div>
        <NRangeSlider
          :model-value="blurIntensity"
          :min="1"
          :max="50"
          :step="1"
          @update:model-value="$emit('update:blurIntensity', $event)"
        />
      </div>

      <!-- Video Controls -->
      <div class="flex items-center gap-2">
        <NButton
          color="primary"
          size="sm"
          :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
          @click="togglePlay"
        >
          {{ isPlaying ? 'Pause' : 'Play' }}
        </NButton>
        <NButton
          color="white"
          variant="ghost"
          size="sm"
          icon="i-lucide-rotate-ccw"
          @click="restartVideo"
        >
          Restart
        </NButton>
        <span class="text-sm text-white/50 ml-auto">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
      </div>
    </div>
  </NCard>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  blurEnabled?: boolean
  blurIntensity?: number
}>(), {
  blurEnabled: true,
  blurIntensity: 10
})

const _emit = defineEmits<{
  'update:blurEnabled': [value: boolean]
  'update:blurIntensity': [value: number]
}>()

const sourceVideo = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

let animationFrameId: number | null = null
let animationRunning = false

// Set video source when prop changes
watch(() => props.src, (newSrc) => {
  if (newSrc && sourceVideo.value) {
    sourceVideo.value.src = newSrc
    sourceVideo.value.load()
  }
})

/**
 * Called when video metadata is loaded.
 */
function onVideoLoaded() {
  const video = sourceVideo.value
  const ctx = canvas.value?.getContext('2d')
  if (!video || !ctx || !canvas.value) return

  duration.value = video.duration
  canvas.value.width = video.videoWidth
  canvas.value.height = video.videoHeight

  drawFrame()
}

/**
 * Called when the video ends.
 */
function onVideoEnded() {
  isPlaying.value = false
  animationRunning = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

/**
 * Toggles play/pause state of the video.
 */
function togglePlay() {
  const video = sourceVideo.value
  if (!video) return

  if (isPlaying.value) {
    video.pause()
    isPlaying.value = false
    animationRunning = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  } else {
    video.play()
    isPlaying.value = true
    animationRunning = true
    renderLoop()
  }
}

/**
 * Restarts the video from the beginning.
 */
function restartVideo() {
  const video = sourceVideo.value
  if (!video) return

  video.currentTime = 0
  currentTime.value = 0

  if (!isPlaying.value) {
    drawFrame()
  }
}

/**
 * Renders the animation loop when video is playing.
 */
function renderLoop() {
  if (!animationRunning) return

  drawFrame()
  updateCurrentTime()

  animationFrameId = requestAnimationFrame(renderLoop)
}

/**
 * Draws the current video frame to the canvas, optionally with blur.
 */
function drawFrame() {
  const video = sourceVideo.value
  const ctx = canvas.value?.getContext('2d')
  if (!video || !ctx || !canvas.value) return

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  if (props.blurEnabled) {
    ctx.filter = `blur(${props.blurIntensity}px)`
  } else {
    ctx.filter = 'none'
  }

  ctx.drawImage(video, 0, 0, canvas.value.width, canvas.value.height)
}

/**
 * Updates the current time display.
 */
function updateCurrentTime() {
  const video = sourceVideo.value
  if (video) {
    currentTime.value = video.currentTime
  }
}

/**
 * Formats seconds into MM:SS time string.
 * @param seconds - The number of seconds to format.
 * @returns Formatted time string.
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Cleanup on unmount
onUnmounted(() => {
  animationRunning = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>
