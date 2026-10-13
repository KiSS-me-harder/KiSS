/**
 * Composable for the courses index page.
 * Provides level groups, eligibility checks, and breadcrumbs.
 * @returns Object with levelGroups, isEligible, and breadcrumbs.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import { buildLevelGroups, isCourseEligible, type CourseLevelEntry } from '~/utils/coursesHelpers'

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

  const breadcrumbs = ref<BreadcrumbItem[]>([
    { label: 'Courses', icon: 'i-lucide-book-open', to: '/courses' }
  ])

  return { levelGroups, isEligible, breadcrumbs }
}
