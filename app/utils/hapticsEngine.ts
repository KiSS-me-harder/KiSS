/**
 * Haptic feedback engine using the Vibration API.
 * Extracted from useHapticsEngine to keep the composable within line limits.
 */
import type { HapticPattern } from '~/stores/mediaPlayer'
import {
  createHapticAudioState, hapticReactiveLoop,
  initHapticAudioAnalyser, stopHapticAudioAnalyser
} from '~/utils/hapticsAudioHelpers'
import type { HapticAudioState } from '~/utils/hapticsAudioHelpers'

/**
 * Creates a new haptic engine instance.
 * @returns The haptic engine with all control methods.
 */
export function createHapticsEngine() {
  let vibrationTimer: number | null = null
  let reactiveTimer: number | null = null
  const audioState: HapticAudioState = createHapticAudioState()

  function stopVibrationTimer() {
    if (vibrationTimer !== null) {
      clearTimeout(vibrationTimer)
      vibrationTimer = null
    }
  }

  function vibratePattern(pattern: number[], loop: boolean, intensity: number, index: number = 0) {
    const scaledPattern = pattern.map((duration, i) => {
      if (i % 2 === 0) return Math.max(20, Math.round(duration * (0.5 + intensity * 0.5)))
      return Math.max(10, Math.round(duration * (1 - intensity * 0.3)))
    })
    if (index >= scaledPattern.length) {
      if (loop) vibratePattern(pattern, loop, intensity, 0)
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
      vibratePattern(pattern, loop, intensity, index + 1)
    }, duration)
  }

  function startManualMode(pattern: HapticPattern | null, intensity: number, playing: boolean) {
    stopVibrationTimer()
    if (!pattern || !playing) return
    vibratePattern(pattern.pattern, pattern.loop, intensity)
  }

  function stopManualMode() {
    stopVibrationTimer()
    navigator.vibrate?.(0)
  }

  function startReactiveMode(
    intensity: number,
    playing: boolean,
    mediaElement: HTMLVideoElement | HTMLAudioElement | null | undefined
  ) {
    if (reactiveTimer !== null) {
      clearTimeout(reactiveTimer)
      reactiveTimer = null
    }
    if (!playing || !mediaElement) return
    initHapticAudioAnalyser(audioState, mediaElement)
    reactiveTimer = hapticReactiveLoop(audioState, intensity, playing, { value: reactiveTimer }) ?? null
  }

  function stopReactiveMode() {
    if (reactiveTimer !== null) {
      clearTimeout(reactiveTimer)
      reactiveTimer = null
    }
    navigator.vibrate?.(0)
    stopHapticAudioAnalyser(audioState)
  }

  function cleanup() {
    stopManualMode()
    stopReactiveMode()
    if (audioState.ctx) {
      audioState.ctx.close()
      audioState.ctx = null
    }
  }

  return {
    startManualMode, stopManualMode, startReactiveMode, stopReactiveMode, cleanup
  }
}
