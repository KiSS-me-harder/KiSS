/**
 * Helper functions for the schedule store.
 * Extracted to keep the store within line limits.
 */
import { storageGetItem, storageSetItem } from '~/utils/storage'

/**
 * Routine assignment type.
 */
export interface RoutineAssignment {
  activitySlug: string
  slot: string
}

/**
 * Schedule entry type.
 */
export interface ScheduleEntry {
  id: number
  classSlug: string
  day: number
  section: string
}

/**
 * Creates routine assignment management functions.
 * @param routineAssignments - Routine assignments ref.
 * @returns Object with routine management functions.
 */
export function createRoutineFunctions(routineAssignments: Ref<RoutineAssignment[]>) {
  function addRoutineAssignment(activitySlug: string, slot: string) {
    routineAssignments.value = routineAssignments.value.filter(
      a => !(a.activitySlug === activitySlug && a.slot !== slot)
    )
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

  return { addRoutineAssignment, removeRoutineAssignment, getSlotAssignments, isActivityInAnySlot }
}

/**
 * Creates schedule entry management functions.
 * @param scheduleEntries - Schedule entries ref.
 * @returns Object with schedule management functions.
 */
export function createScheduleFunctions(scheduleEntries: Ref<ScheduleEntry[]>) {
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

  return { addScheduleEntry, removeScheduleEntry, getEntriesForDaySection }
}

/**
 * Creates daily completion management functions.
 * @param dailyCompleted - Daily completed tasks ref.
 * @returns Object with daily completion functions.
 */
export function createDailyCompletionFunctions(dailyCompleted: Ref<Record<string, Set<string>>>) {
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

  return { getDailyCompleted, toggleDailyCompleted, isDailyCompleted }
}

/**
 * Creates persistence functions for the schedule store.
 * @param routineAssignments - Routine assignments ref.
 * @param scheduleEntries - Schedule entries ref.
 * @param dailyCompleted - Daily completed tasks ref.
 * @returns Object with persistence functions.
 */
export function createPersistenceFunctions(
  routineAssignments: Ref<RoutineAssignment[]>,
  scheduleEntries: Ref<ScheduleEntry[]>,
  dailyCompleted: Ref<Record<string, Set<string>>>
) {
  function saveToStorage() {
    if (import.meta.client) {
      try {
        storageSetItem('kiss-routine-assignments', JSON.stringify(routineAssignments.value))
        storageSetItem('kiss-class-schedule', JSON.stringify(scheduleEntries.value))
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

  return { saveToStorage, loadFromStorage, loadDailyCompleted }
}
