import { storageGetItem, storageSetItem } from '~/utils/storage'

export const useScheduleStore = defineStore('schedule', () => {
  // ── State ──

  interface RoutineAssignment {
    activitySlug: string
    slot: string // 'morning' | 'lunch' | 'evening' | 'bedtime'
  }

  interface ScheduleEntry {
    id: number
    classSlug: string
    day: number // 0=Monday ... 6=Sunday
    section: string
  }

  const routineAssignments = ref<RoutineAssignment[]>([])
  const scheduleEntries = ref<ScheduleEntry[]>([])
  // Daily completions are keyed by date string, e.g. "2024-9-15"
  const dailyCompleted = ref<Record<string, Set<string>>>({})

  // ── Persistence via localStorage ──

  function saveToStorage() {
    if (import.meta.client) {
      try {
        storageSetItem('kiss-routine-assignments', JSON.stringify(routineAssignments.value))
        storageSetItem('kiss-class-schedule', JSON.stringify(scheduleEntries.value))

        // Save each daily completion set
        for (const [key, set] of Object.entries(dailyCompleted.value)) {
          storageSetItem(`kiss-daily-${key}`, JSON.stringify([...set]))
        }
      } catch {
        // Storage might be unavailable
      }
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const rawRoutine = storageGetItem('kiss-routine-assignments')
      if (rawRoutine) routineAssignments.value = JSON.parse(rawRoutine) as RoutineAssignment[]

      const rawSchedule = storageGetItem('kiss-class-schedule')
      if (rawSchedule) scheduleEntries.value = JSON.parse(rawSchedule) as ScheduleEntry[]
    } catch {
      // Corrupted data, start fresh
    }
  }

  // Load a specific day's completions from localStorage
  function loadDailyCompleted(dateKey: string) {
    if (!import.meta.client) return
    try {
      const raw = storageGetItem(`kiss-daily-${dateKey}`)
      if (raw) {
        dailyCompleted.value[dateKey] = new Set(JSON.parse(raw) as string[])
      }
    } catch {
      // Corrupted data, start fresh for this day
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
  watch([routineAssignments, scheduleEntries], () => {
    saveToStorage()
  }, { deep: true })

  // ── Routine Assignment Actions ──

  function addRoutineAssignment(activitySlug: string, slot: string) {
    // Remove from any existing slot first
    routineAssignments.value = routineAssignments.value.filter(
      a => !(a.activitySlug === activitySlug && a.slot !== slot)
    )
    // Don't add if already in this slot
    if (!routineAssignments.value.some(a => a.activitySlug === activitySlug && a.slot === slot)) {
      routineAssignments.value.push({ activitySlug, slot })
    }
  }

  function removeRoutineAssignment(activitySlug: string, slot: string) {
    routineAssignments.value = routineAssignments.value.filter(
      a => !(a.activitySlug === activitySlug && a.slot === slot)
    )
  }

  function getSlotAssignments(slotId: string): RoutineAssignment[] {
    return routineAssignments.value.filter(a => a.slot === slotId)
  }

  function isActivityInAnySlot(activitySlug: string): boolean {
    return routineAssignments.value.some(a => a.activitySlug === activitySlug)
  }

  // ── Schedule Entry Actions ──

  function addScheduleEntry(classSlug: string, day: number, section: string) {
    const newId = scheduleEntries.value.length
      ? Math.max(...scheduleEntries.value.map(e => e.id)) + 1
      : 1
    scheduleEntries.value.push({ id: newId, classSlug, day, section })
  }

  function removeScheduleEntry(entryId: number) {
    scheduleEntries.value = scheduleEntries.value.filter(e => e.id !== entryId)
  }

  function getEntriesForDaySection(day: number, section: string): ScheduleEntry[] {
    return scheduleEntries.value.filter(e => e.day === day && e.section === section)
  }

  // ── Daily Completion Actions ──

  function getDailyCompleted(dateKey: string): Set<string> {
    if (!dailyCompleted.value[dateKey]) {
      dailyCompleted.value[dateKey] = new Set()
    }
    return dailyCompleted.value[dateKey]
  }

  function toggleDailyCompleted(dateKey: string, taskId: string) {
    if (!dailyCompleted.value[dateKey]) {
      dailyCompleted.value[dateKey] = new Set()
    }
    const set = dailyCompleted.value[dateKey]
    if (set.has(taskId)) {
      set.delete(taskId)
    } else {
      set.add(taskId)
    }
    // Save this specific day
    if (import.meta.client) {
      try {
        storageSetItem(`kiss-daily-${dateKey}`, JSON.stringify([...set]))
      } catch {
        // Storage might be unavailable
      }
    }
  }

  function isDailyCompleted(dateKey: string, taskId: string): boolean {
    return dailyCompleted.value[dateKey]?.has(taskId) ?? false
  }

  return {
    // State
    routineAssignments,
    scheduleEntries,
    dailyCompleted,
    // Routine actions
    addRoutineAssignment,
    removeRoutineAssignment,
    getSlotAssignments,
    isActivityInAnySlot,
    // Schedule actions
    addScheduleEntry,
    removeScheduleEntry,
    getEntriesForDaySection,
    // Daily completion actions
    loadDailyCompleted,
    getDailyCompleted,
    toggleDailyCompleted,
    isDailyCompleted,
    // Persistence
    loadFromStorage,
    saveToStorage
  }
})
