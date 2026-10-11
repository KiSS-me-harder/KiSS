<template>
  <div />
</template>

<script setup lang="ts">
import type { BinauralChannel, BinauralTrack, BinauralMode } from '../stores/mediaPlayer'

const props = defineProps<{
  enabled: boolean
  volume: number
  mode: BinauralMode
  channels: BinauralChannel[]
  tracks: BinauralTrack[]
  selectedTrackIndex: number
  playing: boolean
  /** Auto-detected beat frequency in Hz (for auto mode) */
  autoBeatFrequency: number
  /** Media element reference for auto mode tempo detection */
  mediaElement?: HTMLVideoElement | HTMLAudioElement | null
}>()

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
const channelGains = new Map<number, GainNode>()
const channelOscillators = new Map<number, { left: OscillatorNode, right: OscillatorNode }>()
const channelPanners = new Map<number, { left: StereoPannerNode, right: StereoPannerNode }>()

// Track mode: pre-recorded audio
let trackAudio: HTMLAudioElement | null = null
let trackGain: GainNode | null = null
let trackSource: MediaElementAudioSourceNode | null = null

// Auto mode: tempo detection
let tempoAnalyser: AnalyserNode | null = null
let tempoSource: MediaElementAudioSourceNode | null = null
let tempoDetectionTimer: number | null = null
const tempoFftSize = 512
const tempoDataArray = new Uint8Array(tempoFftSize)
let lastBeatTimes: number[] = []

function initAudio() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  masterGain = audioCtx.createGain()
  masterGain.gain.value = props.volume
  masterGain.connect(audioCtx.destination)
}

function startChannel(index: number, channel: BinauralChannel) {
  if (!audioCtx || !masterGain) return
  if (channelOscillators.has(index)) return // already running

  // Left ear oscillator
  const leftOsc = audioCtx.createOscillator()
  leftOsc.type = 'sine'
  leftOsc.frequency.value = channel.baseFrequency

  // Right ear oscillator (base + beat frequency)
  const rightOsc = audioCtx.createOscillator()
  rightOsc.type = 'sine'
  rightOsc.frequency.value = channel.baseFrequency + channel.beatFrequency

  // Panner nodes for stereo separation
  const leftPanner = audioCtx.createStereoPanner()
  leftPanner.pan.value = -1 // hard left
  const rightPanner = audioCtx.createStereoPanner()
  rightPanner.pan.value = 1 // hard right

  // Channel gain
  const gain = audioCtx.createGain()
  gain.gain.value = channel.volume

  // Connect: oscillators -> panners -> gain -> master
  leftOsc.connect(leftPanner)
  rightOsc.connect(rightPanner)
  leftPanner.connect(gain)
  rightPanner.connect(gain)
  gain.connect(masterGain)

  leftOsc.start()
  rightOsc.start()

  channelOscillators.set(index, { left: leftOsc, right: rightOsc })
  channelGains.set(index, gain)
  channelPanners.set(index, { left: leftPanner, right: rightPanner })
}

function stopChannel(index: number) {
  const oscillators = channelOscillators.get(index)
  if (oscillators) {
    try {
      oscillators.left.stop()
      oscillators.right.stop()
    } catch {
      // Already stopped
    }
    oscillators.left.disconnect()
    oscillators.right.disconnect()
    channelOscillators.delete(index)
  }

  const gain = channelGains.get(index)
  if (gain) {
    gain.disconnect()
    channelGains.delete(index)
  }

  const panners = channelPanners.get(index)
  if (panners) {
    panners.left.disconnect()
    panners.right.disconnect()
    channelPanners.delete(index)
  }
}

function updateChannelVolume(index: number, volume: number) {
  const gain = channelGains.get(index)
  if (gain && audioCtx) {
    gain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01)
  }
}

function updateChannelFrequency(index: number, channel: BinauralChannel) {
  const oscillators = channelOscillators.get(index)
  if (oscillators && audioCtx) {
    oscillators.left.frequency.setTargetAtTime(channel.baseFrequency, audioCtx.currentTime, 0.01)
    oscillators.right.frequency.setTargetAtTime(channel.baseFrequency + channel.beatFrequency, audioCtx.currentTime, 0.01)
  }
}

// --- Track Mode ---

function stopTrack() {
  if (trackAudio) {
    trackAudio.pause()
    trackAudio.src = ''
    trackAudio = null
  }
  if (trackSource) {
    trackSource.disconnect()
    trackSource = null
  }
  if (trackGain) {
    trackGain.disconnect()
    trackGain = null
  }
}

function playTrack(track: BinauralTrack) {
  stopTrack()
  if (!audioCtx || !masterGain) return

  trackAudio = new Audio()
  trackAudio.crossOrigin = 'anonymous'
  trackAudio.loop = true
  trackAudio.src = track.url

  trackGain = audioCtx.createGain()
  trackGain.gain.value = props.volume

  trackAudio.addEventListener('canplaythrough', () => {
    if (!trackSource || !trackGain || !masterGain) return
    try {
      const tg = trackGain
      const mg = masterGain
      trackSource.connect(tg)
      tg.connect(mg)
    } catch {
      // Already connected
    }
    trackAudio!.play().catch(() => {})
  }, { once: true })
}

// --- Auto Mode: Tempo Detection ---

function stopTempoDetection() {
  if (tempoDetectionTimer !== null) {
    clearInterval(tempoDetectionTimer)
    tempoDetectionTimer = null
  }
  if (tempoSource) {
    tempoSource.disconnect()
    tempoSource = null
  }
  if (tempoAnalyser) {
    tempoAnalyser.disconnect()
    tempoAnalyser = null
  }
}

function detectTempo() {
  if (!props.mediaElement || !tempoAnalyser || !props.playing) return

  tempoAnalyser.getByteFrequencyData(tempoDataArray)

  // Focus on bass frequencies for beat detection
  const bassEnd = Math.floor(tempoDataArray.length * 0.15)
  let bassEnergy = 0
  for (let i = 0; i < bassEnd; i++) {
    bassEnergy += tempoDataArray[i]!
  }
  bassEnergy /= bassEnd || 1

  const threshold = 140
  const now = performance.now()

  if (bassEnergy > threshold) {
    // Remove old beat times (older than 2 seconds)
    lastBeatTimes = lastBeatTimes.filter(t => now - t < 2000)
    // Add new beat time, avoiding duplicates within 50ms
    if (lastBeatTimes.length === 0 || now - lastBeatTimes[lastBeatTimes.length - 1]! > 50) {
      lastBeatTimes.push(now)
    }
  }

  // Calculate BPM from recent beats
  if (lastBeatTimes.length >= 4) {
    const intervals: number[] = []
    for (let i = 1; i < lastBeatTimes.length; i++) {
      intervals.push(lastBeatTimes[i]! - lastBeatTimes[i - 1]!)
    }
    // Use median interval
    intervals.sort((a, b) => a - b)
    const medianInterval = intervals[Math.floor(intervals.length / 2)]
    if (medianInterval && medianInterval > 200 && medianInterval < 2000) {
      const bpm = Math.round(60000 / medianInterval)
      // Clamp to reasonable range
      if (bpm >= 40 && bpm <= 200) {
        window.dispatchEvent(new CustomEvent('binaural-tempo-detected', { detail: bpm }))
      }
    }
  }
}

function initTempoDetection() {
  if (!props.mediaElement || !audioCtx) return
  stopTempoDetection()

  try {
    tempoSource = audioCtx.createMediaElementSource(props.mediaElement)
  } catch {
    return
  }

  tempoAnalyser = audioCtx.createAnalyser()
  tempoAnalyser.fftSize = tempoFftSize
  tempoAnalyser.smoothingTimeConstant = 0.8

  tempoSource.connect(tempoAnalyser)

  tempoDetectionTimer = window.setInterval(detectTempo, 50)
}

// Stop all active modes
function stopAllModes() {
  props.channels.forEach((_, index) => {
    stopChannel(index)
  })
  stopTrack()
  stopTempoDetection()
}

// Watch for enabled state changes
watch(() => props.enabled, (enabled) => {
  if (enabled) {
    initAudio()
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume()
    }
    // Handle based on mode
    if (props.mode === 'generated') {
      props.channels.forEach((channel, index) => {
        if (channel.enabled) {
          startChannel(index, channel)
        }
      })
    } else if (props.mode === 'track') {
      const track = props.tracks[props.selectedTrackIndex]
      if (track) {
        playTrack(track)
      }
    } else if (props.mode === 'auto') {
      // In auto mode, start tempo detection and use auto-detected frequency
      initTempoDetection()
      // Start a single channel with the auto-detected beat frequency
      const autoChannel: BinauralChannel = {
        label: 'Auto',
        baseFrequency: 120,
        beatFrequency: props.autoBeatFrequency || 5,
        color: '#9B59B6',
        enabled: true,
        volume: 0.3
      }
      startChannel(0, autoChannel)
    }
  } else {
    stopAllModes()
  }
})

// Watch for mode changes
watch(() => props.mode, (newMode) => {
  if (!props.enabled) return
  stopAllModes()

  if (newMode === 'generated') {
    props.channels.forEach((channel, index) => {
      if (channel.enabled) {
        startChannel(index, channel)
      }
    })
  } else if (newMode === 'track') {
    const track = props.tracks[props.selectedTrackIndex]
    if (track) {
      playTrack(track)
    }
  } else if (newMode === 'auto') {
    initTempoDetection()
    const autoChannel: BinauralChannel = {
      label: 'Auto',
      baseFrequency: 120,
      beatFrequency: props.autoBeatFrequency || 5,
      color: '#9B59B6',
      enabled: true,
      volume: 0.3
    }
    startChannel(0, autoChannel)
  }
})

// Watch for track selection changes
watch(() => props.selectedTrackIndex, (newIndex) => {
  if (props.mode !== 'track' || !props.enabled) return
  const track = props.tracks[newIndex]
  if (track) {
    playTrack(track)
  }
})

// Watch for auto beat frequency changes (update oscillator in auto mode)
watch(() => props.autoBeatFrequency, (newFreq) => {
  if (props.mode !== 'auto' || !props.enabled) return
  updateChannelFrequency(0, {
    label: 'Auto',
    baseFrequency: 120,
    beatFrequency: newFreq,
    color: '#9B59B6',
    enabled: true,
    volume: 0.3
  })
})

// Watch for media element changes (re-init tempo detection in auto mode)
watch(() => props.mediaElement, () => {
  if (props.mode === 'auto' && props.enabled && props.mediaElement) {
    initTempoDetection()
  }
})

// Watch for playing state changes (pause/resume)
watch(() => props.playing, (playing) => {
  if (!audioCtx) return
  if (playing) {
    audioCtx.resume()
    // Resume track audio if in track mode
    if (props.mode === 'track' && trackAudio) {
      trackAudio.play().catch(() => {})
    }
  } else {
    audioCtx.suspend()
    if (props.mode === 'track' && trackAudio) {
      trackAudio.pause()
    }
  }
})

// Watch for master volume changes
watch(() => props.volume, (volume) => {
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01)
  }
  if (trackGain && audioCtx) {
    trackGain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01)
  }
})

// Watch for individual channel changes (only in generated mode)
watch(() => props.channels, (channels) => {
  if (props.mode !== 'generated') return
  channels.forEach((channel, index) => {
    if (channel.enabled) {
      if (!channelOscillators.has(index)) {
        startChannel(index, channel)
      } else {
        updateChannelFrequency(index, channel)
        updateChannelVolume(index, channel.volume)
      }
    } else {
      stopChannel(index)
    }
  })
}, { deep: true })

onBeforeUnmount(() => {
  // Clean up all audio resources
  stopAllModes()
  props.channels.forEach((_, index) => {
    stopChannel(index)
  })
  if (masterGain) {
    masterGain.disconnect()
    masterGain = null
  }
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
})
</script>
