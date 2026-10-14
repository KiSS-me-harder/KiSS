/**
 * Composable for degree detail page logic.
 * Handles enrollment state, class info computation, progress tracking,
 * and title completion checks for a specific degree program.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import {
  buildCumulativeCourseInfos, enrollInDegreeForPage,
  checkAndEnrollAvailableCourses, unenrollRemovedCourses
} from '~/utils/degreePageHelpers'
import type { DegreeLevel } from '~/utils/degreePageHelpers'
import { getTierColor, getTierLabel, buildDegreeStructuredData } from '~/utils/degreeMetadata'
import { useDegreeActions } from '~/composables/useDegreeActions'

export function useDegreePage(id: ComputedRef<string>) {
  const store = useEnrollmentStore()
  const { app } = useRuntimeConfig()

  const { data: home } = useAsyncData(
    () => `degree-${id.value}`,
    () => queryCollection('degrees').path(`/degrees/${id.value}`).first(),
    { watch: [id] }
  )

  const { data: allCourses } = useAsyncData('all-courses-degree', () => queryCollection('courses').all())

  const title = computed(() => home.value?.title)
  const description = computed(() => home.value?.description)
  const body = computed(() => home.value?.body)

  const items = computed<BreadcrumbItem[]>(() => [
    { label: 'Degrees', icon: 'i-lucide-graduation-cap', to: '/degrees' },
    { label: title.value, to: `/degrees/${id.value}` }
  ])

  useSeoMeta({ title, description })
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: computed(() => buildDegreeStructuredData(id.value, title.value, description.value))
    }]
  })

  const degreeLevels = computed<DegreeLevel[]>(() =>
    (home.value as { meta?: { levels?: DegreeLevel[] } })?.meta?.levels || []
  )

  // Restore selectedLevelIndex from the stored degree enrollment, if any
  // Explicitly depend on store degreeEnrollments ref so the computed re-evaluates
  // when loadFromStorage() populates them after hydration.
  const storedEnrollment = computed(() => {
    const _ = store.degreeEnrollments
    return store.getDegreeEnrollment(id.value)
  })
  const enrolledTitleName = computed(() => storedEnrollment.value?.title)
  const selectedLevelIndex = ref(0)

  // Update selectedLevelIndex once degree data loads and we can match the stored title
  watch([degreeLevels, storedEnrollment], ([levels, enrollment]) => {
    if (enrollment?.title && levels.length > 0) {
      const idx = levels.findIndex(l => l.name === enrollment.title)
      if (idx >= 0) {
        selectedLevelIndex.value = idx
      }
    }
  }, { immediate: true })
  const selectedLevel = computed<DegreeLevel | null>(() => {
    if (degreeLevels.value.length === 0) return null
    const idx = Math.min(selectedLevelIndex.value, degreeLevels.value.length - 1)
    return degreeLevels.value[idx] ?? null
  })

  // Explicitly depend on store enrollment refs so the computed re-evaluates when
  // loadFromStorage() populates them after hydration.
  const courseInfos = computed(() => {
    const _ = [store.enrollments, store.degreeEnrollments]
    return buildCumulativeCourseInfos(degreeLevels.value, selectedLevelIndex.value, allCourses.value || [], id.value, app.baseURL, store)
  })

  const isDegreeFullyEnrolled = computed(() =>
    courseInfos.value.length > 0 && courseInfos.value.every(c => c.isEnrolled)
  )
  const isDegreePartiallyEnrolled = computed(() => courseInfos.value.some(c => c.isEnrolled))

  const overallProgress = computed(() => {
    if (courseInfos.value.length === 0) return 0
    const total = courseInfos.value.reduce((sum, c) => sum + c.totalLevels, 0)
    const completed = courseInfos.value.reduce((sum, c) => sum + c.completedLevels, 0)
    return total === 0 ? 0 : Math.round((completed / total) * 100)
  })

  /**
   * Handles enrolling in a degree or switching to a different title.
   */
  function handleEnrollInDegree() {
    if (!selectedLevel.value) return
    const currentEnrollment = store.getDegreeEnrollment(id.value)
    if (currentEnrollment) {
      const oldTitleIndex = degreeLevels.value.findIndex(l => l.name === currentEnrollment.title)
      if (oldTitleIndex >= 0 && oldTitleIndex !== selectedLevelIndex.value) {
        unenrollRemovedCourses(degreeLevels.value, oldTitleIndex, selectedLevelIndex.value, store)
      }
    }
    enrollInDegreeForPage(id.value, selectedLevel.value.name, selectedLevel.value, allCourses.value || [], store)
  }

  /**
   * Handles "Complete Enrollment" — re-checks and enrolls in newly available courses.
   */
  function handleCompleteEnrollment() {
    if (!selectedLevel.value) return
    checkAndEnrollAvailableCourses(id.value, selectedLevel.value, allCourses.value || [], store)
  }

  const { handleUnenrollFromDegree, isTitleCompleted } = useDegreeActions(
    id, degreeLevels, selectedLevelIndex, selectedLevel, allCourses
  )

  const levelNameColors = ['text-amber-400', 'text-blue-400', 'text-purple-400']
  const levelBadgeColors = [
    'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bg-purple-500/20 text-purple-400 border-purple-500/30'
  ]

  return {
    home, title, description, body, items,
    degreeLevels, selectedLevelIndex, selectedLevel, enrolledTitleName,
    courseInfos, isDegreeFullyEnrolled, isDegreePartiallyEnrolled,
    overallProgress, handleEnrollInDegree, handleCompleteEnrollment, handleUnenrollFromDegree,
    isTitleCompleted, getTierColor, getTierLabel,
    levelNameColors, levelBadgeColors
  }
}
