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
            :master-volume="masterVolume"
            @volume-change="onVolumeChange"
            @frequency-change="onFrequencyChange"
            @master-volume-change="onMasterVolumeChange"
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
const masterVolume = ref(0.5)

// Web Audio API context and oscillators
let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let oscillators: OscillatorNode[] = []
let gainNodes: GainNode[] = []
let panners: StereoPannerNode[] = []

/** Handles preset selection. @param index - The preset index. */
function onPresetSelect(index: number) {
  activePreset.value = index
  applyPreset(PRESETS[index]!)
}

/** Handles volume slider input. @param index - Band index. @param value - Slider value (0-1). */
function onVolumeChange(index: number, value: number) {
  const band = bands.value[index]
  if (band) {
    band.volume = Math.max(0, Math.min(1, value))
    if (isPlaying.value) updateGain(index)
  }
}

/** Handles master volume slider input. @param value - Master volume (0-1). */
function onMasterVolumeChange(value: number) {
  masterVolume.value = Math.max(0, Math.min(1, value))
  if (isPlaying.value && masterGain && audioContext) {
    masterGain.gain.setTargetAtTime(masterVolume.value, audioContext.currentTime, 0.01)
  }
}

/** Handles frequency slider input. @param index - Band index. @param value - Beat frequency. */
function onFrequencyChange(index: number, value: string) {
  const band = bands.value[index]
  if (band) {
    band.beat = parseFloat(value)
    if (isPlaying.value) updateFrequency(index)
  }
}

/** Updates gain nodes for a band (left and right channels). @param index - Band index. */
function updateGain(index: number) {
  const band = bands.value[index]
  if (!audioContext || !band) return
  const leftGain = gainNodes[index * 2]
  const rightGain = gainNodes[index * 2 + 1]
  const targetVolume = band.volume
  if (leftGain) leftGain.gain.setTargetAtTime(targetVolume, audioContext.currentTime, 0.01)
  if (rightGain) rightGain.gain.setTargetAtTime(targetVolume, audioContext.currentTime, 0.01)
}

/** Updates oscillator frequencies for a band (left and right). @param index - Band index. */
function updateFrequency(index: number) {
  const band = bands.value[index]
  if (!audioContext || !band) return
  const leftOsc = oscillators[index * 2]
  const rightOsc = oscillators[index * 2 + 1]
  if (leftOsc) leftOsc.frequency.setTargetAtTime(band.frequency, audioContext.currentTime, 0.01)
  if (rightOsc) rightOsc.frequency.setTargetAtTime(band.frequency + band.beat, audioContext.currentTime, 0.01)
}

/** Increases all band volumes by 0.1. */
function increaseAllVolumes() {
  bands.value.forEach((band, i) => {
    band.volume = Math.min(1, band.volume + 0.1)
    if (isPlaying.value) updateGain(i)
  })
}

/** Decreases all band volumes by 0.1. */
function decreaseAllVolumes() {
  bands.value.forEach((band, i) => {
    band.volume = Math.max(0, band.volume - 0.1)
    if (isPlaying.value) updateGain(i)
  })
}

/**
 * Randomizes all band volumes and beat frequencies.
 */
function randomize() {
  bands.value.forEach((band, i) => {
    band.volume = Math.random() * 0.8 + 0.1
    band.beat = Math.floor(Math.random() * 40 * 2) / 2 + 1
    if (isPlaying.value) {
      updateGain(i)
      updateFrequency(i)
    }
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

    // Master gain node controls overall volume
    masterGain = audioContext.createGain()
    masterGain.gain.value = masterVolume.value
    masterGain.connect(audioContext.destination)

    bands.value.forEach((band) => {
      // Left ear oscillator
      const leftOsc = audioContext!.createOscillator()
      const leftGain = audioContext!.createGain()
      const leftPanner = audioContext!.createStereoPanner()
      leftOsc.frequency.value = band.frequency
      leftOsc.type = 'sine'
      leftGain.gain.value = band.volume
      leftPanner.pan.value = -1
      leftOsc.connect(leftGain)
      leftGain.connect(leftPanner)
      leftPanner.connect(masterGain!)
      leftOsc.start()

      // Right ear oscillator
      const rightOsc = audioContext!.createOscillator()
      const rightGain = audioContext!.createGain()
      const rightPanner = audioContext!.createStereoPanner()
      rightOsc.frequency.value = band.frequency + band.beat
      rightOsc.type = 'sine'
      rightGain.gain.value = band.volume
      rightPanner.pan.value = 1
      rightOsc.connect(rightGain)
      rightGain.connect(rightPanner)
      rightPanner.connect(masterGain!)
      rightOsc.start()

      oscillators.push(leftOsc, rightOsc)
      gainNodes.push(leftGain, rightGain)
      panners.push(leftPanner, rightPanner)
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
  if (masterGain) {
    masterGain.disconnect()
    masterGain = null
  }
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
