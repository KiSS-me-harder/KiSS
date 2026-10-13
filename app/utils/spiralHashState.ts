/**
 * URL hash-based state management for spiral visuals.
 * Encodes spiral layers and focus configuration into a URL hash fragment
 * so the current setup can be shared via URL or restored on page reload.
 */

import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'
import type { FocusConfig } from '~/utils/spiralFocus'

/**
 * Serializable layer properties excluded from hash state.
 * `id` and `angle`/`cumulativeAngle` are runtime-only and not persisted.
 */
export interface HashLayer {
  template: string
  color: string
  size: number
  speed: number
  direction: string
  intensity: number
}

/**
 * Full serializable spiral state stored in the URL hash.
 */
export interface SpiralHashState {
  layers: HashLayer[]
  focus: FocusConfig
}

/**
 * Hash key used in the URL fragment.
 */
const HASH_KEY = 'spiral'

/**
 * Serializes a SpiralLayer to a HashLayer, stripping runtime-only fields.
 * @param layer - The spiral layer to serialize.
 * @returns A plain object with only hash-worthy properties.
 */
function serializeLayer(layer: SpiralLayer): HashLayer {
  return {
    template: layer.template,
    color: layer.color,
    size: layer.size,
    speed: layer.speed,
    direction: layer.direction,
    intensity: layer.intensity
  }
}

/**
 * Encodes the current spiral state into a compact URL hash string.
 * Uses base64 encoding after JSON serialization for URL safety.
 * @param layers - Array of spiral layers.
 * @param focus - Focus configuration.
 * @returns A URL-safe hash string (without the leading #).
 */
export function encodeSpiralHash(layers: SpiralLayer[], focus: FocusConfig): string {
  const state: SpiralHashState = {
    layers: layers.map(serializeLayer),
    focus
  }
  const json = JSON.stringify(state)
  // Use base64url encoding for URL safety
  const encoded = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `${HASH_KEY}=${encoded}`
}

/**
 * Decodes a URL hash string back into spiral state.
 * @param hash - The hash string (with or without leading #).
 * @returns The decoded state, or null if the hash is invalid or missing.
 */
export function decodeSpiralHash(hash: string): SpiralHashState | null {
  try {
    // Remove leading # if present
    const clean = hash.replace(/^#/, '')
    const prefix = `${HASH_KEY}=`
    if (!clean.startsWith(prefix)) {
      return null
    }
    const encoded = clean.slice(prefix.length)
    // Restore base64 padding
    const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as SpiralHashState
  } catch {
    return null
  }
}

/**
 * Reads the current URL hash and decodes it into spiral state.
 * @returns The decoded state, or null if no valid hash is present.
 */
export function readSpiralHashFromUrl(): SpiralHashState | null {
  if (import.meta.server) {
    return null
  }
  const hash = window.location.hash
  if (!hash) return null
  return decodeSpiralHash(hash)
}

/**
 * Updates the URL hash with the current spiral state without triggering a page reload.
 * @param layers - Array of spiral layers.
 * @param focus - Focus configuration.
 */
export function writeSpiralHashToUrl(layers: SpiralLayer[], focus: FocusConfig): void {
  if (import.meta.server) return
  const hash = encodeSpiralHash(layers, focus)
  window.location.hash = hash
}

/**
 * Restores a SpiralLayer from a HashLayer, adding runtime-only defaults.
 * @param hashLayer - The serialized layer from the hash.
 * @param id - A unique ID for the restored layer.
 * @returns A full SpiralLayer ready for use.
 */
export function restoreLayer(hashLayer: HashLayer, id: number): SpiralLayer {
  return {
    id,
    template: hashLayer.template,
    color: hashLayer.color,
    size: hashLayer.size,
    speed: hashLayer.speed,
    direction: hashLayer.direction as 'forward' | 'backward',
    angle: 0,
    cumulativeAngle: 0,
    intensity: hashLayer.intensity
  }
}
