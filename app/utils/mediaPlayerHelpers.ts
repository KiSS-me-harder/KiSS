/**
 * Helper functions for the media player store.
 * Extracted to keep the store within line limits.
 */
import type { BinauralChannel, BinauralMode, BinauralTrack, HapticMode, HapticPattern } from '~/stores/mediaPlayer'

/**
 * Creates binaural beat management functions for the media player store.
 * @param binauralEnabled - Binaural enabled ref.
 * @param binauralVolume - Binaural volume ref.
 * @param binauralChannels - Binaural channels ref.
 * @param binauralMode - Binaural mode ref.
 * @param binauralTracks - Binaural tracks ref.
 * @param selectedTrackIndex - Selected track index ref.
 * @param autoDetectedBpm - Auto detected BPM ref.
 * @param autoDetectedBeatFrequency - Auto detected beat frequency ref.
 * @returns Object with binaural management functions.
 */
export function createBinauralFunctions(
  binauralEnabled: Ref<boolean>,
  binauralVolume: Ref<number>,
  binauralChannels: Ref<BinauralChannel[]>,
  binauralMode: Ref<BinauralMode>,
  binauralTracks: Ref<BinauralTrack[]>,
  selectedTrackIndex: Ref<number>,
  autoDetectedBpm: Ref<number>,
  autoDetectedBeatFrequency: Ref<number>
) {
  function toggleBinaural() {
    binauralEnabled.value = !binauralEnabled.value
  }

  function setBinauralVolume(volume: number) {
    binauralVolume.value = Math.max(0, Math.min(1, volume))
  }

  function toggleChannel(index: number) {
    if (binauralChannels.value[index]) {
      binauralChannels.value[index].enabled = !binauralChannels.value[index].enabled
    }
  }

  function setChannelVolume(index: number, volume: number) {
    if (binauralChannels.value[index]) {
      binauralChannels.value[index].volume = Math.max(0, Math.min(1, volume))
    }
  }

  function setBinauralMode(mode: BinauralMode) {
    binauralMode.value = mode
  }

  function setSelectedTrackIndex(index: number) {
    selectedTrackIndex.value = index
  }

  function addBinauralTrack(track: BinauralTrack) {
    binauralTracks.value.push(track)
  }

  function removeBinauralTrack(index: number) {
    if (binauralTracks.value[index]) {
      binauralTracks.value.splice(index, 1)
      if (selectedTrackIndex.value >= binauralTracks.value.length) {
        selectedTrackIndex.value = Math.max(0, binauralTracks.value.length - 1)
      }
    }
  }

  function setAutoDetectedBpm(bpm: number) {
    autoDetectedBpm.value = bpm
    autoDetectedBeatFrequency.value = bpm / 60
  }

  function getSelectedTrack() {
    return binauralTracks.value[selectedTrackIndex.value] || null
  }

  return { toggleBinaural, setBinauralVolume, toggleChannel, setChannelVolume, setBinauralMode, setSelectedTrackIndex, addBinauralTrack, removeBinauralTrack, setAutoDetectedBpm, getSelectedTrack }
}

/**
 * Creates haptic feedback management functions for the media player store.
 * @param hapticsEnabled - Haptics enabled ref.
 * @param hapticsIntensity - Haptics intensity ref.
 * @param hapticsMode - Haptics mode ref.
 * @param hapticsPatternIndex - Haptics pattern index ref.
 * @param hapticPatterns - Haptic patterns ref.
 * @returns Object with haptic management functions.
 */
export function createHapticsFunctions(
  hapticsEnabled: Ref<boolean>,
  hapticsIntensity: Ref<number>,
  hapticsMode: Ref<HapticMode>,
  hapticsPatternIndex: Ref<number>,
  hapticPatterns: Ref<HapticPattern[]>
) {
  function toggleHaptics() {
    hapticsEnabled.value = !hapticsEnabled.value
  }

  function setHapticsIntensity(intensity: number) {
    hapticsIntensity.value = Math.max(0, Math.min(1, intensity))
  }

  function setHapticsMode(mode: HapticMode) {
    hapticsMode.value = mode
  }

  function setHapticsPatternIndex(index: number) {
    hapticsPatternIndex.value = index
  }

  function addHapticPattern(pattern: HapticPattern) {
    hapticPatterns.value.push(pattern)
  }

  function removeHapticPattern(index: number) {
    if (hapticPatterns.value[index]) {
      hapticPatterns.value.splice(index, 1)
      if (hapticsPatternIndex.value >= hapticPatterns.value.length) {
        hapticsPatternIndex.value = Math.max(0, hapticPatterns.value.length - 1)
      }
    }
  }

  return { toggleHaptics, setHapticsIntensity, setHapticsMode, setHapticsPatternIndex, addHapticPattern, removeHapticPattern }
}

/**
 * Creates media playback control functions for the media player store.
 * @param currentMedia - Current media ref.
 * @param isPlaying - Is playing ref.
 * @param currentTime - Current time ref.
 * @param duration - Duration ref.
 * @param showSpiral - Show spiral ref.
 * @param binauralEnabled - Binaural enabled ref.
 * @param binauralMode - Binaural mode ref.
 * @param autoDetectedBpm - Auto detected BPM ref.
 * @param autoDetectedBeatFrequency - Auto detected beat frequency ref.
 * @param hapticsEnabled - Haptics enabled ref.
 * @param mediaElement - Media element ref.
 * @returns Object with media control functions.
 */
export function createMediaControlFunctions(
  currentMedia: Ref<{ title: string, type: string, url: string, thumbnail?: string, author?: string, duration?: string, currentPage: string } | null>,
  isPlaying: Ref<boolean>,
  currentTime: Ref<number>,
  duration: Ref<number>,
  showSpiral: Ref<boolean>,
  binauralEnabled: Ref<boolean>,
  binauralMode: Ref<string>,
  autoDetectedBpm: Ref<number>,
  autoDetectedBeatFrequency: Ref<number>,
  hapticsEnabled: Ref<boolean>,
  mediaElement: Ref<HTMLVideoElement | HTMLAudioElement | null>
) {
  function setMedia(media: { title: string, type: string, url: string, thumbnail?: string, author?: string, duration?: string, currentPage: string }) {
    currentMedia.value = media
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }

  function clearMedia() {
    currentMedia.value = null
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    binauralEnabled.value = false
    binauralMode.value = 'generated'
    autoDetectedBpm.value = 0
    autoDetectedBeatFrequency.value = 0
    hapticsEnabled.value = false
    mediaElement.value = null
  }

  function setMediaElement(el: HTMLVideoElement | HTMLAudioElement | null) {
    mediaElement.value = el
  }

  function setPlaying(playing: boolean) {
    isPlaying.value = playing
  }

  function setTime(current: number, total: number) {
    currentTime.value = current
    duration.value = total
  }

  function toggleSpiral() {
    showSpiral.value = !showSpiral.value
  }

  return { setMedia, clearMedia, setMediaElement, setPlaying, setTime, toggleSpiral }
}
