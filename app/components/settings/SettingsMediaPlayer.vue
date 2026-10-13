<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-headphones" class="size-5 text-white/40" />
        <h2 class="text-lg font-semibold text-white">
          Media Player
        </h2>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Haptics
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Vibrate in sync with media playback
          </p>
        </div>
        <USwitch v-model="mediaPlayer.hapticsEnabled" />
      </div>

      <div v-if="mediaPlayer.hapticsEnabled">
        <label class="text-xs text-white/40 uppercase tracking-wider">Intensity</label>
        <div class="flex items-center gap-3 mt-2">
          <span class="text-xs text-white/40">Low</span>
          <USlider
            v-model="mediaPlayer.hapticsIntensity"
            :min="0"
            :max="1"
            :step="0.05"
            :thumb-size="'sm'"
            class="flex-1"
          />
          <span class="text-xs text-white/40">High</span>
        </div>
      </div>

      <div v-if="mediaPlayer.hapticsEnabled">
        <label class="text-xs text-white/40 uppercase tracking-wider">Mode</label>
        <USelect
          v-model="mediaPlayer.hapticsMode"
          :items="hapticsModeOptions"
          class="mt-1"
        />
      </div>

      <div v-if="mediaPlayer.hapticsEnabled && mediaPlayer.hapticsMode === 'manual'">
        <label class="text-xs text-white/40 uppercase tracking-wider">Pattern</label>
        <USelect
          v-model="selectedPatternIndex"
          :items="patternOptions"
          class="mt-1"
          @change="onPatternChange"
        />
      </div>

      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Binaural Beats
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Layer binaural audio tones
          </p>
        </div>
        <USwitch v-model="mediaPlayer.binauralEnabled" />
      </div>

      <div v-if="mediaPlayer.binauralEnabled">
        <label class="text-xs text-white/40 uppercase tracking-wider">Mode</label>
        <USelect
          v-model="mediaPlayer.binauralMode"
          :items="binauralModeOptions"
          class="mt-1"
        />
      </div>

      <div v-if="mediaPlayer.binauralEnabled && mediaPlayer.binauralMode === 'track'">
        <label class="text-xs text-white/40 uppercase tracking-wider">Track</label>
        <USelect
          v-model="selectedBinauralTrackIndex"
          :items="binauralTrackOptions"
          class="mt-1"
          @change="onBinauralTrackChange"
        />
      </div>

      <div v-if="mediaPlayer.binauralEnabled && mediaPlayer.binauralMode === 'auto'">
        <div class="p-3 rounded-lg bg-white/5 border border-white/10">
          <p class="text-xs text-white/60">
            <UIcon name="i-lucide-info" class="size-3 inline mr-1" />
            Auto mode detects the tempo of the currently playing media and generates matching binaural beats.
          </p>
          <p v-if="mediaPlayer.autoDetectedBpm" class="text-sm text-white mt-2 font-semibold">
            Detected: {{ mediaPlayer.autoDetectedBpm }} BPM
          </p>
        </div>
      </div>

      <div v-if="mediaPlayer.binauralEnabled">
        <label class="text-xs text-white/40 uppercase tracking-wider">Volume</label>
        <div class="flex items-center gap-3 mt-2">
          <span class="text-xs text-white/40">Quiet</span>
          <USlider
            v-model="mediaPlayer.binauralVolume"
            :min="0"
            :max="1"
            :step="0.05"
            :thumb-size="'sm'"
            class="flex-1"
          />
          <span class="text-xs text-white/40">Loud</span>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Hypnotic Spiral
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Show spiral animation instead of cover art
          </p>
        </div>
        <USwitch v-model="mediaPlayer.showSpiral" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useMediaPlayerStore } from '~/stores/mediaPlayer'

const mediaPlayer = useMediaPlayerStore()

const hapticsModeOptions = [
  { label: 'Reactive (Audio-Synced)', value: 'reactive' },
  { label: 'Manual (Pattern)', value: 'manual' }
]

const binauralModeOptions = [
  { label: 'Generated (Live Oscillators)', value: 'generated' },
  { label: 'Track (Pre-recorded)', value: 'track' },
  { label: 'Auto (Detect from Media)', value: 'auto' }
]

const selectedPatternIndex = defineModel<number>('patternIndex')
const selectedBinauralTrackIndex = defineModel<number>('binauralTrackIndex')

const patternOptions = computed(() =>
  mediaPlayer.hapticPatterns.map((p: { name: string }, i: number) => ({
    label: p.name,
    value: i
  }))
)

const binauralTrackOptions = computed(() =>
  mediaPlayer.binauralTracks.map((t: { title: string, brainwave?: string }, i: number) => ({
    label: `${t.title} (${t.brainwave || 'Custom'})`,
    value: i
  }))
)

const emit = defineEmits<{
  'pattern-change': [index: number]
  'binaural-track-change': [index: number]
}>()

function onPatternChange(val: unknown) {
  emit('pattern-change', Number(val))
}
function onBinauralTrackChange(val: unknown) {
  emit('binaural-track-change', Number(val))
}
</script>
