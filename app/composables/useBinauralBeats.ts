import { createBinauralAudioEngine } from '~/utils/binauralAudioEngine'

/**
 * Represents a single frequency band in the binaural beats equalizer.
 */
export interface FrequencyBand {
  /** Label for the band (e.g., "Delta", "Theta"). */
  label: string
  /** Color used for the band indicator. */
  color: string
  /** Base frequency in Hz for this band. */
  frequency: number
  /** Volume level from 0 to 1. */
  volume: number
  /** Beat frequency offset in Hz. */
  beat: number
}

/**
 * Default frequency bands covering the full brainwave spectrum.
 */
export const DEFAULT_BANDS: FrequencyBand[] = [
  { label: 'Delta', color: '#8B4513', frequency: 100, volume: 0.3, beat: 2 },
  { label: 'Theta', color: '#DC143C', frequency: 120, volume: 0.3, beat: 5 },
  { label: 'Alpha', color: '#FF6347', frequency: 150, volume: 0.3, beat: 10 },
  { label: 'Beta', color: '#ADFF2F', frequency: 180, volume: 0.3, beat: 18 },
  { label: 'Gamma', color: '#00CED1', frequency: 200, volume: 0.3, beat: 30 },
  { label: 'High Gamma', color: '#4169E1', frequency: 250, volume: 0.3, beat: 40 },
  { label: 'Deep', color: '#8A2BE2', frequency: 80, volume: 0.3, beat: 1 },
  { label: 'Ultra', color: '#9370DB', frequency: 300, volume: 0.3, beat: 35 }
]

/**
 * Preset configurations for common brainwave states.
 */
export interface BinauralPreset {
  /** Display name of the preset. */
  name: string
  /** Icon or emoji for the preset. */
  icon: string
  /** The band configurations for this preset. */
  bands: FrequencyBand[]
}

/**
 * Available presets for quick configuration.
 */
export const PRESETS: BinauralPreset[] = [
  {
    name: 'Delta (Sleep)',
    icon: '🌙',
    bands: [
      { label: 'Delta', color: '#8B4513', frequency: 100, volume: 0.8, beat: 2 },
      { label: 'Theta', color: '#DC143C', frequency: 120, volume: 0.2, beat: 4 },
      { label: 'Alpha', color: '#FF6347', frequency: 150, volume: 0.0, beat: 0 },
      { label: 'Beta', color: '#ADFF2F', frequency: 180, volume: 0.0, beat: 0 },
      { label: 'Gamma', color: '#00CED1', frequency: 200, volume: 0.0, beat: 0 },
      { label: 'High Gamma', color: '#4169E1', frequency: 250, volume: 0.0, beat: 0 },
      { label: 'Deep', color: '#8A2BE2', frequency: 80, volume: 0.6, beat: 1 },
      { label: 'Ultra', color: '#9370DB', frequency: 300, volume: 0.0, beat: 0 }
    ]
  },
  {
    name: 'Theta (Meditation)',
    icon: '🧘',
    bands: [
      { label: 'Delta', color: '#8B4513', frequency: 100, volume: 0.2, beat: 3 },
      { label: 'Theta', color: '#DC143C', frequency: 120, volume: 0.8, beat: 6 },
      { label: 'Alpha', color: '#FF6347', frequency: 150, volume: 0.3, beat: 8 },
      { label: 'Beta', color: '#ADFF2F', frequency: 180, volume: 0.0, beat: 0 },
      { label: 'Gamma', color: '#00CED1', frequency: 200, volume: 0.0, beat: 0 },
      { label: 'High Gamma', color: '#4169E1', frequency: 250, volume: 0.0, beat: 0 },
      { label: 'Deep', color: '#8A2BE2', frequency: 80, volume: 0.3, beat: 2 },
      { label: 'Ultra', color: '#9370DB', frequency: 300, volume: 0.0, beat: 0 }
    ]
  },
  {
    name: 'Alpha (Relaxation)',
    icon: '🌊',
    bands: [
      { label: 'Delta', color: '#8B4513', frequency: 100, volume: 0.0, beat: 0 },
      { label: 'Theta', color: '#DC143C', frequency: 120, volume: 0.3, beat: 5 },
      { label: 'Alpha', color: '#FF6347', frequency: 150, volume: 0.8, beat: 10 },
      { label: 'Beta', color: '#ADFF2F', frequency: 180, volume: 0.2, beat: 12 },
      { label: 'Gamma', color: '#00CED1', frequency: 200, volume: 0.0, beat: 0 },
      { label: 'High Gamma', color: '#4169E1', frequency: 250, volume: 0.0, beat: 0 },
      { label: 'Deep', color: '#8A2BE2', frequency: 80, volume: 0.0, beat: 0 },
      { label: 'Ultra', color: '#9370DB', frequency: 300, volume: 0.0, beat: 0 }
    ]
  },
  {
    name: 'Beta (Focus)',
    icon: '🎯',
    bands: [
      { label: 'Delta', color: '#8B4513', frequency: 100, volume: 0.0, beat: 0 },
      { label: 'Theta', color: '#DC143C', frequency: 120, volume: 0.0, beat: 0 },
      { label: 'Alpha', color: '#FF6347', frequency: 150, volume: 0.3, beat: 10 },
      { label: 'Beta', color: '#ADFF2F', frequency: 180, volume: 0.8, beat: 20 },
      { label: 'Gamma', color: '#00CED1', frequency: 200, volume: 0.3, beat: 25 },
      { label: 'High Gamma', color: '#4169E1', frequency: 250, volume: 0.0, beat: 0 },
      { label: 'Deep', color: '#8A2BE2', frequency: 80, volume: 0.0, beat: 0 },
      { label: 'Ultra', color: '#9370DB', frequency: 300, volume: 0.0, beat: 0 }
    ]
  },
  {
    name: 'Gamma (Cognition)',
    icon: '⚡',
    bands: [
      { label: 'Delta', color: '#8B4513', frequency: 100, volume: 0.0, beat: 0 },
      { label: 'Theta', color: '#DC143C', frequency: 120, volume: 0.0, beat: 0 },
      { label: 'Alpha', color: '#FF6347', frequency: 150, volume: 0.2, beat: 10 },
      { label: 'Beta', color: '#ADFF2F', frequency: 180, volume: 0.3, beat: 20 },
      { label: 'Gamma', color: '#00CED1', frequency: 200, volume: 0.8, beat: 35 },
      { label: 'High Gamma', color: '#4169E1', frequency: 250, volume: 0.6, beat: 40 },
      { label: 'Deep', color: '#8A2BE2', frequency: 80, volume: 0.0, beat: 0 },
      { label: 'Ultra', color: '#9370DB', frequency: 300, volume: 0.4, beat: 38 }
    ]
  }
]

/**
 * Creates a reactive list of frequency bands initialized from the default bands.
 * @returns A reactive array of frequency bands.
 */
export function useFrequencyBands() {
  const bands = ref<FrequencyBand[]>(DEFAULT_BANDS.map(b => ({ ...b })))

  /**
   * Applies a preset configuration to the bands.
   * @param preset - The preset to apply.
   */
  function applyPreset(preset: BinauralPreset) {
    bands.value = preset.bands.map(b => ({ ...b }))
  }

  return {
    bands,
    applyPreset
  }
}

// ── Legacy API for BinauralBeats component ──

/**
 * Legacy binaural beats composable for the BinauralBeats component.
 * Delegates to the binaural audio engine for Web Audio API operations.
 * @returns The binaural audio engine with all control methods.
 */
export function useBinauralBeats() {
  const engine = createBinauralAudioEngine()
  return engine
}
