import { storageGetItem, storageSetItem } from '~/utils/storage'

/**
 * Pinia store for Shorts page settings and viewed video tracking.
 * Persists viewed video paths, loop mode, and degree filter preferences
 * to localStorage so the feed can prioritize unviewed content across sessions.
 */
export const useShortsStore = defineStore('shorts', () => {
  // ── State ──

  const viewed = ref<string[]>([])
  /** When true, the current video repeats instead of advancing to the next one. */
  const loopMode = ref(false)
  /** Set of degree slugs enabled for the Shorts feed. Empty means all enrolled degrees are included. */
  const enabledDegrees = ref<string[]>([])

  // ── Persistence via localStorage ──

  const STORAGE_KEY_VIEWED = 'shorts-viewed'
  const STORAGE_KEY_SETTINGS = 'shorts-settings'

  /** Saves all store state to localStorage. */
  function saveToStorage() {
    if (import.meta.client) {
      try {
        storageSetItem(STORAGE_KEY_VIEWED, JSON.stringify(viewed.value))
        storageSetItem(STORAGE_KEY_SETTINGS, JSON.stringify({
          loopMode: loopMode.value,
          enabledDegrees: enabledDegrees.value
        }))
      } catch {
        // Storage might be unavailable
      }
    }
  }

  /** Loads all store state from localStorage. */
  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const viewedStored = storageGetItem(STORAGE_KEY_VIEWED)
      if (viewedStored) {
        viewed.value = JSON.parse(viewedStored) as string[]
      }
      const settingsStored = storageGetItem(STORAGE_KEY_SETTINGS)
      if (settingsStored) {
        const settings = JSON.parse(settingsStored) as {
          loopMode?: boolean
          enabledDegrees?: string[]
        }
        if (typeof settings.loopMode === 'boolean') {
          loopMode.value = settings.loopMode
        }
        if (Array.isArray(settings.enabledDegrees)) {
          enabledDegrees.value = settings.enabledDegrees
        }
      }
    } catch {
      // Corrupted data, start fresh
    }
  }

  // Load from localStorage after hydration
  if (import.meta.client) {
    onMounted(() => {
      loadFromStorage()
    })
  }

  watch([viewed, loopMode, enabledDegrees], () => {
    saveToStorage()
  }, { deep: true })

  // ── Actions ──

  /**
   * Marks a video as viewed by adding its path to the tracked list.
   * @param path - The video path identifier to mark as viewed.
   */
  function markViewed(path: string) {
    if (!viewed.value.includes(path)) {
      viewed.value.push(path)
    }
  }

  /**
   * Checks whether a video has been viewed.
   * @param path - The video path identifier to check.
   * @returns True if the video has been viewed, false otherwise.
   */
  function isViewed(path: string): boolean {
    return viewed.value.includes(path)
  }

  /**
   * Toggles the loop mode on/off.
   */
  function toggleLoopMode() {
    loopMode.value = !loopMode.value
  }

  /**
   * Toggles whether a degree is enabled for the Shorts feed.
   * @param degreeSlug - The degree slug to toggle.
   */
  function toggleEnabledDegree(degreeSlug: string) {
    const index = enabledDegrees.value.indexOf(degreeSlug)
    if (index === -1) {
      enabledDegrees.value.push(degreeSlug)
    } else {
      enabledDegrees.value.splice(index, 1)
    }
  }

  /**
   * Checks if a degree is enabled for the Shorts feed.
   * If no degrees are explicitly enabled, all degrees are considered enabled.
   * @param degreeSlug - The degree slug to check.
   * @returns True if the degree is included in the feed.
   */
  function isDegreeEnabled(degreeSlug: string): boolean {
    if (enabledDegrees.value.length === 0) {
      return true
    }
    return enabledDegrees.value.includes(degreeSlug)
  }

  return {
    // State
    viewed,
    loopMode,
    enabledDegrees,
    // Actions
    markViewed,
    isViewed,
    toggleLoopMode,
    toggleEnabledDegree,
    isDegreeEnabled,
    // Persistence
    loadFromStorage,
    saveToStorage
  }
})
