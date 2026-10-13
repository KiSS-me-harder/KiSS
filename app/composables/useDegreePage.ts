/**
 * Composable for degree detail page logic.
 * Handles enrollment state, class info computation, progress tracking,
 * and title completion checks for a specific degree program.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import {
  buildCourseInfos, enrollInDegreeForPage, unenrollFromDegreeForPage, checkTitleCompleted,
  getTierColor, getTierLabel, buildDegreeStructuredData
} from '~/utils/degreePageHelpers'
import type { DegreeLevel } from '~/utils/degreePageHelpers'

export async function useDegreePage(id: ComputedRef<string>) {
  const store = useEnrollmentStore()
  const { app } = useRuntimeConfig()

  const { data: home } = await useAsyncData(
    () => `degree-${id.value}`,
    () => queryCollection('degrees').path(`/degrees/${id.value}`).first(),
    { watch: [id] }
  )

  const { data: allCourses } = await useAsyncData('all-courses-degree', () => queryCollection('courses').all())

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
    (home.value as { levels?: DegreeLevel[] })?.levels || []
  )

  const selectedLevelIndex = ref(0)
  const selectedLevel = computed<DegreeLevel | null>(() => {
    if (degreeLevels.value.length === 0) return null
    const idx = Math.min(selectedLevelIndex.value, degreeLevels.value.length - 1)
    return degreeLevels.value[idx] ?? null
  })

  const courseInfos = computed(() =>
    buildCourseInfos(selectedLevel.value, allCourses.value || [], id.value, app.baseURL, store)
  )

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

  function handleEnrollInDegree() {
    if (!selectedLevel.value) return
    enrollInDegreeForPage(id.value, selectedLevel.value.name, selectedLevel.value, allCourses.value || [], store)
  }

  function handleUnenrollFromDegree() {
    if (!selectedLevel.value) return
    unenrollFromDegreeForPage(id.value, selectedLevel.value.name, selectedLevel.value, store)
  }

  function isTitleCompleted(titleIndex: number): boolean {
    return checkTitleCompleted(titleIndex, degreeLevels.value, allCourses.value || [], store)
  }

  const levelNameColors = ['text-amber-400', 'text-blue-400', 'text-purple-400']
  const levelBadgeColors = [
    'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bg-purple-500/20 text-purple-400 border-purple-500/30'
  ]

  return {
    home, title, description, body, items,
    degreeLevels, selectedLevelIndex, selectedLevel,
    courseInfos, isDegreeFullyEnrolled, isDegreePartiallyEnrolled,
    overallProgress, handleEnrollInDegree, handleUnenrollFromDegree,
    isTitleCompleted, getTierColor, getTierLabel,
    levelNameColors, levelBadgeColors
  }
}
