<template>
  <div />
</template>

<script setup lang="ts">
import type { HapticPattern, HapticMode } from '../stores/mediaPlayer'

const props = defineProps<{
  enabled: boolean
  intensity: number
  mode: HapticMode
  pattern: HapticPattern | null
  playing: boolean
  /** Media element reference for reactive mode */
  mediaElement?: HTMLVideoElement | HTMLAudioElement | null
}>()

let vibrationTimer: number | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let source: MediaElementAudioSourceNode | null = null
let reactiveTimer: number | null = null
const fftSize = 256
const dataArray = new Uint8Array(fftSize)

// --- Manual Pattern Mode ---

function stopVibrationTimer() {
  if (vibrationTimer !== null) {
    clearTimeout(vibrationTimer)
    vibrationTimer = null
  }
}

function vibratePattern(pattern: number[], loop: boolean, index: number = 0) {
  if (!props.enabled || !props.playing) return

  // Scale pattern durations by intensity (higher intensity = shorter pauses, longer vibrations)
  const scaledPattern = pattern.map((duration, i) => {
    // Even indices are vibration, odd are pause
    if (i % 2 === 0) {
      // Vibration: scale by intensity
      return Math.max(20, Math.round(duration * (0.5 + props.intensity * 0.5)))
    } else {
      // Pause: reduce at higher intensity
      return Math.max(10, Math.round(duration * (1 - props.intensity * 0.3)))
    }
  })

  if (index >= scaledPattern.length) {
    if (loop) {
      vibratePattern(pattern, loop, 0)
    }
    return
  }

  const duration = scaledPattern[index]
  if (duration === undefined) return
  const isVibration = index % 2 === 0

  if (isVibration && navigator.vibrate) {
    navigator.vibrate(duration)
  } else if (navigator.vibrate) {
    navigator.vibrate(0)
  }

  vibrationTimer = window.setTimeout(() => {
    vibratePattern(pattern, loop, index + 1)
  }, duration)
}

function startManualMode() {
  stopVibrationTimer()
  if (!props.enabled || !props.playing || !props.pattern) return
  vibratePattern(props.pattern.pattern, props.pattern.loop)
}

function stopManualMode() {
  stopVibrationTimer()
  navigator.vibrate?.(0)
}

// --- Reactive Mode ---

function initAudioAnalyser() {
  if (!props.mediaElement) return

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  // Create source if not already created
  if (!source) {
    try {
      source = audioCtx.createMediaElementSource(props.mediaElement)
    } catch {
      // Source already connected, skip
      return
    }
  }

  analyser = audioCtx.createAnalyser()
  analyser.fftSize = fftSize
  analyser.smoothingTimeConstant = 0.3

  if (source) {
    source.connect(analyser)
    // Connect analyser back to destination to not break audio
    // Only if not already connected to destination
    if (!('mozCaptureStream' in props.mediaElement)) {
      analyser.connect(audioCtx.destination)
    }
  }
}

function stopAudioAnalyser() {
  if (source) {
    source.disconnect()
    source = null
  }
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }
}

let lastBeatTime = 0
const beatThreshold = 120 // Minimum volume to trigger a beat vibration
const minBeatInterval = 150 // Minimum ms between beats to avoid spam

function getAudioMetrics() {
  if (!analyser) {
    return { volume: 0, bass: 0, mid: 0, high: 0, beat: false }
  }

  analyser.getByteFrequencyData(dataArray)

  // Calculate volume bands
  const length = dataArray.length
  const bassEnd = Math.floor(length * 0.1)
  const midEnd = Math.floor(length * 0.5)

  let bass = 0
  let mid = 0
  let high = 0

  for (let i = 0; i < bassEnd; i++) {
    bass += dataArray[i]!
  }
  for (let i = bassEnd; i < midEnd; i++) {
    mid += dataArray[i]!
  }
  for (let i = midEnd; i < length; i++) {
    high += dataArray[i]!
  }

  bass /= bassEnd || 1
  mid /= (midEnd - bassEnd) || 1
  high /= (length - midEnd) || 1

  const volume = (bass + mid + high) / 3

  // Beat detection: sudden increase in bass
  const now = performance.now()
  const beat = bass > beatThreshold && (now - lastBeatTime) > minBeatInterval
  if (beat) {
    lastBeatTime = now
  }

  return { volume: volume / 255, bass: bass / 255, mid: mid / 255, high: high / 255, beat }
}

function reactiveLoop() {
  if (!props.enabled || !props.playing) return

  const metrics = getAudioMetrics()

  // Combine beat detection with volume-based continuous feedback
  if (metrics.beat) {
    // Strong beat: short, strong vibration
    const duration = Math.round(50 + metrics.bass * 100 * props.intensity)
    navigator.vibrate?.(duration)
  } else if (metrics.volume > 0.3 * (1 - props.intensity * 0.5)) {
    // Continuous low-level vibration based on volume
    const duration = Math.round(20 + metrics.volume * 40 * props.intensity)
    navigator.vibrate?.(duration)
  }

  reactiveTimer = window.setTimeout(reactiveLoop, 50)
}

function startReactiveMode() {
  if (reactiveTimer !== null) {
    clearTimeout(reactiveTimer)
    reactiveTimer = null
  }
  if (!props.enabled || !props.playing) return

  initAudioAnalyser()
  reactiveLoop()
}

function stopReactiveMode() {
  if (reactiveTimer !== null) {
    clearTimeout(reactiveTimer)
    reactiveTimer = null
  }
  navigator.vibrate?.(0)
  stopAudioAnalyser()
}

// --- Watchers ---

watch(() => props.enabled, (enabled) => {
  if (enabled) {
    if (props.mode === 'manual') {
      startManualMode()
    } else {
      startReactiveMode()
    }
  } else {
    stopManualMode()
    stopReactiveMode()
  }
})

watch(() => props.playing, (playing) => {
  if (!props.enabled) return
  if (playing) {
    if (props.mode === 'manual') {
      startManualMode()
    } else {
      startReactiveMode()
    }
  } else {
    stopManualMode()
    stopReactiveMode()
  }
})

watch(() => props.mode, (mode) => {
  if (!props.enabled) return
  stopManualMode()
  stopReactiveMode()
  if (props.playing) {
    if (mode === 'manual') {
      startManualMode()
    } else {
      startReactiveMode()
    }
  }
})

watch(() => props.pattern, () => {
  if (props.enabled && props.mode === 'manual' && props.playing) {
    stopManualMode()
    startManualMode()
  }
}, { deep: true })

watch(() => props.intensity, () => {
  // Patterns will pick up new intensity on next iteration
})

onBeforeUnmount(() => {
  stopManualMode()
  stopReactiveMode()
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
})
</script>
