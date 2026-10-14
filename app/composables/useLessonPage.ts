import { useEnrollmentStore } from '~/stores/enrollment'
import { getFlashcardOptionClass as getFlashcardOptionClassUtil } from '~/utils/lessonFlashcardHelpers'
import { buildSortedLevels, findPreviousLevel, findNextLevel, getLevelBadgeColor, parseLessonData } from '~/utils/lessonLevelHelpers'
import { buildLevelItemMap, checkLevelUnlocked, doEnrollInCourse, createFlashcardAnswerHandler, createFlashcardOptionClassHandler, setupLessonSeoMeta, findCourseDegree } from '~/utils/lessonPageHelpers'
import { createLessonCompleted, setupAutoComplete, createCanProceedToNext, createHomeworkState, createLevelActions } from '~/utils/lessonCompletionHelpers'
import { createExamCheckers, createMetricsCheckers } from '~/utils/lessonExamMetricsHelpers'
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
    const item = currentLevelItem.value as { meta?: { dependencies?: { course: string, level: number }[] } } | null
    if (!item) return []
    return item.meta?.dependencies || []
  })

  // Explicitly depend on store enrollment refs so the computed re-evaluates
  // when loadFromStorage() populates them after hydration.
  const isLevelUnlocked = computed(() => {
    const _ = store.enrollments
    if (!currentLevelDeps.value.length) return true
    return store.areDependenciesMet(slug.value, levelParam.value, currentLevelDeps.value)
  })

  const isEnrolledInCourse = computed(() => {
    const _ = store.enrollments
    return store.isEnrolled(slug.value)
  })

  if (import.meta.client) {
    watch([isLevelUnlocked, isEnrolledInCourse, currentLevelItem], ([unlocked, enrolled, item]) => {
      if (item && (!enrolled || !unlocked)) {
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
  const isEnrolled = computed(() => {
    const _ = store.enrollments
    return store.isEnrolled(classSlug.value)
  })
  const { isLevelCompleted, completeCurrentLevel, resetCurrentLevel } = createLevelActions(classSlug, levelParam, store)

  function handleEnroll() {
    const levels = sortedLevelsData.value.map(l => l.level)
    doEnrollInCourse(slug.value, slug.value, courseDegree.value, levels, store)
  }

  const flashcardAnswered = ref<Record<number, boolean>>({})
  const flashcardsCorrect = computed(() => Object.values(flashcardAnswered.value).filter(v => v).length)

  const answerFlashcard = createFlashcardAnswerHandler(lessonData, flashcardAnswered, store)
  const getFlashcardOptionClassWrapper = createFlashcardOptionClassHandler(lessonData, flashcardAnswered, getFlashcardOptionClassUtil)

  const { homeworkCompleted, toggleHomeworkDone, isHomeworkDone, homeworkCompletedCount } = createHomeworkState()
  const { isExamActivityDone, countExamCompleted } = createExamCheckers(store)
  const { isMilestoneAchieved, countMetricsCompleted } = createMetricsCheckers()

  const getExamCompletedCount = computed(() => lessonData.value?.exam ? countExamCompleted(lessonData.value.exam) : 0)
  const getMetricsCompletedCount = computed(() => lessonData.value?.metrics ? countMetricsCompleted(lessonData.value.metrics) : 0)

  const lessonIsCompleted = createLessonCompleted(
    lessonData, flashcardAnswered, homeworkCompleted,
    isExamActivityDone, isMilestoneAchieved
  )

  setupAutoComplete(lessonIsCompleted, classSlug, levelParam, store)
  const canProceedToNext = createCanProceedToNext(lessonData, lessonIsCompleted)
  setupLessonSeoMeta(lessonData)

  return {
    degree: courseDegree, slug, levelParam, classSlug,
    sortedLevelsData, currentLevelItem, body,
    isLevelUnlockedByLevel, isLevelUnlocked,
    previousLevel, nextLevel, lessonData, levelBadgeColor,
    isEnrolled, isLevelCompleted, completeCurrentLevel,
    resetCurrentLevel, handleEnroll,
    flashcardAnswered, flashcardsCorrect, answerFlashcard, getFlashcardOptionClass: getFlashcardOptionClassWrapper,
    homeworkCompleted, toggleHomeworkDone, isHomeworkDone, homeworkCompletedCount,
    isExamActivityDone, getExamCompletedCount,
    isMilestoneAchieved, getMetricsCompletedCount,
    lessonIsCompleted, canProceedToNext
  }
}
