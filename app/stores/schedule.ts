import { createRoutineFunctions, createScheduleFunctions, createDailyCompletionFunctions, createPersistenceFunctions } from '~/utils/scheduleHelpers'

/**
 * Pinia store for managing daily routines, class schedules, and task completions.
 * Persists routine assignments, schedule entries, and daily completion records.
 */
export const useScheduleStore = defineStore('schedule', () => {
  const routineAssignments = ref<{ activitySlug: string, slot: string }[]>([])
  const scheduleEntries = ref<{ id: number, classSlug: string, day: number, section: string }[]>([])
  const dailyCompleted = ref<Record<string, Set<string>>>({})

  const routineFunctions = createRoutineFunctions(routineAssignments)
  const scheduleFunctions = createScheduleFunctions(scheduleEntries)
  const dailyFunctions = createDailyCompletionFunctions(dailyCompleted)
  const persistenceFunctions = createPersistenceFunctions(routineAssignments, scheduleEntries, dailyCompleted)

  // Load from localStorage after Nuxt hydration
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.isHydrated) {
      persistenceFunctions.loadFromStorage()
    } else {
      watch(() => nuxtApp.isHydrated, (hydrated) => {
        if (hydrated) {
          persistenceFunctions.loadFromStorage()
        }
      }, { once: true })
    }
  }

  // Auto-save on changes
  watch([routineAssignments, scheduleEntries], () => {
    persistenceFunctions.saveToStorage()
  }, { deep: true })

  return {
    routineAssignments, scheduleEntries, dailyCompleted,
    ...routineFunctions,
    ...scheduleFunctions,
    ...dailyFunctions,
    ...persistenceFunctions
  }
})
