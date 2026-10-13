/**
 * Composable for the courses index page.
 * Provides level groups, eligibility checks, and breadcrumbs.
 * @returns Object with levelGroups, isEligible, and breadcrumbs.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import { buildLevelGroups, getAbbreviatedLabel, getFirstUnmetDependency, isCourseEligible, type CourseLevelEntry } from '~/utils/coursesHelpers'

export function useCoursesIndex() {
  const { app } = useRuntimeConfig()
  const store = useEnrollmentStore()

  const { data: allCourses } = useAsyncData('courses-index', () => queryCollection('courses').all())
  const { data: allDegrees } = useAsyncData('courses-index-degrees', () => queryCollection('degrees').all())

  const levelGroups = computed(() =>
    buildLevelGroups(allCourses.value, app.baseURL, allDegrees.value)
  )

  function isEligible(item: CourseLevelEntry) {
    return isCourseEligible(item, store)
  }

  /**
   * Gets the first unmet dependency for a course level entry.
   * @param item - The course level entry.
   * @returns The first unmet dependency or null.
   */
  function getUnmetDependency(item: CourseLevelEntry) {
    return getFirstUnmetDependency(item, store)
  }

  /**
   * Generates an abbreviated label for a dependency.
   * @param dep - The dependency object.
   * @returns Abbreviated label string.
   */
  function getAbbrLabel(dep: { course: string, level: number }) {
    return getAbbreviatedLabel(dep)
  }

  const breadcrumbs = ref<BreadcrumbItem[]>([
    { label: 'Courses', icon: 'i-lucide-book-open', to: '/courses' }
  ])

  return { levelGroups, isEligible, getUnmetDependency, getAbbrLabel, breadcrumbs }
}
