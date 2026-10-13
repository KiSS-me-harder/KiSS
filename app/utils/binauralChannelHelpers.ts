/**
 * Binaural channel management helpers.
 * Extracted from createBinauralAudioEngine to keep it within line limits.
 */
import type { BinauralChannel } from '~/stores/mediaPlayer'

/**
 * Channel audio nodes state.
 */
export interface ChannelNodes {
  oscillators: { left: OscillatorNode, right: OscillatorNode }
  gain: GainNode
  panners: { left: StereoPannerNode, right: StereoPannerNode }
}

/**
 * Initialize and connect a binaural channel.
 * @param audioCtx - The audio context.
 * @param masterGain - The master gain node.
 * @param index - Channel index.
 * @param channel - Channel configuration.
 * @param oscillatorsMap - Map to store oscillator references.
 * @param gainsMap - Map to store gain references.
 * @param pannersMap - Map to store panner references.
 */
export function startBinauralChannel(
  audioCtx: AudioContext,
  masterGain: GainNode,
  index: number,
  channel: BinauralChannel,
  oscillatorsMap: Map<number, { left: OscillatorNode, right: OscillatorNode }>,
  gainsMap: Map<number, GainNode>,
  pannersMap: Map<number, { left: StereoPannerNode, right: StereoPannerNode }>
): void {
  if (oscillatorsMap.has(index)) return
  const leftOsc = audioCtx.createOscillator()
  leftOsc.type = 'sine'
  leftOsc.frequency.value = channel.baseFrequency
  const rightOsc = audioCtx.createOscillator()
  rightOsc.type = 'sine'
  rightOsc.frequency.value = channel.baseFrequency + channel.beatFrequency
  const leftPanner = audioCtx.createStereoPanner()
  leftPanner.pan.value = -1
  const rightPanner = audioCtx.createStereoPanner()
  rightPanner.pan.value = 1
  const gain = audioCtx.createGain()
  gain.gain.value = channel.volume
  leftOsc.connect(leftPanner)
  rightOsc.connect(rightPanner)
  leftPanner.connect(gain)
  rightPanner.connect(gain)
  gain.connect(masterGain)
  leftOsc.start()
  rightOsc.start()
  oscillatorsMap.set(index, { left: leftOsc, right: rightOsc })
  gainsMap.set(index, gain)
  pannersMap.set(index, { left: leftPanner, right: rightPanner })
}

/**
 * Stop and disconnect a binaural channel.
 * @param index - Channel index.
 * @param oscillatorsMap - Map of oscillator references.
 * @param gainsMap - Map of gain references.
 * @param pannersMap - Map of panner references.
 */
export function stopBinauralChannel(
  index: number,
  oscillatorsMap: Map<number, { left: OscillatorNode, right: OscillatorNode }>,
  gainsMap: Map<number, GainNode>,
  pannersMap: Map<number, { left: StereoPannerNode, right: StereoPannerNode }>
): void {
  const oscillators = oscillatorsMap.get(index)
  if (oscillators) {
    try {
      oscillators.left.stop()
      oscillators.right.stop()
    } catch { /* Already stopped */ }
    oscillators.left.disconnect()
    oscillators.right.disconnect()
    oscillatorsMap.delete(index)
  }
  const gain = gainsMap.get(index)
  if (gain) {
    gain.disconnect()
    gainsMap.delete(index)
  }
  const panners = pannersMap.get(index)
  if (panners) {
    panners.left.disconnect()
    panners.right.disconnect()
    pannersMap.delete(index)
  }
}

/**
 * Update the volume of a binaural channel.
 * @param index - Channel index.
 * @param volume - New volume value.
 * @param audioCtx - Audio context.
 * @param gainsMap - Map of gain references.
 */
export function updateBinauralChannelVolume(
  index: number,
  volume: number,
  audioCtx: AudioContext | null,
  gainsMap: Map<number, GainNode>
): void {
  const gain = gainsMap.get(index)
  if (gain && audioCtx) gain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01)
}

/**
 * Update the frequency of a binaural channel.
 * @param index - Channel index.
 * @param channel - Channel configuration.
 * @param audioCtx - Audio context.
 * @param oscillatorsMap - Map of oscillator references.
 */
export function updateBinauralChannelFrequency(
  index: number,
  channel: BinauralChannel,
  audioCtx: AudioContext | null,
  oscillatorsMap: Map<number, { left: OscillatorNode, right: OscillatorNode }>
): void {
  const oscillators = oscillatorsMap.get(index)
  if (oscillators && audioCtx) {
    oscillators.left.frequency.setTargetAtTime(channel.baseFrequency, audioCtx.currentTime, 0.01)
    oscillators.right.frequency.setTargetAtTime(
      channel.baseFrequency + channel.beatFrequency, audioCtx.currentTime, 0.01
    )
  }
}

/**
 * Stop all binaural channels.
 * @param channels - Array of channel configurations.
 * @param oscillatorsMap - Map of oscillator references.
 * @param gainsMap - Map of gain references.
 * @param pannersMap - Map of panner references.
 */
export function stopAllBinauralChannels(
  channels: BinauralChannel[],
  oscillatorsMap: Map<number, { left: OscillatorNode, right: OscillatorNode }>,
  gainsMap: Map<number, GainNode>,
  pannersMap: Map<number, { left: StereoPannerNode, right: StereoPannerNode }>
): void {
  channels.forEach((_, index) => stopBinauralChannel(index, oscillatorsMap, gainsMap, pannersMap))
}
