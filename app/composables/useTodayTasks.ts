import { useEnrollmentStore } from '~/stores/enrollment'
import { useScheduleStore } from '~/stores/schedule'
import { useStudyPlanStore } from '~/stores/studyPlan'
import type { ActivityItem } from '~/utils/todayTasksHelpers'
import {
  buildClubActivitiesMap, filterSubscribedActivities, groupActivitiesByCategory,
  buildEnrolledTaskGroups, buildPlannedCourses, buildSingleShotTasks
} from '~/utils/todayTasksHelpers'

/**
 * Task item for enrolled course exams/homework.
 */
export interface CourseTaskItem {
  id: string
  title: string
  completed: boolean
  completedKey: string
}

/**
 * Metric data for a lesson.
 */
export interface LessonMetric {
  id: string
  label: string
  unit: string
  target: number
  currentValue: number
}

/**
 * Group of tasks for an enrolled course.
 */
export interface CourseTaskGroup {
  slug: string
  name: string
  degree: string
  degreeLabel: string
  image: string
  currentLevel: number
  examTasks: CourseTaskItem[]
  metrics: LessonMetric[]
}

/**
 * One-time task that auto-dismisses when resolved.
 */
export interface SingleShotTask {
  id: string
  title: string
  description: string
  icon: string
  to: string
  linkText: string
}

/**
 * Composable that provides today's tasks: enrolled class tasks,
 * single-shot action items, club activities, and planned classes.
 */
export async function useTodayTasks() {
  const store = useEnrollmentStore()
  const scheduleStore = useScheduleStore()
  const planStore = useStudyPlanStore()
  const { app } = useRuntimeConfig()

  const todayKey = computed(() => {
    const d = new Date()
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  })

  onMounted(() => {
    scheduleStore.loadDailyCompleted(todayKey.value)
  })

  const { data: allCourses } = await useAsyncData('today-tasks-courses', () => queryCollection('courses').all())
  const { data: allClubs } = await useAsyncData('today-tasks-clubs', () => queryCollection('clubs').all())
  const { data: allActivities } = await useAsyncData('today-tasks-activities', () => queryCollection('activities').all())

  const clubActivitiesMap = computed(() => buildClubActivitiesMap(allClubs.value || []))
  // Explicitly depend on store clubMemberships ref so the computed re-evaluates
  // when loadFromStorage() populates them after hydration.
  const subscribedActivitySlugs = computed(() => {
    const _ = store.clubMemberships
    return store.getClubActivitySlugs(clubActivitiesMap.value)
  })
  const subscribedActivities = computed<ActivityItem[]>(() => filterSubscribedActivities((allActivities.value || []) as ActivityItem[], subscribedActivitySlugs.value))

  function getActivitySlug(activity: ActivityItem): string {
    const stem = activity?.stem || ''
    const parts = stem.split('/')
    return parts.length >= 2 ? (parts[1] ?? stem) : stem
  }

  const subscribedActivityGroups = computed(() => groupActivitiesByCategory(subscribedActivities.value))

  function toggleTaskCompleted(taskId: string) {
    scheduleStore.toggleDailyCompleted(todayKey.value, taskId)
  }

  const enrolledTaskGroups = computed(() =>
    buildEnrolledTaskGroups(store.enrollments || [], allCourses.value || [], app.baseURL, todayKey.value, scheduleStore)
  )

  const routineAssignments = computed(() => scheduleStore.routineAssignments)
  const tasksForceUpdate = ref(0)

  if (import.meta.client) {
    watch([store.clubMemberships, store.enrollments], () => {
      tasksForceUpdate.value++
    }, { deep: true })

    const nuxtApp = useNuxtApp()
    if (!nuxtApp.isHydrated) {
      watch(() => nuxtApp.isHydrated, (hydrated) => {
        if (hydrated) tasksForceUpdate.value++
      }, { once: true })
    }
  }

  const plannedCourses = computed(() =>
    buildPlannedCourses(Array.from(planStore.studyPlan), store.enrollments || [], app.baseURL)
  )

  const singleShotTasks = computed(() => {
    const _ = tasksForceUpdate.value
    return buildSingleShotTasks(store, routineAssignments.value, subscribedActivities.value, plannedCourses.value)
  })

  const hasTasks = computed(() =>
    singleShotTasks.value.length > 0
    || enrolledTaskGroups.value.length > 0
    || subscribedActivities.value.length > 0
    || plannedCourses.value.length > 0
  )

  return {
    enrolledTaskGroups,
    singleShotTasks,
    subscribedActivities,
    subscribedActivityGroups,
    plannedCourses,
    hasTasks,
    getActivitySlug,
    toggleTaskCompleted
  }
}
