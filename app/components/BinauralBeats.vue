<template>
  <div />
</template>

<script setup lang="ts">
import type { BinauralChannel, BinauralTrack } from '../stores/mediaPlayer'
import { useBinauralBeats } from '../composables/useBinauralBeats'

const props = defineProps<{
  enabled: boolean
  volume: number
  mode: 'generated' | 'track' | 'auto'
  channels: BinauralChannel[]
  tracks: BinauralTrack[]
  selectedTrackIndex: number
  playing: boolean
  autoBeatFrequency: number
  mediaElement?: HTMLVideoElement | HTMLAudioElement | null
}>()

const {
  initAudio, startChannel, stopChannel,
  updateChannelFrequency, playTrack, initTempoDetection,
  stopAllModes, cleanup
} = useBinauralBeats()

function createAutoChannel(): BinauralChannel {
  return {
    label: 'Auto',
    baseFrequency: 120,
    beatFrequency: props.autoBeatFrequency || 5,
    color: '#9B59B6',
    enabled: true,
    volume: 0.3
  }
}

function startModeForCurrent() {
  if (props.mode === 'generated') {
    props.channels.forEach((ch, i) => {
      if (ch.enabled) startChannel(i, ch)
    })
  } else if (props.mode === 'track') {
    const track = props.tracks[props.selectedTrackIndex]
    if (track) playTrack(track, props.volume)
  } else if (props.mode === 'auto') {
    initTempoDetection(props.mediaElement ?? null)
    startChannel(0, createAutoChannel())
  }
}

watch(() => props.enabled, (enabled) => {
  if (enabled) {
    initAudio()
    startModeForCurrent()
  } else {
    stopAllModes(props.channels)
  }
})

watch(() => props.mode, () => {
  if (!props.enabled) return
  stopAllModes(props.channels)
  startModeForCurrent()
})

watch(() => props.selectedTrackIndex, () => {
  if (props.mode !== 'track' || !props.enabled) return
  const track = props.tracks[props.selectedTrackIndex]
  if (track) playTrack(track, props.volume)
})

watch(() => props.autoBeatFrequency, (freq) => {
  if (props.mode !== 'auto' || !props.enabled) return
  updateChannelFrequency(0, { ...createAutoChannel(), beatFrequency: freq })
})

watch(() => props.mediaElement, () => {
  if (props.mode === 'auto' && props.enabled && props.mediaElement) {
    initTempoDetection(props.mediaElement)
  }
})

watch(() => props.channels, (channels) => {
  if (props.mode !== 'generated') return
  channels.forEach((ch, i) => {
    if (ch.enabled) {
      startChannel(i, ch)
    } else {
      stopChannel(i)
    }
  })
}, { deep: true })

onBeforeUnmount(() => cleanup(props.channels))
</script>
