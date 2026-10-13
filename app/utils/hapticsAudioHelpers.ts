/**
 * Audio analysis helpers for haptic reactive mode.
 * Extracted from createHapticsEngine to keep it within line limits.
 */

/**
 * Audio frequency metrics.
 */
export interface AudioMetrics {
  volume: number
  bass: number
  mid: number
  high: number
  beat: boolean
}

/**
 * Audio analyser state for haptic reactive mode.
 */
export interface HapticAudioState {
  ctx: AudioContext | null
  analyser: AnalyserNode | null
  source: MediaElementAudioSourceNode | null
  fftSize: number
  dataArray: Uint8Array
  lastBeatTime: number
  beatThreshold: number
  minBeatInterval: number
}

/**
 * Create initial haptic audio state.
 * @param fftSize - FFT size for the analyser.
 * @param beatThreshold - Bass energy threshold for beat detection.
 * @param minBeatInterval - Minimum interval between beats in ms.
 * @returns Initial audio state object.
 */
export function createHapticAudioState(
  fftSize: number = 256,
  beatThreshold: number = 120,
  minBeatInterval: number = 150
): HapticAudioState {
  return {
    ctx: null,
    analyser: null,
    source: null,
    fftSize,
    dataArray: new Uint8Array(fftSize),
    lastBeatTime: 0,
    beatThreshold,
    minBeatInterval
  }
}

/**
 * Initialize audio analyser for a media element.
 * @param state - The haptic audio state.
 * @param mediaElement - Media element to analyze.
 */
export function initHapticAudioAnalyser(
  state: HapticAudioState,
  mediaElement: HTMLVideoElement | HTMLAudioElement
): void {
  if (!state.ctx) {
    state.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (state.ctx.state === 'suspended') state.ctx.resume()
  if (!state.source) {
    try {
      state.source = state.ctx.createMediaElementSource(mediaElement)
    } catch {
      return
    }
  }
  state.analyser = state.ctx.createAnalyser()
  state.analyser.fftSize = state.fftSize
  state.analyser.smoothingTimeConstant = 0.3
  if (state.source) {
    state.source.connect(state.analyser)
    if (!('mozCaptureStream' in mediaElement)) {
      state.analyser.connect(state.ctx.destination)
    }
  }
}

/**
 * Stop and disconnect the audio analyser.
 * @param state - The haptic audio state.
 */
export function stopHapticAudioAnalyser(state: HapticAudioState): void {
  if (state.source) {
    state.source.disconnect()
    state.source = null
  }
  if (state.analyser) {
    state.analyser.disconnect()
    state.analyser = null
  }
}

/**
 * Get audio frequency metrics from the analyser.
 * @param state - The haptic audio state.
 * @returns Audio metrics object.
 */
export function getHapticAudioMetrics(state: HapticAudioState): AudioMetrics {
  if (!state.analyser) return { volume: 0, bass: 0, mid: 0, high: 0, beat: false }
  state.analyser.getByteFrequencyData(state.dataArray as Uint8Array<ArrayBuffer>)
  const length = state.dataArray.length
  const bassEnd = Math.floor(length * 0.1)
  const midEnd = Math.floor(length * 0.5)
  let bass = 0
  let mid = 0
  let high = 0
  for (let i = 0; i < bassEnd; i++) bass += state.dataArray[i]!
  for (let i = bassEnd; i < midEnd; i++) mid += state.dataArray[i]!
  for (let i = midEnd; i < length; i++) high += state.dataArray[i]!
  bass /= bassEnd || 1
  mid /= (midEnd - bassEnd) || 1
  high /= (length - midEnd) || 1
  const volume = (bass + mid + high) / 3
  const now = performance.now()
  const beat = bass > state.beatThreshold && (now - state.lastBeatTime) > state.minBeatInterval
  if (beat) state.lastBeatTime = now
  return { volume: volume / 255, bass: bass / 255, mid: mid / 255, high: high / 255, beat }
}

/**
 * Reactive haptic loop function. Vibrates based on audio metrics.
 * @param state - The haptic audio state.
 * @param intensity - Haptic intensity (0-1).
 * @param playing - Whether audio is playing.
 * @param timerId - Current timer ID ref.
 * @returns New timer ID.
 */
export function hapticReactiveLoop(
  state: HapticAudioState,
  intensity: number,
  playing: boolean,
  timerId: { value: number | null }
): number | null {
  if (!playing) return null
  const metrics = getHapticAudioMetrics(state)
  if (metrics.beat) {
    const duration = Math.round(50 + metrics.bass * 100 * intensity)
    navigator.vibrate?.(duration)
  } else if (metrics.volume > 0.3 * (1 - intensity * 0.5)) {
    const duration = Math.round(20 + metrics.volume * 40 * intensity)
    navigator.vibrate?.(duration)
  }
  return window.setTimeout(() => {
    hapticReactiveLoop(state, intensity, playing, timerId)
  }, 50)
}
