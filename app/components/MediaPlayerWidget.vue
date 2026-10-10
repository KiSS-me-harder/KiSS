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

          <!-- Binaural Controls Overlay -->
          <div
            v-if="mediaPlayer.binauralEnabled"
            class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <!-- Mode Selector -->
            <div class="flex gap-2 mb-3 pointer-events-auto">
              <button
                class="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                :class="mediaPlayer.binauralMode === 'generated'
                  ? 'bg-purple-500 text-white ring-2 ring-white'
                  : 'bg-black/50 text-white/70 hover:bg-black/70'"
                @click="mediaPlayer.setBinauralMode('generated')"
              >
                Generated
              </button>
              <button
                class="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                :class="mediaPlayer.binauralMode === 'track'
                  ? 'bg-purple-500 text-white ring-2 ring-white'
                  : 'bg-black/50 text-white/70 hover:bg-black/70'"
                @click="mediaPlayer.setBinauralMode('track')"
              >
                Track
              </button>
              <button
                class="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                :class="mediaPlayer.binauralMode === 'auto'
                  ? 'bg-purple-500 text-white ring-2 ring-white'
                  : 'bg-black/50 text-white/70 hover:bg-black/70'"
                @click="mediaPlayer.setBinauralMode('auto')"
              >
                Auto
              </button>
            </div>

            <!-- Generated Mode: Channel Controls -->
            <template v-if="mediaPlayer.binauralMode === 'generated'">
              <!-- Top row: Delta, Theta, Alpha -->
              <div class="flex gap-3 mb-3 pointer-events-auto">
                <button
                  v-for="(channel, index) in mediaPlayer.binauralChannels.slice(0, 3)"
                  :key="channel.label"
                  class="w-10 h-10 rounded-full transition-all duration-200"
                  :class="channel.enabled
                    ? 'ring-2 ring-white scale-110'
                    : 'ring-1 ring-white/30 opacity-50'"
                  :style="{
                    backgroundColor: channel.enabled ? channel.color : 'transparent',
                    boxShadow: channel.enabled ? `0 0 12px ${channel.color}80` : 'none'
                  }"
                  @click="mediaPlayer.toggleChannel(index)"
                  :title="`${channel.label} (${channel.beatFrequency}Hz)`"
                >
                  <span class="text-xs font-bold text-white/90">{{ channel.label.charAt(0) }}</span>
                </button>
              </div>

              <!-- Bottom row: Beta 1, Beta 2, Gamma 1, Gamma 2, Gamma 3 -->
              <div class="flex gap-3 pointer-events-auto">
                <button
                  v-for="(channel, index) in mediaPlayer.binauralChannels.slice(3)"
                  :key="channel.label"
                  class="w-10 h-10 rounded-full transition-all duration-200"
                  :class="channel.enabled
                    ? 'ring-2 ring-white scale-110'
                    : 'ring-1 ring-white/30 opacity-50'"
                  :style="{
                    backgroundColor: channel.enabled ? channel.color : 'transparent',
                    boxShadow: channel.enabled ? `0 0 12px ${channel.color}80` : 'none'
                  }"
                  @click="mediaPlayer.toggleChannel(index + 3)"
                  :title="`${channel.label} (${channel.beatFrequency}Hz)`"
                >
                  <span class="text-xs font-bold text-white/90">{{ channel.label.charAt(0) }}</span>
                </button>
              </div>
            </template>

            <!-- Track Mode: Track Selector -->
            <template v-else-if="mediaPlayer.binauralMode === 'track'">
              <div class="pointer-events-auto flex flex-col items-center gap-2 max-w-xs">
                <select
                  v-model="mediaPlayer.selectedTrackIndex"
                  class="w-full px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option
                    v-for="(track, index) in mediaPlayer.binauralTracks"
                    :key="track.id"
                    :value="index"
                    class="bg-gray-900 text-white"
                  >
                    {{ track.title }} ({{ track.brainwave || 'Custom' }})
                  </option>
                </select>
                <p class="text-white/60 text-xs text-center px-2">
                  {{ getSelectedTrackDescription() }}
                </p>
              </div>
            </template>

            <!-- Auto Mode: Detected Tempo Display -->
            <template v-else-if="mediaPlayer.binauralMode === 'auto'">
              <div class="pointer-events-auto flex flex-col items-center gap-2">
                <div class="text-center">
                  <p class="text-white/60 text-xs uppercase tracking-wider">Detected Tempo</p>
                  <p class="text-3xl font-bold text-white mt-1">
                    {{ mediaPlayer.autoDetectedBpm || '--' }}
                    <span class="text-sm font-normal text-white/60">BPM</span>
                  </p>
                  <p class="text-white/40 text-xs mt-1">
                    {{ mediaPlayer.autoDetectedBeatFrequency.toFixed(1) }} Hz beat frequency
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- Overlay info on spiral (hidden when binaural controls are shown) -->
          <div
            v-if="!mediaPlayer.binauralEnabled"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="text-center">
              <p class="text-white text-lg font-bold drop-shadow-lg">{{ mediaPlayer.currentMedia?.title }}</p>
              <p v-if="mediaPlayer.currentMedia?.author" class="text-white/70 text-sm mt-1 drop-shadow">
                {{ mediaPlayer.currentMedia.author }}
              </p>
            </div>
          </div>

          <!-- Controls overlay -->
          <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-2 pointer-events-auto">
            <button
              class="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              @click="togglePlay"
              title="Play/Pause"
            >
              <UIcon
                :name="mediaPlayer.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                class="w-5 h-5 text-white"
              />
            </button>

            <!-- Binaural Toggle -->
            <button
              class="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
              :class="mediaPlayer.binauralEnabled
                ? 'bg-purple-500/60 hover:bg-purple-500/80'
                : 'bg-black/50 hover:bg-black/70'"
              @click="mediaPlayer.toggleBinaural()"
              title="Toggle binaural beats"
            >
              <UIcon name="i-lucide-headphones" class="w-5 h-5 text-white" />
            </button>

            <!-- Haptics Toggle -->
            <button
              class="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
              :class="mediaPlayer.hapticsEnabled
                ? 'bg-orange-500/60 hover:bg-orange-500/80'
                : 'bg-black/50 hover:bg-black/70'"
              @click="mediaPlayer.toggleHaptics()"
              title="Toggle haptics"
            >
              <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
            </button>

            <button
              class="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              @click="mediaPlayer.toggleSpiral()"
              title="Show cover art"
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
              @click="close"
              title="Stop playing"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <!-- Cover Art View -->
        <div v-else class="p-4">
          <div class="flex items-center gap-4">
            <!-- Media Icon/Thumbnail -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              :class="mediaPlayer.currentMedia.type === 'video' ? 'bg-gradient-to-br from-emerald-500/80 to-green-600/80' : 'bg-gradient-to-br from-amber-500/80 to-orange-600/80'"
            >
              <img
                v-if="mediaPlayer.currentMedia.thumbnail"
                :src="mediaPlayer.currentMedia.thumbnail"
                :alt="mediaPlayer.currentMedia.title"
                class="w-full h-full object-cover"
              />
              <UIcon
                v-else
                :name="mediaPlayer.currentMedia.type === 'video' ? 'i-lucide-video' : 'i-lucide-headphones'"
                class="w-6 h-6 text-white/90"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-semibold truncate">{{ mediaPlayer.currentMedia?.title }}</p>
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
              <!-- Play/Pause -->
              <button
                class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                @click="togglePlay"
              >
                <UIcon
                  :name="mediaPlayer.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                  class="w-5 h-5 text-white"
                />
              </button>

              <!-- Toggle Spiral -->
              <button
                class="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-500/30 flex items-center justify-center transition-colors"
                @click="mediaPlayer.toggleSpiral()"
                title="Toggle hypnotic spiral"
              >
                <UIcon name="i-lucide-eye-off" class="w-5 h-5 text-white" />
              </button>

              <!-- Toggle Binaural -->
              <button
                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                :class="mediaPlayer.binauralEnabled
                  ? 'bg-purple-500/40 hover:bg-purple-500/60'
                  : 'bg-white/10 hover:bg-purple-500/30'"
                @click="mediaPlayer.toggleBinaural()"
                title="Toggle binaural beats"
              >
                <UIcon name="i-lucide-headphones" class="w-5 h-5 text-white" />
              </button>

              <!-- Toggle Haptics -->
              <button
                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                :class="mediaPlayer.hapticsEnabled
                  ? 'bg-orange-500/40 hover:bg-orange-500/60'
                  : 'bg-white/10 hover:bg-orange-500/30'"
                @click="mediaPlayer.toggleHaptics()"
                title="Toggle haptics"
              >
                <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
              </button>

              <!-- Navigate to page -->
              <NuxtLink
                :to="mediaPlayer.currentMedia?.currentPage || '/library'"
                class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Open media page"
              >
                <UIcon name="i-lucide-external-link" class="w-5 h-5 text-white" />
              </NuxtLink>

              <!-- Close -->
              <button
                class="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                @click="close"
                title="Stop playing"
              >
                <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
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
