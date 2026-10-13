/**
 * Binaural beats audio engine factory using the Web Audio API.
 * Extracted from useBinauralBeats to keep the composable within line limits.
 */
import type { BinauralChannel, BinauralTrack } from '~/stores/mediaPlayer'
import {
  startBinauralChannel, stopBinauralChannel, stopAllBinauralChannels,
  updateBinauralChannelFrequency, updateBinauralChannelVolume
} from '~/utils/binauralChannelHelpers'
import { createTempoState, initTempoDetection, stopTempoDetection } from '~/utils/binauralTempoHelpers'
import type { TempoState } from '~/utils/binauralTempoHelpers'

/**
 * Creates a new binaural audio engine instance.
 * @returns The binaural audio engine with all control methods.
 */
export function createBinauralAudioEngine() {
  let audioCtx: AudioContext | null = null
  let masterGain: GainNode | null = null
  const channelGains = new Map<number, GainNode>()
  const channelOscillators = new Map<number, { left: OscillatorNode, right: OscillatorNode }>()
  const channelPanners = new Map<number, { left: StereoPannerNode, right: StereoPannerNode }>()

  let trackAudio: HTMLAudioElement | null = null
  let trackGain: GainNode | null = null
  let trackSource: MediaElementAudioSourceNode | null = null

  const tempoState: TempoState = createTempoState(512)

  function initAudio() {
    if (audioCtx) return
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    masterGain = audioCtx.createGain()
    masterGain.connect(audioCtx.destination)
  }

  function startChannel(index: number, channel: BinauralChannel) {
    if (!audioCtx || !masterGain) return
    startBinauralChannel(audioCtx, masterGain, index, channel, channelOscillators, channelGains, channelPanners)
  }

  function stopChannel(index: number) {
    stopBinauralChannel(index, channelOscillators, channelGains, channelPanners)
  }

  function updateChannelVolume(index: number, volume: number) {
    updateBinauralChannelVolume(index, volume, audioCtx, channelGains)
  }

  function updateChannelFrequency(index: number, channel: BinauralChannel) {
    updateBinauralChannelFrequency(index, channel, audioCtx, channelOscillators)
  }

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

  function playTrack(track: BinauralTrack, volume: number) {
    stopTrack()
    if (!audioCtx || !masterGain) return
    trackAudio = new Audio()
    trackAudio.crossOrigin = 'anonymous'
    trackAudio.loop = true
    trackAudio.src = track.url
    trackGain = audioCtx.createGain()
    trackGain.gain.value = volume
    trackAudio.addEventListener('canplaythrough', () => {
      if (!trackSource || !trackGain || !masterGain) return
      try {
        trackSource.connect(trackGain)
        trackGain.connect(masterGain)
      } catch { /* Already connected */ }
      trackAudio!.play().catch(() => {})
    }, { once: true })
  }

  function initTempoDetectionWrapper(mediaElement: HTMLVideoElement | HTMLAudioElement | null) {
    if (!mediaElement || !audioCtx) return
    initTempoDetection(tempoState, audioCtx, mediaElement)
  }

  function stopAllModes(channels: BinauralChannel[]) {
    stopAllBinauralChannels(channels, channelOscillators, channelGains, channelPanners)
    stopTrack()
    stopTempoDetection(tempoState)
  }

  function cleanup(channels: BinauralChannel[]) {
    stopAllModes(channels)
    if (masterGain) {
      masterGain.disconnect()
      masterGain = null
    }
    if (audioCtx) {
      audioCtx.close()
      audioCtx = null
    }
  }

  return {
    initAudio, startChannel, stopChannel, updateChannelVolume, updateChannelFrequency,
    playTrack, stopTrack, initTempoDetection: initTempoDetectionWrapper,
    stopTempoDetection: () => stopTempoDetection(tempoState),
    stopAllModes, cleanup
  }
}
