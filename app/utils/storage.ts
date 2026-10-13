/**
 * Safe localStorage access helpers.
 * Used by Pinia stores for persistence.
 */

// eslint-disable-next-line no-restricted-globals
const storage = typeof window !== 'undefined' ? localStorage : null

/**
 * Safely retrieves a value from localStorage by key.
 * Returns null if localStorage is unavailable or an error occurs.
 * @param key - The storage key to retrieve.
 * @returns The stored string value, or null if not found or unavailable.
 */
export function storageGetItem(key: string): string | null {
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely sets a value in localStorage by key.
 * Silently ignores errors if localStorage is unavailable.
 * @param key - The storage key to set.
 * @param value - The string value to store.
 */
export function storageSetItem(key: string, value: string): void {
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // Storage might be unavailable
  }
}
