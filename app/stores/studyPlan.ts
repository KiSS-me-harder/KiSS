import { storageGetItem, storageSetItem } from '~/utils/storage'

/**
 * Pinia store for managing study plan filters: selected degrees, target titles, and planned classes.
 * Persists to localStorage with hydration guards.
 */
export const useStudyPlanStore = defineStore('studyPlan', () => {
  // ── State ──

  const studyPlan = ref<Set<string>>(new Set())
  const selectedDegrees = ref<Set<string>>(new Set())
  const degreeTargetTitle = ref<Record<string, string>>({})

  // ── Persistence via localStorage ──

  /** Saves study plan state to localStorage. */
  function saveToStorage() {
    if (import.meta.client) {
      try {
        storageSetItem('kiss-study-plan', JSON.stringify([...studyPlan.value]))
        storageSetItem('kiss-study-plan-degrees', JSON.stringify([...selectedDegrees.value]))
        storageSetItem('kiss-study-plan-titles', JSON.stringify(degreeTargetTitle.value))
      } catch {
        // Storage might be unavailable
      }
    }
  }

  /** Loads study plan state from localStorage. */
  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = storageGetItem('kiss-study-plan')
      if (raw) studyPlan.value = new Set(JSON.parse(raw) as string[])

      const rawDeg = storageGetItem('kiss-study-plan-degrees')
      if (rawDeg) selectedDegrees.value = new Set(JSON.parse(rawDeg) as string[])

      const rawTitle = storageGetItem('kiss-study-plan-titles')
      if (rawTitle) degreeTargetTitle.value = JSON.parse(rawTitle) as Record<string, string>
    } catch {
      // Corrupted data, start fresh
    }
  }

  // Load from localStorage after Nuxt hydration
  // Use onMounted as a reliable way to run after hydration in all contexts
  if (import.meta.client) {
    onMounted(() => {
      loadFromStorage()
    })
  }

  // Auto-save on changes
  watch([studyPlan, selectedDegrees, degreeTargetTitle], () => {
    saveToStorage()
  }, { deep: true })

  // ── Actions ──

  /** Adds a class ID to the study plan. */
  function addToStudyPlan(id: string) {
    studyPlan.value.add(id)
  }

  /** Removes a class ID from the study plan. */
  function removeFromStudyPlan(id: string) {
    studyPlan.value.delete(id)
  }

  /** Checks whether a class ID is in the study plan. */
  function isInStudyPlan(id: string): boolean {
    return studyPlan.value.has(id)
  }

  /** Toggles a class ID in or out of the study plan. */
  function toggleStudyPlan(id: string) {
    if (studyPlan.value.has(id)) {
      studyPlan.value.delete(id)
    } else {
      studyPlan.value.add(id)
    }
  }

  /** Adds a degree to the selected degrees filter. */
  function selectDegree(slug: string) {
    selectedDegrees.value.add(slug)
  }

  /** Removes a degree from the selected degrees filter. */
  function deselectDegree(slug: string) {
    selectedDegrees.value.delete(slug)
  }

  /** Checks whether a degree is selected in the filter. */
  function isDegreeSelected(slug: string): boolean {
    return selectedDegrees.value.has(slug)
  }

  /** Sets the target title for a given degree. */
  function setTargetTitle(degreeSlug: string, title: string) {
    degreeTargetTitle.value[degreeSlug] = title
  }

  /** Returns the target title for a given degree, if set. */
  function getTargetTitle(degreeSlug: string): string | undefined {
    return degreeTargetTitle.value[degreeSlug]
  }

  return {
    // State
    studyPlan,
    selectedDegrees,
    degreeTargetTitle,
    // Actions
    addToStudyPlan,
    removeFromStudyPlan,
    isInStudyPlan,
    toggleStudyPlan,
    selectDegree,
    deselectDegree,
    isDegreeSelected,
    setTargetTitle,
    getTargetTitle,
    // Persistence
    loadFromStorage,
    saveToStorage
  }
})
