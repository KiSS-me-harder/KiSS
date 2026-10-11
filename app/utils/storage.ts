/**
 * Safe localStorage access helpers.
 * Used by Pinia stores for persistence.
 */

// eslint-disable-next-line no-restricted-globals
const storage = typeof window !== 'undefined' ? localStorage : null

export function storageGetItem(key: string): string | null {
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function storageSetItem(key: string, value: string): void {
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // Storage might be unavailable
  }
}
