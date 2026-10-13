/**
 * Helper functions for today's tasks composable.
 * Extracted from useTodayTasks to keep the composable within line limits.
 */
import type { CourseTaskItem, LessonMetric, CourseTaskGroup, SingleShotTask } from '~/composables/useTodayTasks'
import type { useEnrollmentStore } from '~/stores/enrollment'
import type { useScheduleStore } from '~/stores/schedule'

/**
 * Builds a map of club slugs to their activity slugs.
 * @param clubs - Array of club content entries.
 * @returns Map from club slug to activity slug array.
 */
export function buildClubActivitiesMap(clubs: unknown[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  if (!clubs) return map
  for (const club of clubs) {
    const meta = (club as { meta?: Record<string, unknown> }).meta
    const clubActs = meta?.clubActivities
    if (Array.isArray(clubActs) && clubActs.length > 0) {
      const clubSlug = (club as { stem?: string }).stem?.replace('clubs/', '')
      if (clubSlug) {
        map[clubSlug] = clubActs as string[]
      }
    }
  }
  return map
}

/**
 * Filters activities to only those the user is subscribed to.
 * @param activities - Array of all activity content entries.
 * @param subscribedSlugs - Array of subscribed activity slugs.
 * @returns Filtered activity array.
 */
export function filterSubscribedActivities(activities: ActivityItem[], subscribedSlugs: string[]): ActivityItem[] {
  if (!activities || subscribedSlugs.length === 0) return []
  const slugs = new Set(subscribedSlugs)
  return activities.filter((a) => {
    const stem = a.stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) return false
    return slugs.has(parts[1] ?? '')
  })
}

/**
 * Activity item type for club activities.
 */
export interface ActivityItem {
  stem: string
  title: string
  meta?: Record<string, unknown>
}

/**
 * Groups activities by category.
 * @param activities - Array of activity content entries.
 * @returns Record of category to activity array.
 */
export function groupActivitiesByCategory(activities: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {}
  for (const activity of activities) {
    const meta = activity.meta || {}
    const category = (meta.category as string) || 'General'
    if (!groups[category]) groups[category] = []
    groups[category].push(activity)
  }
  return groups
}

/**
 * Builds enrolled task groups from enrollments and course data.
 * @param enrollments - Array of enrollment objects.
 * @param allCourses - Array of all course content entries.
 * @param baseURL - Base URL for assets.
 * @param todayKey - Today's date key string.
 * @param scheduleStore - The schedule store.
 * @returns Array of course task groups.
 */
export function buildEnrolledTaskGroups(
  enrollments: unknown[],
  allCourses: unknown[],
  baseURL: string,
  todayKey: string,
  scheduleStore: ReturnType<typeof useScheduleStore>
): CourseTaskGroup[] {
  if (!allCourses || !enrollments || enrollments.length === 0) return []

  const groups: CourseTaskGroup[] = []
  for (const enrollment of enrollments) {
    const slug = (enrollment as { slug: string }).slug
    const courseName = (enrollment as { courseName: string }).courseName
    const degree = (enrollment as { degree: string }).degree
    const prefix = `courses/${courseName}/`
    const courseLessons = allCourses.filter(item => (item as { stem?: string }).stem?.startsWith(prefix))
    if (courseLessons.length === 0) continue

    const enrollmentLevels = ((enrollment as { levels: { level: number, completed: boolean }[] }).levels || [])
      .sort((a: { level: number }, b: { level: number }) => a.level - b.level)
    const currentLevel = enrollmentLevels.find((l: { completed: boolean }) => !l.completed)?.level
      ?? enrollmentLevels[enrollmentLevels.length - 1]?.level
    if (currentLevel === undefined) continue

    const currentLesson = courseLessons.find((item) => {
      const parts = (item as { stem?: string }).stem?.split('/') || []
      const level = parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
      return level === currentLevel
    })
    if (!currentLesson) continue

    const examTasksRaw: string[] = []
    const examTasks: CourseTaskItem[] = examTasksRaw.map((task: string, i: number) => ({
      id: `${slug}-${currentLevel}-exam-${i}`,
      title: task,
      completed: scheduleStore.isDailyCompleted(todayKey, `${slug}-${currentLevel}-exam-${i}`),
      completedKey: `${slug}-${currentLevel}-exam-${i}`
    }))

    const lessonMetrics: LessonMetric[] = []

    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    groups.push({
      slug,
      name: courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      degree,
      degreeLabel,
      image: `${baseURL}img/degrees/${degree}.webp`,
      currentLevel,
      examTasks,
      metrics: lessonMetrics
    })
  }

  return groups.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Builds the list of planned courses not yet enrolled.
 * @param planIds - Array of study plan IDs.
 * @param enrollments - Array of enrollment objects.
 * @param baseURL - Base URL for assets.
 * @returns Array of planned course objects.
 */
export function buildPlannedCourses(
  planIds: string[],
  enrollments: unknown[],
  baseURL: string
): Array<{ slug: string, name: string, degree: string, degreeLabel: string, image: string, to: string }> {
  const enrolledSlugs = new Set((enrollments || []).map((e: unknown) => ((e as { slug: string }).slug)))
  const planned = planIds.filter(id => !enrolledSlugs.has(id) && id !== 'student')

  return planned.map((id) => {
    const parts = id.split('/')
    const degree = parts[0] || ''
    const courseName = parts[1] || parts[0] || ''
    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const name = courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
      slug: id,
      name,
      degree,
      degreeLabel,
      image: `${baseURL}img/degrees/${degree}.webp`,
      to: `/courses/${courseName}`
    }
  })
}

/**
 * Builds single-shot tasks based on current enrollment and club state.
 * @param store - The enrollment store.
 * @param routineAssignments - Array of routine assignment objects.
 * @param subscribedActivities - Array of subscribed activity entries.
 * @param plannedCourses - Array of planned course objects.
 * @returns Array of single-shot tasks.
 */
export function buildSingleShotTasks(
  store: ReturnType<typeof useEnrollmentStore>,
  routineAssignments: { activitySlug: string }[],
  subscribedActivities: unknown[],
  plannedCourses: Array<{ slug: string, name: string, degree: string, degreeLabel: string, image: string, to: string }>
): SingleShotTask[] {
  const tasks: SingleShotTask[] = []
  if (!import.meta.client) return tasks

  const clubCount = store.clubMemberships.length ?? 0
  const enrollmentCount = store.enrollments.length ?? 0

  if (clubCount === 0) {
    tasks.push({
      id: 'join-club',
      title: 'Join a Club',
      description: 'Join a club to get recommended activities for your daily routine.',
      icon: 'i-lucide-users',
      to: '/clubs',
      linkText: 'Browse clubs →'
    })
  }

  if (enrollmentCount === 0) {
    tasks.push({
      id: 'join-degree',
      title: 'Join a Degree',
      description: 'Enroll in a degree program to start your first class.',
      icon: 'i-lucide-graduation-cap',
      to: '/degrees',
      linkText: 'Browse degrees →'
    })
  }

  const routineActivitySlugs = new Set(routineAssignments.map(a => a.activitySlug))
  const unsubscribedActivities = subscribedActivities.filter((a) => {
    const stem = (a as { stem?: string }).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) return false
    return !routineActivitySlugs.has(parts[1] ?? '')
  })

  if (unsubscribedActivities.length > 0) {
    const categories = new Set<string>()
    for (const a of unsubscribedActivities) {
      const meta = (a as { meta?: Record<string, unknown> }).meta || {}
      categories.add((meta.category as string) || 'General')
    }
    const categoryList = [...categories].join(', ')
    tasks.push({
      id: 'add-club-activities-to-routine',
      title: `Add ${unsubscribedActivities.length} Club Activit${unsubscribedActivities.length === 1 ? 'y' : 'ies'} to Routine`,
      description: `You have club activities from ${categoryList} not scheduled in your routine.`,
      icon: 'i-lucide-list-checks',
      to: '#routine',
      linkText: 'Add to routine →'
    })
  }

  if (plannedCourses.length > 0) {
    tasks.push({
      id: 'enroll-planned-courses',
      title: `Enroll in ${plannedCourses.length} Planned Course${plannedCourses.length === 1 ? '' : 'es'}`,
      description: 'You have courses in your study plan that you haven\'t enrolled in yet.',
      icon: 'i-lucide-book-open',
      to: '/study-plan',
      linkText: 'Open study plan →'
    })
  }

  return tasks
}
