<template>
  <div v-if="isOpen" class="download-dialog-overlay" @click.self="close">
    <div class="download-dialog rounded-xl border border-white/10 bg-gray-900 p-6 w-80">
      <h3 class="text-lg font-semibold text-white mb-4">
        Download Audio
      </h3>

      <p class="text-sm text-white/60 mb-4">
        Set the duration for the generated audio file.
      </p>

      <!-- Duration Inputs -->
      <div class="flex gap-4 mb-6">
        <div class="flex-1">
          <label class="block text-xs text-white/40 mb-1" for="binaural-minutes">
            Minutes
          </label>
          <input
            id="binaural-minutes"
            v-model="minutes"
            type="number"
            name="minutes"
            min="0"
            max="99"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:border-white/30 outline-none"
          >
        </div>
        <div class="flex-1">
          <label class="block text-xs text-white/40 mb-1" for="binaural-seconds">
            Seconds
          </label>
          <input
            id="binaural-seconds"
            v-model="seconds"
            type="number"
            name="seconds"
            min="0"
            max="59"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:border-white/30 outline-none"
          >
        </div>
      </div>

      <!-- Status message -->
      <div v-if="status" class="mb-4 text-sm" :class="statusClass">
        {{ status }}
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          class="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          @click="close"
        >
          Cancel
        </button>
        <button
          :disabled="generating || totalSeconds === 0"
          class="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="generate"
        >
          {{ generating ? 'Generating...' : 'Download' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FrequencyBand } from '~/composables/useBinauralBeats'
import { generateBinauralAudio, triggerDownload } from '~/utils/binauralWavEncoder'

const props = defineProps<{
  /** Whether the dialog is open. */
  isOpen: boolean
  /** The current frequency band configuration. */
  bands: FrequencyBand[]
}>()

const emit = defineEmits<{
  /** Emitted when the dialog should close. */
  close: []
}>()

const minutes = ref(0)
const seconds = ref(30)
const generating = ref(false)
const status = ref('')

const totalSeconds = computed(() => {
  const m = Math.max(0, parseInt(minutes.value as unknown as string) || 0)
  const s = Math.max(0, Math.min(59, parseInt(seconds.value as unknown as string) || 0))
  return m * 60 + s
})

const statusClass = computed(() => {
  if (generating.value) return 'text-yellow-400'
  if (status.value.includes('ready')) return 'text-green-400'
  return 'text-white/60'
})

watch(() => props.isOpen, (open) => {
  if (open) {
    minutes.value = 0
    seconds.value = 30
    generating.value = false
    status.value = ''
  }
})

function close() {
  emit('close')
}

async function generate() {
  if (totalSeconds.value === 0 || generating.value) return

  generating.value = true
  status.value = 'Generating audio...'

  try {
    const blob = await generateBinauralAudio(props.bands, totalSeconds.value)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `binaural-beats-${timestamp}.wav`
    triggerDownload(blob, filename)
    status.value = 'Download ready!'
    setTimeout(() => {
      close()
    }, 1500)
  } catch (error) {
    status.value = 'Error generating audio.'
    console.error('Failed to generate audio:', error)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.download-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
</style>
