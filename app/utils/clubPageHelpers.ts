/**
 * Helper functions for club page logic.
 * Extracted from useClubPage to keep the composable within line limits.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import type { useEnrollmentStore } from '~/stores/enrollment'
import type { useClubActivitiesStore } from '~/stores/clubActivities'

export interface Activity {
  type: 'challenge' | 'game' | 'task'
  title: string
  description: string
  xp: number
  icon: string
}

/**
 * Activity type styling configuration.
 */
export const activityTypesConfig = {
  challenge: { label: 'Challenge', icon: 'i-lucide-flame', color: 'orange' as const, bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  game: { label: 'Game', icon: 'i-lucide-gamepad-2', color: 'purple' as const, bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  task: { label: 'Task', icon: 'i-lucide-list-checks', color: 'emerald' as const, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }
}

/**
 * Checks if a club has a prerequisite degree enrollment.
 * @param requiredDegree - The required degree slug.
 * @param store - Enrollment store instance.
 * @returns True if the prerequisite is met or not required.
 */
export function checkClubPrerequisite(
  requiredDegree: string | undefined,
  store: ReturnType<typeof useEnrollmentStore>
): boolean {
  if (!requiredDegree) return true
  return store.hasDegreeEnrollment(requiredDegree)
}

/**
 * Toggles club membership.
 * @param slug - Club slug.
 * @param isMember - Whether the user is currently a member.
 * @param requiredDegree - Required degree slug.
 * @param joinFailed - Ref for join failure state.
 * @param store - Enrollment store instance.
 */
export function toggleClubMembership(
  slug: string,
  isMember: boolean,
  requiredDegree: string | undefined,
  joinFailed: { value: boolean },
  store: ReturnType<typeof useEnrollmentStore>
) {
  if (isMember) {
    store.leaveClub(slug)
    joinFailed.value = false
  } else {
    const success = store.joinClub(slug, requiredDegree)
    if (!success) {
      joinFailed.value = true
      setTimeout(() => {
        joinFailed.value = false
      }, 5000)
    }
  }
}

/**
 * Toggles an activity's completion status.
 * @param activity - The activity to toggle.
 * @param clubSlug - Club slug.
 * @param clubActivitiesStore - Club activities store.
 */
export function toggleClubActivity(
  activity: Activity,
  clubSlug: string,
  clubActivitiesStore: ReturnType<typeof useClubActivitiesStore>
) {
  const key = `${activity.type}-${activity.title}`
  clubActivitiesStore.toggleActivity(clubSlug, key)
}

/**
 * Checks if an activity is completed.
 * @param activity - The activity to check.
 * @param clubSlug - Club slug.
 * @param clubActivitiesStore - Club activities store.
 * @returns True if the activity is completed.
 */
export function isClubActivityCompleted(
  activity: Activity,
  clubSlug: string,
  clubActivitiesStore: ReturnType<typeof useClubActivitiesStore>
): boolean {
  return clubActivitiesStore.isCompleted(clubSlug, `${activity.type}-${activity.title}`)
}

/**
 * Builds breadcrumb items for a club page.
 * @param title - Club title.
 * @param slug - Club slug.
 * @returns Array of breadcrumb items.
 */
export function buildClubBreadcrumbs(title: string | undefined, slug: string): BreadcrumbItem[] {
  return [
    { label: 'Clubs', icon: 'i-lucide-users', to: '/clubs' },
    { label: title, to: `/clubs/${slug}` }
  ]
}

/**
 * Builds structured data JSON-LD for a club page.
 * @param title - Club title.
 * @param description - Club description.
 * @param slug - Club slug.
 * @returns JSON string of structured data.
 */
export function buildClubStructuredData(title: string | undefined, description: string | undefined, slug: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `https://kiss-academy.github.io/KiSS/clubs/${slug}#webpage`, 'url': `https://kiss-academy.github.io/KiSS/clubs/${slug}`, 'name': title, 'description': description, 'inLanguage': 'en', 'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' } },
      { '@type': 'WebSite', '@id': 'https://kiss-academy.github.io/KiSS/#website', 'url': 'https://kiss-academy.github.io/KiSS/', 'name': 'KiSS Academy', 'description': 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.', 'inLanguage': 'en' }
    ]
  })
}

/**
 * Filters activities by type.
 * @param activities - Array of activities.
 * @param filter - Active filter type.
 * @returns Filtered activity array.
 */
export function filterActivitiesByType(
  activities: Activity[],
  filter: 'all' | 'challenge' | 'game' | 'task'
): Activity[] {
  if (filter === 'all') return activities
  return activities.filter(a => a.type === filter)
}

/**
 * Calculates completed activity count.
 * @param activities - Array of activities.
 * @param isCompleted - Function to check if an activity is completed.
 * @returns Number of completed activities.
 */
export function countCompletedActivities(
  activities: Activity[],
  isCompleted: (a: Activity) => boolean
): number {
  return activities.filter(a => isCompleted(a)).length
}

/**
 * Calculates total XP from completed activities.
 * @param activities - Array of activities.
 * @param isCompleted - Function to check if an activity is completed.
 * @returns Total XP from completed activities.
 */
export function calculateTotalXP(
  activities: Activity[],
  isCompleted: (a: Activity) => boolean
): number {
  return activities.filter(a => isCompleted(a)).reduce((sum, a) => sum + a.xp, 0)
}
