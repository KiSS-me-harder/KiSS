import { useEnrollmentStore } from '~/stores/enrollment'
import { getExamTaskType, getExamTaskText, getExamTaskMetric, isMilestoneAchieved, getMilestoneCurrentValue } from '~/utils/lessonExamHelpers'
import { getFlashcardOptionClass as getFlashcardOptionClassUtil } from '~/utils/lessonFlashcardHelpers'
import { buildSortedLevels, findPreviousLevel, findNextLevel, getLevelBadgeColor, parseLessonData } from '~/utils/lessonLevelHelpers'
import { buildLevelItemMap, checkLevelUnlocked, doEnrollInCourse, doCompleteLevel, doResetLevel, countExamCompleted, createFlashcardAnswerHandler, createFlashcardOptionClassHandler, setupLessonSeoMeta, findCourseDegree } from '~/utils/lessonPageHelpers'
import type { ExamTask } from '~/utils/lessonExamHelpers'
import type { CourseItem } from '~/utils/lessonPageHelpers'

/**
 * Composable that provides lesson page data and actions.
 * Handles level navigation, flashcards, exam tasks, and enrollment state.
 */
export async function useLessonPage() {
  const route = useRoute()
  const { app } = useRuntimeConfig()
  const store = useEnrollmentStore()

  const slug = computed(() => route.params.slug as string)
  const levelParam = computed(() => parseInt(route.params.level as string, 10))

  const { data: classLevels } = await useAsyncData(
    () => `lesson-${slug.value}-${levelParam.value}`,
    () => queryCollection('courses')
      .where('stem', 'LIKE', `courses/${slug.value}%`)
      .all(),
    { watch: [slug, levelParam] }
  )

  const { data: allDegrees } = useAsyncData(
    'lesson-degrees',
    () => queryCollection('degrees').all()
  )

  const courseDegree = computed(() => findCourseDegree(allDegrees.value, slug.value))

  const classSlug = computed(() => slug.value)

  const sortedLevelsData = computed(() => buildSortedLevels(classLevels.value || []))

  const currentLevelItem = computed(() => {
    const found = sortedLevelsData.value.find(l => l.level === levelParam.value)
    return found?.item || null
  })

  const levelItemMap = computed(() => buildLevelItemMap(sortedLevelsData.value as { level: number, item: CourseItem }[]))

  function isLevelUnlockedByLevel(levelNum: number): boolean {
    return checkLevelUnlocked(classSlug.value, levelNum, levelItemMap.value, store)
  }

  const currentLevelDeps = computed(() => {
    const item = currentLevelItem.value as { dependencies?: { course: string, level: number }[] } | null
    if (!item) return []
    return item.dependencies || []
  })

  const isLevelUnlocked = computed(() => {
    if (!currentLevelDeps.value.length) return true
    return store.areDependenciesMet(slug.value, levelParam.value, currentLevelDeps.value)
  })

  if (import.meta.client) {
    watch([isLevelUnlocked, currentLevelItem], ([unlocked, item]) => {
      if (item && !unlocked) {
        navigateTo(`/courses/${slug.value}`, { replace: true })
      }
    }, { immediate: true })
  }

  const previousLevel = computed(() => findPreviousLevel(sortedLevelsData.value, levelParam.value, courseDegree.value, slug.value))
  const nextLevel = computed(() => findNextLevel(sortedLevelsData.value, levelParam.value, courseDegree.value, slug.value))

  const body = computed(() => (currentLevelItem.value as { body?: unknown } | null)?.body)

  const lessonData = computed(() => {
    const item = currentLevelItem.value
    if (!item) return null
    const data = parseLessonData(item, courseDegree.value, slug.value, app.baseURL)
    return { ...data, previousLevel: previousLevel.value, nextLevel: nextLevel.value }
  })

  const levelBadgeColor = computed(() => getLevelBadgeColor(levelParam.value))
  const isEnrolled = computed(() => store.isEnrolled(classSlug.value))

  function isLevelCompleted(level?: number) {
    return store.isLevelCompleted(classSlug.value, level ?? levelParam.value)
  }

  function completeCurrentLevel() {
    doCompleteLevel(classSlug.value, levelParam.value, store)
  }

  function resetCurrentLevel() {
    doResetLevel(classSlug.value, levelParam.value, store)
  }

  function handleEnroll() {
    const levels = sortedLevelsData.value.map(l => l.level)
    doEnrollInCourse(slug.value, slug.value, courseDegree.value, levels, store)
  }

  const flashcardAnswered = ref<Record<number, boolean>>({})
  const flashcardsCorrect = computed(() => Object.values(flashcardAnswered.value).filter(v => v).length)

  const answerFlashcard = createFlashcardAnswerHandler(lessonData, flashcardAnswered, store)
  const getFlashcardOptionClassWrapper = createFlashcardOptionClassHandler(lessonData, flashcardAnswered, getFlashcardOptionClassUtil)

  function isExamTaskDone(taskIndex: number): boolean {
    return store.isExamTaskCompleted(classSlug.value, levelParam.value, taskIndex)
  }

  function toggleExamTaskDone(taskIndex: number) {
    store.toggleExamTask(classSlug.value, levelParam.value, taskIndex)
  }

  const storeWithMetrics = store as typeof store & { getMetricValueField: (metricSlug: string, fieldId: string) => number }

  const getExamCompletedCount = computed(() => {
    return countExamCompleted(lessonData.value?.exam, isExamTaskDone, t => isMilestoneAchieved(t, storeWithMetrics), getExamTaskType)
  })

  setupLessonSeoMeta(lessonData)

  return {
    degree: courseDegree, slug, levelParam, classSlug,
    sortedLevelsData, currentLevelItem, body,
    isLevelUnlockedByLevel, isLevelUnlocked,
    previousLevel, nextLevel, lessonData, levelBadgeColor,
    isEnrolled, isLevelCompleted, completeCurrentLevel,
    resetCurrentLevel, handleEnroll,
    flashcardAnswered, flashcardsCorrect, answerFlashcard, getFlashcardOptionClass: getFlashcardOptionClassWrapper,
    getExamTaskType, getExamTaskText, getExamTaskMetric,
    isExamTaskDone, toggleExamTaskDone, getExamCompletedCount,
    getMilestoneCurrentValue: (t: ExamTask) => getMilestoneCurrentValue(t, storeWithMetrics),
    isMilestoneAchieved: (t: ExamTask) => isMilestoneAchieved(t, storeWithMetrics)
  }
}
