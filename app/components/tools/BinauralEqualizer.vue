<template>
  <div class="binaural-equalizer">
    <!-- Master Volume Slider -->
    <div class="flex items-center gap-3 mb-4 px-4">
      <UIcon name="i-lucide-volume-1" class="w-5 h-5 text-white/60" />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="props.masterVolume"
        class="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-white"
        @input="(e: Event) => emit('masterVolumeChange', parseFloat((e.target as HTMLInputElement).value))"
      >
      <span class="text-xs text-white/60 w-10 text-right">
        {{ Math.round(props.masterVolume * 100) }}%
      </span>
    </div>

    <!-- Frequency Band Sliders -->
    <div class="flex justify-between items-end mb-6 px-2">
      <div
        v-for="(band, index) in bands"
        :key="band.label"
        class="flex flex-col items-center"
      >
        <!-- Volume Slider -->
        <VerticalSlider
          :value="band.volume"
          :color="band.color"
          label="Vol"
          @update:value="(v: number) => emit('volumeChange', index, v)"
        />

        <!-- Frequency Slider -->
        <VerticalSlider
          :value="(band.beat - 1) / 39"
          :color="band.color"
          label="Hz"
          :small="true"
          @update:value="(v: number) => {
            const value = v * 39 + 1
            const rounded = Math.round(value * 2) / 2
            emit('frequencyChange', index, String(Math.max(1, Math.min(40, rounded))))
          }"
        />

        <!-- Band Indicator Circle -->
        <div
          class="w-10 h-10 rounded-full border-2 flex items-center justify-center"
          :style="{
            borderColor: band.color,
            backgroundColor: band.volume > 0 ? `${band.color}33` : 'transparent'
          }"
        >
          <div
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: band.color }"
          />
        </div>

        <!-- Band Label -->
        <span class="text-xs text-white/50">
          {{ band.label }}
        </span>
      </div>
    </div>

    <!-- Presets -->
    <BinauralPresets
      v-if="props.presets && props.presets.length > 0"
      :presets="props.presets"
      @select="(index) => emit('presetSelect', index)"
    />

    <!-- Playback Controls -->
    <div class="flex justify-center items-center gap-4 pt-2">
      <NButton
        variant="subtle"
        color="gray"
        size="lg"
        @click="stop"
      >
        <UIcon name="i-lucide-rotate-ccw" class="w-5 h-5" />
      </NButton>
      <NButton
        variant="subtle"
        color="gray"
        size="lg"
        @click="decreaseVolume"
      >
        <UIcon name="i-lucide-volume-x" class="w-5 h-5" />
      </NButton>
      <NButton
        variant="subtle"
        color="gray"
        size="lg"
        @click="increaseVolume"
      >
        <UIcon name="i-lucide-volume-2" class="w-5 h-5" />
      </NButton>
      <NButton
        :color="playing ? 'error' : 'primary'"
        size="xl"
        circle
        @click="togglePlay"
      >
        <UIcon
          :name="playing ? 'i-lucide-square' : 'i-lucide-play'"
          class="w-6 h-6"
        />
      </NButton>
      <NButton
        variant="subtle"
        color="gray"
        size="lg"
        @click="randomize"
      >
        <UIcon name="i-lucide-shuffle" class="w-5 h-5" />
      </NButton>
      <NButton
        variant="subtle"
        color="gray"
        size="lg"
        @click="reset"
      >
        <UIcon name="i-lucide-power" class="w-5 h-5" />
      </NButton>
    </div>

    <!-- Playing Indicator -->
    <div
      v-if="playing"
      class="text-center mt-3"
    >
      <span class="text-sm text-green-400">
        Playing
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BinauralPresets from '~/components/tools/BinauralPresets.vue'
import VerticalSlider from '~/components/tools/VerticalSlider.vue'
import type { FrequencyBand } from '~/composables/useBinauralBeats'

const props = defineProps<{
  bands: FrequencyBand[]
  playing: boolean
  masterVolume: number
  presets?: { name: string, icon: string }[]
}>()

const emit = defineEmits<{
  masterVolumeChange: [value: number]
  volumeChange: [index: number, value: number]
  frequencyChange: [index: number, value: string]
  play: []
  stop: []
  increaseVolume: []
  decreaseVolume: []
  randomize: []
  reset: []
  presetSelect: [index: number]
}>()

function togglePlay() {
  if (props.playing) {
    emit('stop')
  } else {
    emit('play')
  }
}

function stop() {
  emit('stop')
}

function increaseVolume() {
  emit('increaseVolume')
}

function decreaseVolume() {
  emit('decreaseVolume')
}

function randomize() {
  emit('randomize')
}

function reset() {
  emit('reset')
}
</script>

<style scoped>
/* Master volume slider track styling */
input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
}
input[type="range"]::-moz-range-track {
  height: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -4px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}
</style>
