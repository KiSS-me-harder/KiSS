<template>
  <Transition name="slide-up">
    <div v-if="mediaPlayer.currentMedia" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <div class="rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden">
        <!-- Progress Bar -->
        <div class="h-1 bg-white/10 w-full">
          <div
            class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
            :style="{ width: `${mediaPlayer.progress}%` }"
          />
        </div>

        <!-- Binaural Beats Audio Engine (invisible) -->
        <BinauralBeats
          :enabled="mediaPlayer.binauralEnabled"
          :volume="mediaPlayer.binauralVolume"
          :mode="mediaPlayer.binauralMode"
          :channels="mediaPlayer.binauralChannels"
          :tracks="mediaPlayer.binauralTracks"
          :selected-track-index="mediaPlayer.selectedTrackIndex"
          :playing="mediaPlayer.isPlaying"
          :auto-beat-frequency="mediaPlayer.autoDetectedBeatFrequency"
          :media-element="mediaPlayer.mediaElement"
        />

        <!-- Haptics Engine (invisible) -->
        <HapticsEngine
          :enabled="mediaPlayer.hapticsEnabled"
          :intensity="mediaPlayer.hapticsIntensity"
          :mode="mediaPlayer.hapticsMode"
          :pattern="getCurrentPattern()"
          :playing="mediaPlayer.isPlaying"
          :media-element="mediaPlayer.mediaElement"
        />

        <!-- Spiral View -->
        <div v-if="mediaPlayer.showSpiral" class="relative w-full" style="height: 280px;">
          <HypnoticSpiral :playing="mediaPlayer.isPlaying" />
          <MediaPlayerBinauralControls :get-selected-track-description="getSelectedTrackDescription" />

          <!-- Overlay info on spiral (hidden when binaural controls are shown) -->
          <div
            v-if="!mediaPlayer.binauralEnabled"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="text-center">
              <p class="text-white text-lg font-bold drop-shadow-lg">
                {{ mediaPlayer.currentMedia?.title }}
              </p>
              <p v-if="mediaPlayer.currentMedia?.author" class="text-white/70 text-sm mt-1 drop-shadow">
                {{ mediaPlayer.currentMedia.author }}
              </p>
            </div>
          </div>

          <!-- Controls overlay -->
          <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-2 pointer-events-auto">
            <button
              class="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              title="Play/Pause"
              @click="togglePlay"
            >
              <UIcon :name="mediaPlayer.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" class="w-5 h-5 text-white" />
            </button>
            <button
              class="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
              :class="mediaPlayer.binauralEnabled ? 'bg-purple-500/60 hover:bg-purple-500/80' : 'bg-black/50 hover:bg-black/70'"
              title="Toggle binaural beats"
              @click="mediaPlayer.toggleBinaural()"
            >
              <UIcon name="i-lucide-headphones" class="w-5 h-5 text-white" />
            </button>
            <button
              class="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
              :class="mediaPlayer.hapticsEnabled ? 'bg-orange-500/60 hover:bg-orange-500/80' : 'bg-black/50 hover:bg-black/70'"
              title="Toggle haptics"
              @click="mediaPlayer.toggleHaptics()"
            >
              <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
            </button>
            <button
              class="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              title="Show cover art"
              @click="mediaPlayer.toggleSpiral()"
            >
              <UIcon name="i-lucide-image" class="w-5 h-5 text-white" />
            </button>
            <NuxtLink
              :to="mediaPlayer.currentMedia?.currentPage || '/library'"
              class="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              title="Open media page"
            >
              <UIcon name="i-lucide-external-link" class="w-5 h-5 text-white" />
            </NuxtLink>
            <button
              class="w-10 h-10 rounded-full bg-black/50 hover:bg-red-500/50 backdrop-blur-sm flex items-center justify-center transition-colors"
              title="Stop playing"
              @click="close"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <!-- Cover Art View -->
        <MediaPlayerCoverArt
          v-else
          :format-time="formatTime"
          :toggle-play="togglePlay"
          :close="close"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const mediaPlayer = useMediaPlayerStore()

// Listen for tempo detection events from BinauralBeats component
useEventListener(window, 'binaural-tempo-detected', (event: Event) => {
  const bpm = (event as CustomEvent).detail
  if (typeof bpm === 'number') {
    mediaPlayer.setAutoDetectedBpm(bpm)
  }
})

function getCurrentPattern() {
  const index = mediaPlayer.hapticsPatternIndex
  const patterns = mediaPlayer.hapticPatterns
  if (patterns[index]) {
    return patterns[index]
  }
  return patterns[0] || null
}

function getSelectedTrackDescription() {
  const track = mediaPlayer.binauralTracks[mediaPlayer.selectedTrackIndex]
  return track?.description || ''
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  // Dispatch custom event to the actual media element
  window.dispatchEvent(new CustomEvent('media-player-toggle'))
}

function close() {
  // Dispatch custom event to stop the actual media element
  window.dispatchEvent(new CustomEvent('media-player-stop'))
  mediaPlayer.clearMedia()
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}
</style>
