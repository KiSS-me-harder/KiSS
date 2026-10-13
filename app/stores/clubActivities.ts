import { storageGetItem, storageSetItem } from '~/utils/storage'

/**
 * Pinia store for tracking completed club activities per club.
 * Activities are persisted to localStorage keyed by club slug.
 */
export const useClubActivitiesStore = defineStore('clubActivities', () => {
  // ── State ──

  // Per-club completed activities, keyed by club slug
  const completedActivities = ref<Record<string, Set<string>>>({})

  // ── Persistence via localStorage ──

  /** Saves completed activities for a club to localStorage. */
  function saveToStorage(clubSlug: string) {
    if (import.meta.client) {
      try {
        const set = completedActivities.value[clubSlug]
        if (set) {
          storageSetItem(`club-activities-${clubSlug}`, JSON.stringify([...set]))
        }
      } catch {
        // Storage might be unavailable
      }
    }
  }

  /** Loads completed activities for a club from localStorage. */
  function loadFromStorage(clubSlug: string) {
    if (!import.meta.client) return
    try {
      const stored = storageGetItem(`club-activities-${clubSlug}`)
      if (stored) {
        completedActivities.value[clubSlug] = new Set(JSON.parse(stored) as string[])
      }
    } catch {
      // Corrupted data, start fresh
    }
  }

  // No initial load needed — clubs are loaded on demand when visited

  // ── Actions ──

  /** Returns the set of completed activity keys for a club, creating it if it doesn't exist. */
  function getCompleted(clubSlug: string): Set<string> {
    if (!completedActivities.value[clubSlug]) {
      completedActivities.value[clubSlug] = new Set()
    }
    return completedActivities.value[clubSlug]
  }

  /** Toggles an activity's completed status for a club. */
  function toggleActivity(clubSlug: string, activityKey: string) {
    if (!completedActivities.value[clubSlug]) {
      completedActivities.value[clubSlug] = new Set()
    }
    const set = completedActivities.value[clubSlug]
    if (set.has(activityKey)) {
      set.delete(activityKey)
    } else {
      set.add(activityKey)
    }
    saveToStorage(clubSlug)
  }

  /** Checks whether a given activity is marked as completed for a club. */
  function isCompleted(clubSlug: string, activityKey: string): boolean {
    return completedActivities.value[clubSlug]?.has(activityKey) ?? false
  }

  /** Marks an activity as completed for a club. */
  function addCompleted(clubSlug: string, activityKey: string) {
    if (!completedActivities.value[clubSlug]) {
      completedActivities.value[clubSlug] = new Set()
    }
    completedActivities.value[clubSlug].add(activityKey)
    saveToStorage(clubSlug)
  }

  /** Removes an activity from the completed list for a club. */
  function removeCompleted(clubSlug: string, activityKey: string) {
    if (completedActivities.value[clubSlug]) {
      completedActivities.value[clubSlug].delete(activityKey)
      saveToStorage(clubSlug)
    }
  }

  return {
    // State
    completedActivities,
    // Actions
    getCompleted,
    toggleActivity,
    isCompleted,
    addCompleted,
    removeCompleted,
    // Persistence
    loadFromStorage,
    saveToStorage
  }
})
