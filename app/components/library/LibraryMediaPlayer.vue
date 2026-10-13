<template>
  <div class="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
    <div v-if="type === 'image'" class="flex items-center justify-center bg-black/50 p-8">
      <img :src="url" :alt="title" class="max-w-full max-h-[70vh] object-contain rounded-lg">
    </div>

    <div v-else-if="type === 'video'" class="flex items-center justify-center bg-black/50 p-8">
      <video
        ref="videoEl"
        :src="url"
        :poster="thumbnail"
        controls
        class="max-w-full max-h-[70vh] rounded-lg"
        autoplay
        @play="onPlay"
        @pause="onPause"
        @timeupdate="onTimeupdate"
        @loadedmetadata="onLoadedmetadata"
        @ended="onEnded"
      >
        Your browser does not support the video element.
      </video>
    </div>

    <div v-else-if="type === 'audio'" class="flex flex-col items-center justify-center bg-black/50 p-12 gap-6">
      <div class="w-24 h-24 rounded-full flex items-center justify-center" :class="audioBgClass">
        <UIcon name="i-lucide-headphones" class="w-12 h-12 text-white/80" />
      </div>
      <div class="text-center">
        <h3 class="text-white text-lg font-semibold">
          {{ title }}
        </h3>
        <p class="text-white/50 text-sm mt-1">
          {{ author }}
        </p>
      </div>
      <audio
        ref="audioEl"
        :src="url"
        controls
        class="w-full max-w-md"
        autoplay
        @play="onPlay"
        @pause="onPause"
        @timeupdate="onTimeupdate"
        @loadedmetadata="onLoadedmetadata"
        @ended="onEnded"
      >
        Your browser does not support the audio element.
      </audio>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <UIcon name="i-lucide-file" class="w-12 h-12 text-white/20 mb-3" />
      <p class="text-white/40 text-sm">
        Unsupported media type
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: string
  url: string
  title: string
  author?: string
  thumbnail?: string
  audioBgClass: string
}>()

defineEmits<{
  play: []
  pause: []
  timeupdate: []
  loadedmetadata: []
  ended: []
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const audioEl = ref<HTMLAudioElement | null>(null)
</script>
