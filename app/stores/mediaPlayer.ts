/**
 * Pinia store for media playback, binaural beats, and haptics.
 * Manages current media state, binaural channel configuration, and haptic feedback settings.
 */
import { createBinauralFunctions, createHapticsFunctions, createMediaControlFunctions } from '~/utils/mediaPlayerHelpers'

export interface PlayingMedia {
  title: string
  type: 'video' | 'audio'
  url: string
  thumbnail?: string | null
  author?: string
  duration?: string | null
  currentPage: string
}

export interface BinauralChannel {
  /** Label for the channel */
  label: string
  /** Base frequency in Hz (left ear) */
  baseFrequency: number
  /** Beat frequency in Hz (difference between left and right) */
  beatFrequency: number
  /** Color for the UI indicator */
  color: string
  /** Whether this channel is currently active */
  enabled: boolean
  /** Volume for this channel (0-1) */
  volume: number
}

export interface BinauralTrack {
  /** Unique identifier */
  id: string
  /** Display name */
  title: string
  /** Description of the track */
  description: string
  /** Audio file URL */
  url: string
  /** Duration string for display */
  duration?: string
  /** Tags for categorization */
  tags?: string[]
  /** Recommended brainwave state */
  brainwave?: string
}

export type BinauralMode = 'generated' | 'track' | 'auto'

export interface HapticPattern {
  /** Name of the pattern */
  name: string
  /** Vibration pattern in milliseconds: [vibrate, pause, vibrate, pause, ...] */
  pattern: number[]
  /** Whether this pattern loops */
  loop: boolean
}

export type HapticMode = 'manual' | 'reactive'

export const defaultHapticPatterns: HapticPattern[] = [
  { name: 'Pulse', pattern: [100, 50], loop: true },
  { name: 'Double Tap', pattern: [50, 50, 50], loop: false },
  { name: 'Heartbeat', pattern: [100, 80, 50, 200], loop: true },
  { name: 'Rumble', pattern: [200, 100], loop: true },
  { name: 'Subtle', pattern: [50, 150], loop: true },
  { name: 'Strong', pattern: [300, 100], loop: true }
]

const defaultChannels: BinauralChannel[] = [
  { label: 'Delta', baseFrequency: 120, beatFrequency: 2, color: '#8B4513', enabled: false, volume: 0.3 },
  { label: 'Theta', baseFrequency: 120, beatFrequency: 5, color: '#DC143C', enabled: false, volume: 0.3 },
  { label: 'Alpha', baseFrequency: 120, beatFrequency: 8, color: '#FF6347', enabled: false, volume: 0.3 },
  { label: 'Beta 1', baseFrequency: 120, beatFrequency: 12, color: '#ADFF2F', enabled: false, volume: 0.3 },
  { label: 'Beta 2', baseFrequency: 120, beatFrequency: 16, color: '#00FA9A', enabled: false, volume: 0.3 },
  { label: 'Gamma 1', baseFrequency: 120, beatFrequency: 25, color: '#00CED1', enabled: false, volume: 0.3 },
  { label: 'Gamma 2', baseFrequency: 120, beatFrequency: 35, color: '#4169E1', enabled: false, volume: 0.3 },
  { label: 'Gamma 3', baseFrequency: 120, beatFrequency: 40, color: '#8A2BE2', enabled: false, volume: 0.3 }
]

const defaultTracks: BinauralTrack[] = [
  {
    id: 'deep-sleep',
    title: 'Deep Sleep',
    description: 'Delta wave binaural track for deep, restorative sleep.',
    url: '/binaural/deep-sleep.mp3',
    duration: '30:00',
    tags: ['sleep', 'relaxation'],
    brainwave: 'Delta'
  },
  {
    id: 'deep-meditation',
    title: 'Deep Meditation',
    description: 'Theta wave binaural track for deep meditation and trance states.',
    url: '/binaural/deep-meditation.mp3',
    duration: '20:00',
    tags: ['meditation', 'trance'],
    brainwave: 'Theta'
  },
  {
    id: 'relaxation',
    title: 'Relaxation',
    description: 'Alpha wave binaural track for calm relaxation and stress relief.',
    url: '/binaural/relaxation.mp3',
    duration: '25:00',
    tags: ['relaxation', 'stress-relief'],
    brainwave: 'Alpha'
  },
  {
    id: 'focus',
    title: 'Focus',
    description: 'Beta wave binaural track for concentration and mental focus.',
    url: '/binaural/focus.mp3',
    duration: '45:00',
    tags: ['focus', 'concentration'],
    brainwave: 'Beta'
  },
  {
    id: 'heightened-perception',
    title: 'Heightened Perception',
    description: 'Gamma wave binaural track for heightened awareness and perception.',
    url: '/binaural/heightened-perception.mp3',
    duration: '20:00',
    tags: ['perception', 'awareness'],
    brainwave: 'Gamma'
  },
  {
    id: 'hypnosis-induction',
    title: 'Hypnosis Induction',
    description: 'Theta-Alpha blend for guided hypnosis induction sessions.',
    url: '/binaural/hypnosis-induction.mp3',
    duration: '15:00',
    tags: ['hypnosis', 'induction'],
    brainwave: 'Theta'
  }
]

export const useMediaPlayerStore = defineStore('mediaPlayer', () => {
  const currentMedia = ref<PlayingMedia | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const showSpiral = ref(false)

  // Binaural beat state
  const binauralEnabled = ref(false)
  const binauralVolume = ref(0.5)
  const binauralChannels = ref<BinauralChannel[]>(defaultChannels.map(c => ({ ...c })))
  const binauralMode = ref<BinauralMode>('generated')
  const binauralTracks = ref<BinauralTrack[]>(defaultTracks.map(t => ({ ...t })))
  const selectedTrackIndex = ref(0)
  const autoDetectedBpm = ref(0)
  const autoDetectedBeatFrequency = ref(0)

  // Haptics state
  const hapticsEnabled = ref(false)
  const hapticsIntensity = ref(0.5)
  const hapticsMode = ref<HapticMode>('reactive')
  const hapticsPatternIndex = ref(0)
  const hapticPatterns = ref<HapticPattern[]>(defaultHapticPatterns.map(p => ({ ...p })))
  const mediaElement = ref<HTMLVideoElement | HTMLAudioElement | null>(null)

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const mediaControls = createMediaControlFunctions(
    currentMedia as Ref<{ title: string, type: string, url: string, thumbnail?: string, author?: string, duration?: string, currentPage: string } | null>, isPlaying, currentTime, duration, showSpiral,
    binauralEnabled, binauralMode, autoDetectedBpm, autoDetectedBeatFrequency,
    hapticsEnabled, mediaElement
  )

  const binauralFunctions = createBinauralFunctions(
    binauralEnabled, binauralVolume, binauralChannels, binauralMode,
    binauralTracks, selectedTrackIndex, autoDetectedBpm, autoDetectedBeatFrequency
  )

  const hapticsFunctions = createHapticsFunctions(
    hapticsEnabled, hapticsIntensity, hapticsMode, hapticsPatternIndex, hapticPatterns
  )

  return {
    currentMedia, isPlaying, currentTime, duration, progress, showSpiral,
    binauralEnabled, binauralVolume, binauralChannels, binauralMode,
    binauralTracks, selectedTrackIndex, autoDetectedBpm, autoDetectedBeatFrequency,
    hapticsEnabled, hapticsIntensity, hapticsMode, hapticsPatternIndex,
    hapticPatterns, mediaElement,
    ...mediaControls,
    ...binauralFunctions,
    ...hapticsFunctions
  }
})
