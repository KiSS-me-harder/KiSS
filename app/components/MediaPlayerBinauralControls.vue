<script setup lang="ts">
import { useMediaPlayerStore } from '~/stores/mediaPlayer'

const mediaPlayer = useMediaPlayerStore()

defineProps<{
  getSelectedTrackDescription: () => string
}>()
</script>

<template>
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
          :title="`${channel.label} (${channel.beatFrequency}Hz)`"
          @click="mediaPlayer.toggleChannel(index)"
        >
          <span class="text-xs font-bold text-white/90">{{ channel.label.charAt(0) }}</span>
        </button>
      </div>
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
          :title="`${channel.label} (${channel.beatFrequency}Hz)`"
          @click="mediaPlayer.toggleChannel(index + 3)"
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
          <p class="text-white/60 text-xs uppercase tracking-wider">
            Detected Tempo
          </p>
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
</template>
