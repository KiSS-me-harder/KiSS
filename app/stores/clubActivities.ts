export const useClubActivitiesStore = defineStore('clubActivities', () => {
  // ── State ──

  // Per-club completed activities, keyed by club slug
  const completedActivities = ref<Record<string, Set<string>>>({})

  // ── Persistence via localStorage ──

  function saveToStorage(clubSlug: string) {
    if (import.meta.client) {
      try {
        const set = completedActivities.value[clubSlug]
        if (set) {
          localStorage.setItem(`club-activities-${clubSlug}`, JSON.stringify([...set]))
        }
      } catch {
        // Storage might be unavailable
      }
    }
  }

  function loadFromStorage(clubSlug: string) {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(`club-activities-${clubSlug}`)
      if (stored) {
        completedActivities.value[clubSlug] = new Set(JSON.parse(stored) as string[])
      }
    } catch {
      // Corrupted data, start fresh
    }
  }

  // Load from localStorage after Nuxt hydration for all known clubs
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    // No initial load needed — clubs are loaded on demand when visited
  }

  // ── Actions ──

  function getCompleted(clubSlug: string): Set<string> {
    if (!completedActivities.value[clubSlug]) {
      completedActivities.value[clubSlug] = new Set()
    }
    return completedActivities.value[clubSlug]
  }

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

  function isCompleted(clubSlug: string, activityKey: string): boolean {
    return completedActivities.value[clubSlug]?.has(activityKey) ?? false
  }

  function addCompleted(clubSlug: string, activityKey: string) {
    if (!completedActivities.value[clubSlug]) {
      completedActivities.value[clubSlug] = new Set()
    }
    completedActivities.value[clubSlug].add(activityKey)
    saveToStorage(clubSlug)
  }

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
