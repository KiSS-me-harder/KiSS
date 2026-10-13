import { createHapticsEngine } from '~/utils/hapticsEngine'

/**
 * Composable for haptic feedback using the Vibration API.
 * Supports two modes: manual (predefined patterns) and reactive (audio-reactive).
 */
export function useHapticsEngine() {
  const engine = createHapticsEngine()
  return {
    startManualMode: engine.startManualMode,
    stopManualMode: engine.stopManualMode,
    startReactiveMode: engine.startReactiveMode,
    stopReactiveMode: engine.stopReactiveMode,
    cleanup: engine.cleanup
  }
}
