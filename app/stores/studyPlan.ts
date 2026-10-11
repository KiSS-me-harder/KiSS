import { storageGetItem, storageSetItem } from '~/utils/storage'

export const useStudyPlanStore = defineStore('studyPlan', () => {
  // ── State ──

  const studyPlan = ref<Set<string>>(new Set())
  const selectedDegrees = ref<Set<string>>(new Set())
  const degreeTargetTitle = ref<Record<string, string>>({})

  // ── Persistence via localStorage ──

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
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.isHydrated) {
      loadFromStorage()
    } else {
      watch(() => nuxtApp.isHydrated, (hydrated) => {
        if (hydrated) {
          loadFromStorage()
        }
      }, { once: true })
    }
  }

  // Auto-save on changes
  watch([studyPlan, selectedDegrees, degreeTargetTitle], () => {
    saveToStorage()
  }, { deep: true })

  // ── Actions ──

  function addToStudyPlan(id: string) {
    studyPlan.value.add(id)
  }

  function removeFromStudyPlan(id: string) {
    studyPlan.value.delete(id)
  }

  function isInStudyPlan(id: string): boolean {
    return studyPlan.value.has(id)
  }

  function toggleStudyPlan(id: string) {
    if (studyPlan.value.has(id)) {
      studyPlan.value.delete(id)
    } else {
      studyPlan.value.add(id)
    }
  }

  function selectDegree(slug: string) {
    selectedDegrees.value.add(slug)
  }

  function deselectDegree(slug: string) {
    selectedDegrees.value.delete(slug)
  }

  function isDegreeSelected(slug: string): boolean {
    return selectedDegrees.value.has(slug)
  }

  function setTargetTitle(degreeSlug: string, title: string) {
    degreeTargetTitle.value[degreeSlug] = title
  }

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
