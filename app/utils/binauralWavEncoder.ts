import type { FrequencyBand } from '~/composables/useBinauralBeats'

/**
 * Encodes audio data as a WAV file blob.
 * @param samples - Interleaved stereo float32 audio samples.
 * @param sampleRate - The sample rate in Hz (e.g., 44100).
 * @returns A Blob containing the WAV file.
 */
export function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 2
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // byte rate
  view.setUint16(32, numChannels * 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // Write PCM samples
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF
    view.setInt16(44 + i * 2, val, true)
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Writes a string to a DataView at the given offset.
 * @param view - The DataView to write to.
 * @param offset - The byte offset.
 * @param str - The string to write.
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/**
 * Generates binaural beats audio from the given frequency bands.
 * @param bands - The frequency band configurations.
 * @param durationSeconds - Total duration in seconds.
 * @param sampleRate - Audio sample rate (default 44100).
 * @returns A Promise resolving to a WAV Blob.
 */
export async function generateBinauralAudio(
  bands: FrequencyBand[],
  durationSeconds: number,
  sampleRate: number = 44100
): Promise<Blob> {
  const totalSamples = sampleRate * durationSeconds
  const samples = new Float32Array(totalSamples * 2) // stereo

  // Generate audio using OfflineAudioContext for proper rendering
  if (import.meta.client) {
    const offlineContext = new OfflineAudioContext(2, totalSamples, sampleRate)

    bands.forEach((band) => {
      if (band.volume > 0) {
        // Left ear oscillator
        const leftOsc = offlineContext.createOscillator()
        const leftGain = offlineContext.createGain()
        const leftPanner = offlineContext.createStereoPanner()
        leftOsc.frequency.value = band.frequency
        leftOsc.type = 'sine'
        leftGain.gain.value = band.volume * 0.1
        leftPanner.pan.value = -1
        leftOsc.connect(leftGain)
        leftGain.connect(leftPanner)
        leftPanner.connect(offlineContext.destination)
        leftOsc.start(0)
        leftOsc.stop(durationSeconds)

        // Right ear oscillator
        const rightOsc = offlineContext.createOscillator()
        const rightGain = offlineContext.createGain()
        const rightPanner = offlineContext.createStereoPanner()
        rightOsc.frequency.value = band.frequency + band.beat
        rightOsc.type = 'sine'
        rightGain.gain.value = band.volume * 0.1
        rightPanner.pan.value = 1
        rightOsc.connect(rightGain)
        rightGain.connect(rightPanner)
        rightPanner.connect(offlineContext.destination)
        rightOsc.start(0)
        rightOsc.stop(durationSeconds)
      }
    })

    const offlineBuffer = await offlineContext.startRendering()
    const leftChannel = offlineBuffer.getChannelData(0)
    const rightChannel = offlineBuffer.getChannelData(1)

    // Interleave stereo channels
    for (let i = 0; i < totalSamples; i++) {
      samples[i * 2] = leftChannel[i]
      samples[i * 2 + 1] = rightChannel[i]
    }
  }

  return encodeWAV(samples, sampleRate)
}

/**
 * Triggers a browser download for the given blob.
 * @param blob - The audio blob to download.
 * @param filename - The download filename.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  if (!import.meta.client) return

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
