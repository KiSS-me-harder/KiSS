<script setup lang="ts">
import { useMediaPlayerStore } from '~/stores/mediaPlayer'

const mediaPlayer = useMediaPlayerStore()

defineProps<{
  formatTime: (seconds: number) => string
  togglePlay: () => void
  close: () => void
}>()
</script>

<template>
  <div class="p-4">
    <div class="flex items-center gap-4">
      <!-- Media Icon/Thumbnail -->
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        :class="mediaPlayer.currentMedia?.type === 'video' ? 'bg-gradient-to-br from-emerald-500/80 to-green-600/80' : 'bg-gradient-to-br from-amber-500/80 to-orange-600/80'"
      >
        <img
          v-if="mediaPlayer.currentMedia?.thumbnail"
          :src="mediaPlayer.currentMedia.thumbnail"
          :alt="mediaPlayer.currentMedia.title"
          class="w-full h-full object-cover"
        >
        <UIcon
          v-else
          :name="mediaPlayer.currentMedia?.type === 'video' ? 'i-lucide-video' : 'i-lucide-headphones'"
          class="w-6 h-6 text-white/90"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="text-white text-sm font-semibold truncate">
          {{ mediaPlayer.currentMedia?.title }}
        </p>
        <div class="flex items-center gap-2 mt-0.5">
          <UBadge
            :label="mediaPlayer.currentMedia?.type === 'video' ? 'Video' : 'Audio'"
            :color="mediaPlayer.currentMedia?.type === 'video' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
          <span v-if="mediaPlayer.currentMedia?.author" class="text-white/40 text-xs">
            {{ mediaPlayer.currentMedia.author }}
          </span>
        </div>
      </div>

      <!-- Time -->
      <div class="text-white/40 text-xs tabular-nums flex-shrink-0 hidden sm:block">
        {{ formatTime(mediaPlayer.currentTime) }} / {{ formatTime(mediaPlayer.duration) }}
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          @click="togglePlay"
        >
          <UIcon :name="mediaPlayer.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" class="w-5 h-5 text-white" />
        </button>
        <button
          class="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-500/30 flex items-center justify-center transition-colors"
          title="Toggle hypnotic spiral"
          @click="mediaPlayer.toggleSpiral()"
        >
          <UIcon name="i-lucide-eye-off" class="w-5 h-5 text-white" />
        </button>
        <button
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          :class="mediaPlayer.binauralEnabled
            ? 'bg-purple-500/40 hover:bg-purple-500/60'
            : 'bg-white/10 hover:bg-purple-500/30'"
          title="Toggle binaural beats"
          @click="mediaPlayer.toggleBinaural()"
        >
          <UIcon name="i-lucide-headphones" class="w-5 h-5 text-white" />
        </button>
        <button
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          :class="mediaPlayer.hapticsEnabled
            ? 'bg-orange-500/40 hover:bg-orange-500/60'
            : 'bg-white/10 hover:bg-orange-500/30'"
          title="Toggle haptics"
          @click="mediaPlayer.toggleHaptics()"
        >
          <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
        </button>
        <NuxtLink
          :to="mediaPlayer.currentMedia?.currentPage || '/library'"
          class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Open media page"
        >
          <UIcon name="i-lucide-external-link" class="w-5 h-5 text-white" />
        </NuxtLink>
        <button
          class="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
          title="Stop playing"
          @click="close"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
