<template>
  <div />
</template>

<script setup lang="ts">
import type { HapticPattern } from '../stores/mediaPlayer'
import { useHapticsEngine } from '../composables/useHapticsEngine'

const props = defineProps<{
  enabled: boolean
  intensity: number
  mode: 'manual' | 'reactive'
  pattern: HapticPattern | null
  playing: boolean
  mediaElement?: HTMLVideoElement | HTMLAudioElement | null | undefined
}>()

const {
  startManualMode, stopManualMode,
  startReactiveMode, stopReactiveMode, cleanup
} = useHapticsEngine()

watch(() => props.enabled, (enabled) => {
  if (enabled) {
    if (props.mode === 'manual') {
      startManualMode(props.pattern, props.intensity, props.playing)
    } else {
      startReactiveMode(props.intensity, props.playing, props.mediaElement ?? null)
    }
  } else {
    stopManualMode()
    stopReactiveMode()
  }
})

watch(() => props.playing, () => {
  if (!props.enabled) return
  if (props.playing) {
    if (props.mode === 'manual') {
      startManualMode(props.pattern, props.intensity, props.playing)
    } else {
      startReactiveMode(props.intensity, props.playing, props.mediaElement ?? null)
    }
  } else {
    stopManualMode()
    stopReactiveMode()
  }
})

watch(() => props.mode, () => {
  if (!props.enabled) return
  stopManualMode()
  stopReactiveMode()
  if (props.playing) {
    if (props.mode === 'manual') {
      startManualMode(props.pattern, props.intensity, props.playing)
    } else {
      startReactiveMode(props.intensity, props.playing, props.mediaElement ?? null)
    }
  }
})

watch(() => props.pattern, () => {
  if (props.enabled && props.mode === 'manual' && props.playing) {
    stopManualMode()
    startManualMode(props.pattern, props.intensity, props.playing)
  }
}, { deep: true })

onBeforeUnmount(() => cleanup())
</script>
