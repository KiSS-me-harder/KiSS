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
            Binaural Beats
          </h1>
          <p class="text-white/60 mt-1">
            Adjust frequency bands to create custom binaural beat audio for focus, relaxation, or sleep.
          </p>
        </div>

        <!-- Equalizer Interface -->
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
          <BinauralEqualizer
            :bands="bands"
            :playing="isPlaying"
            :presets="presets"
            @volume-change="onVolumeChange"
            @frequency-change="onFrequencyChange"
            @play="startPlayback"
            @stop="stopPlayback"
            @increase-volume="increaseAllVolumes"
            @decrease-volume="decreaseAllVolumes"
            @randomize="randomize"
            @reset="resetAll"
            @preset-select="onPresetSelect"
          />
        </div>

        <!-- Download Button -->
        <div class="flex justify-center">
          <button
            data-test="download-button"
            class="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            @click="showDownloadDialog = true"
          >
            Download Audio
          </button>
        </div>

        <!-- Info -->
        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-lg font-semibold text-white mb-2">
            How Binaural Beats Work
          </h2>
          <p class="text-sm text-white/60">
            Binaural beats are created when two slightly different frequencies are played in each ear.
            The brain perceives a third tone — the difference between the two frequencies — which can
            help induce specific brainwave states for focus, relaxation, or sleep.
          </p>
          <p class="text-sm text-white/40 mt-2">
            Note: Headphones are required for binaural beats to work effectively.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Download Dialog -->
  <BinauralDownloadDialog
    :is-open="showDownloadDialog"
    :bands="bands"
    @close="showDownloadDialog = false"
  />
</template>

<script setup lang="ts">
import { useFrequencyBands, PRESETS } from '~/composables/useBinauralBeats'
import BinauralEqualizer from '~/components/tools/BinauralEqualizer.vue'
import BinauralDownloadDialog from '~/components/tools/BinauralDownloadDialog.vue'

const breadcrumbs = [
  { label: 'Tools', to: '/tools' },
  { label: 'Binaural Beats Creator' }
]

const { bands, applyPreset } = useFrequencyBands()
const presets = PRESETS
const activePreset = ref<number>(-1)
const isPlaying = ref(false)
const showDownloadDialog = ref(false)

// Web Audio API context and oscillators
let audioContext: AudioContext | null = null
let oscillators: OscillatorNode[] = []
let gainNodes: GainNode[] = []
let panners: StereoPannerNode[] = []

/**
 * Handles preset selection.
 * @param index - The preset index.
 */
function onPresetSelect(index: number) {
  activePreset.value = index
  applyPreset(PRESETS[index]!)
}

/**
 * Handles volume slider input for a frequency band.
 * @param index - The band index.
 * @param value - The slider value (0.0-1.0).
 */
function onVolumeChange(index: number, value: number) {
  const band = bands.value[index]
  if (band) {
    band.volume = Math.max(0, Math.min(1, value))
    updateGain(index)
  }
}

/**
 * Handles frequency slider input for a band's beat offset.
 * @param index - The band index.
 * @param value - The beat frequency value.
 */
function onFrequencyChange(index: number, value: string) {
  const band = bands.value[index]
  if (band) {
    band.beat = parseFloat(value)
    updateFrequency(index)
  }
}

/**
 * Updates the gain node for a specific band while playing.
 * @param index - The band index.
 */
function updateGain(index: number) {
  const band = bands.value[index]
  if (gainNodes[index] && audioContext && band) {
    gainNodes[index].gain.setTargetAtTime(band.volume * 0.1, audioContext.currentTime, 0.1)
  }
}

/**
 * Updates the oscillator frequency for a specific band while playing.
 * @param index - The band index.
 */
function updateFrequency(index: number) {
  const band = bands.value[index]
  if (oscillators[index] && audioContext && band) {
    oscillators[index].frequency.setTargetAtTime(band.frequency, audioContext.currentTime, 0.1)
  }
}

/**
 * Increases all band volumes by 0.1.
 */
function increaseAllVolumes() {
  bands.value.forEach((band, i) => {
    band.volume = Math.min(1, band.volume + 0.1)
    updateGain(i)
  })
}

/**
 * Decreases all band volumes by 0.1.
 */
function decreaseAllVolumes() {
  bands.value.forEach((band, i) => {
    band.volume = Math.max(0, band.volume - 0.1)
    updateGain(i)
  })
}

/**
 * Randomizes all band volumes and beat frequencies.
 */
function randomize() {
  bands.value.forEach((band, i) => {
    band.volume = Math.random() * 0.8 + 0.1
    band.beat = Math.floor(Math.random() * 40 * 2) / 2 + 1
    updateGain(i)
  })
}

/**
 * Resets all bands to default values.
 */
function resetAll() {
  if (isPlaying.value) {
    stopPlayback()
  }
  bands.value = bands.value.map((_, i) => ({ ...PRESETS[0].bands[i]! }))
}

/**
 * Starts playback using all configured frequency bands.
 */
function startPlayback() {
  if (isPlaying.value) return

  if (import.meta.client) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    oscillators = []
    gainNodes = []
    panners = []

    bands.value.forEach((band) => {
      if (band.volume > 0) {
        // Left ear oscillator
        const leftOsc = audioContext!.createOscillator()
        const leftGain = audioContext!.createGain()
        const leftPanner = audioContext!.createStereoPanner()
        leftOsc.frequency.value = band.frequency
        leftOsc.type = 'sine'
        leftGain.gain.value = band.volume * 0.1
        leftPanner.pan.value = -1
        leftOsc.connect(leftGain)
        leftGain.connect(leftPanner)
        leftPanner.connect(audioContext!.destination)
        leftOsc.start()

        // Right ear oscillator
        const rightOsc = audioContext!.createOscillator()
        const rightGain = audioContext!.createGain()
        const rightPanner = audioContext!.createStereoPanner()
        rightOsc.frequency.value = band.frequency + band.beat
        rightOsc.type = 'sine'
        rightGain.gain.value = band.volume * 0.1
        rightPanner.pan.value = 1
        rightOsc.connect(rightGain)
        rightGain.connect(rightPanner)
        rightPanner.connect(audioContext!.destination)
        rightOsc.start()

        oscillators.push(leftOsc, rightOsc)
        gainNodes.push(leftGain, rightGain)
        panners.push(leftPanner, rightPanner)
      }
    })

    isPlaying.value = true
  }
}

/**
 * Stops all playback and cleans up audio resources.
 */
function stopPlayback() {
  oscillators.forEach((osc) => {
    try {
      osc.stop()
    } catch { /* already stopped */ }
    osc.disconnect()
  })
  gainNodes.forEach(gain => gain.disconnect())
  panners.forEach(panner => panner.disconnect())
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  oscillators = []
  gainNodes = []
  panners = []
  isPlaying.value = false
}

useHead({
  title: 'Binaural Beats Creator — KiSS'
})
</script>
