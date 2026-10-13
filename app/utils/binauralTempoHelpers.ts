/**
 * Binaural tempo detection helpers.
 * Extracted from createBinauralAudioEngine to keep it within line limits.
 */

/**
 * Tempo detection state.
 */
export interface TempoState {
  analyser: AnalyserNode | null
  source: MediaElementAudioSourceNode | null
  timer: number | null
  fftSize: number
  dataArray: Uint8Array
  lastBeatTimes: number[]
}

/**
 * Create initial tempo detection state.
 * @param fftSize - FFT size for the analyser.
 * @returns Initial tempo state object.
 */
export function createTempoState(fftSize: number = 512): TempoState {
  return {
    analyser: null,
    source: null,
    timer: null,
    fftSize,
    dataArray: new Uint8Array(fftSize),
    lastBeatTimes: []
  }
}

/**
 * Stop tempo detection and clean up resources.
 * @param state - The tempo state object.
 */
export function stopTempoDetection(state: TempoState): void {
  if (state.timer !== null) {
    clearInterval(state.timer)
    state.timer = null
  }
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
 * Detect tempo from audio frequency data.
 * @param state - The tempo state object.
 * @param playing - Whether audio is currently playing.
 */
export function detectTempo(state: TempoState, playing: boolean): void {
  if (!state.analyser || !playing) return
  state.analyser.getByteFrequencyData(state.dataArray as Uint8Array<ArrayBuffer>)
  const bassEnd = Math.floor(state.dataArray.length * 0.15)
  let bassEnergy = 0
  for (let i = 0; i < bassEnd; i++) bassEnergy += state.dataArray[i]!
  bassEnergy /= bassEnd || 1
  const now = performance.now()
  if (bassEnergy > 140) {
    state.lastBeatTimes = state.lastBeatTimes.filter(t => now - t < 2000)
    if (state.lastBeatTimes.length === 0 || now - state.lastBeatTimes[state.lastBeatTimes.length - 1]! > 50) {
      state.lastBeatTimes.push(now)
    }
  }
  if (state.lastBeatTimes.length >= 4) {
    const intervals: number[] = []
    for (let i = 1; i < state.lastBeatTimes.length; i++) {
      intervals.push(state.lastBeatTimes[i]! - state.lastBeatTimes[i - 1]!)
    }
    intervals.sort((a, b) => a - b)
    const medianInterval = intervals[Math.floor(intervals.length / 2)]
    if (medianInterval && medianInterval > 200 && medianInterval < 2000) {
      const bpm = Math.round(60000 / medianInterval)
      if (bpm >= 40 && bpm <= 200) {
        window.dispatchEvent(new CustomEvent('binaural-tempo-detected', { detail: bpm }))
      }
    }
  }
}

/**
 * Initialize tempo detection for a media element.
 * @param state - The tempo state object.
 * @param audioCtx - Audio context.
 * @param mediaElement - Media element to analyze.
 * @param intervalMs - Detection interval in milliseconds.
 */
export function initTempoDetection(
  state: TempoState,
  audioCtx: AudioContext,
  mediaElement: HTMLVideoElement | HTMLAudioElement,
  intervalMs: number = 50
): void {
  stopTempoDetection(state)
  try {
    state.source = audioCtx.createMediaElementSource(mediaElement)
  } catch {
    return
  }
  state.analyser = audioCtx.createAnalyser()
  state.analyser.fftSize = state.fftSize
  state.analyser.smoothingTimeConstant = 0.8
  state.source.connect(state.analyser)
  state.timer = window.setInterval(() => detectTempo(state, true), intervalMs)
}
