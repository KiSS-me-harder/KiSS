/**
 * Helper functions for lesson completion logic.
 * Extracted from useLessonPage to keep the composable within line limits.
 */
import { isLessonCompleted as isLessonCompletedUtil } from '~/utils/lessonExamHelpers'
import { doCompleteLevel, doResetLevel } from '~/utils/lessonPageHelpers'
import type { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Creates a computed that checks if the lesson is fully completed.
 * @param lessonData - Lesson data ref.
 * @param flashcardAnswered - Flashcard answered state ref.
 * @param homeworkCompleted - Homework completed state ref.
 * @param isExamActivityDone - Function to check if an exam activity was done recently.
 * @param isMilestoneAchieved - Function to check if a metric milestone is achieved.
 * @returns Computed boolean indicating lesson completion.
 */
export function createLessonCompleted(
  lessonData: { value: { flashcards?: unknown[], homework?: string[], exam?: string[], metrics?: string[] } | null },
  flashcardAnswered: { value: Record<number, boolean> },
  homeworkCompleted: { value: Record<number, boolean> },
  isExamActivityDone: (activitySlug: string) => boolean,
  isMilestoneAchieved: (ref: string) => boolean
) {
  return computed(() => {
    if (!lessonData.value) return false
    return isLessonCompletedUtil(
      lessonData.value.flashcards,
      flashcardAnswered.value,
      lessonData.value.homework,
      homeworkCompleted.value,
      lessonData.value.exam,
      isExamActivityDone,
      lessonData.value.metrics,
      isMilestoneAchieved
    )
  })
}

/**
 * Sets up auto-completion watch for a lesson.
 * @param lessonIsCompleted - Computed indicating lesson completion.
 * @param classSlug - Computed course slug.
 * @param levelParam - Computed level number.
 * @param store - Enrollment store instance.
 */
export function setupAutoComplete(
  lessonIsCompleted: ComputedRef<boolean>,
  classSlug: ComputedRef<string>,
  levelParam: ComputedRef<number>,
  store: ReturnType<typeof useEnrollmentStore>
) {
  watch(lessonIsCompleted, (completed) => {
    if (completed && !store.isLevelCompleted(classSlug.value, levelParam.value)) {
      doCompleteLevel(classSlug.value, levelParam.value, store)
    }
  })
}

/**
 * Creates a computed that checks if the user can proceed to the next lesson.
 * @param lessonData - Lesson data ref.
 * @param lessonIsCompleted - Computed indicating lesson completion.
 * @returns Computed boolean indicating next lesson eligibility.
 */
export function createCanProceedToNext(
  lessonData: { value: { nextLevel?: unknown } | null },
  lessonIsCompleted: ComputedRef<boolean>
) {
  return computed(() => {
    if (!lessonData.value?.nextLevel) return false
    return lessonIsCompleted.value
  })
}

/**
 * Creates homework state and related functions.
 * @returns Object with homework state and functions.
 */
export function createHomeworkState() {
  const homeworkCompleted = ref<Record<number, boolean>>({})

  function toggleHomeworkDone(index: number) {
    homeworkCompleted.value[index] = !homeworkCompleted.value[index]
  }

  function isHomeworkDone(index: number): boolean {
    return !!homeworkCompleted.value[index]
  }

  const homeworkCompletedCount = computed(() => Object.values(homeworkCompleted.value).filter(v => v).length)

  return { homeworkCompleted, toggleHomeworkDone, isHomeworkDone, homeworkCompletedCount }
}

/**
 * Creates level completion and enrollment functions.
 * @param classSlug - Computed course slug.
 * @param levelParam - Computed level number.
 * @param store - Enrollment store instance.
 * @returns Object with level completion functions.
 */
export function createLevelActions(
  classSlug: ComputedRef<string>,
  levelParam: ComputedRef<number>,
  store: ReturnType<typeof useEnrollmentStore>
) {
  function isLevelCompleted(level?: number) {
    return store.isLevelCompleted(classSlug.value, level ?? levelParam.value)
  }

  function completeCurrentLevel() {
    doCompleteLevel(classSlug.value, levelParam.value, store)
  }

  function resetCurrentLevel() {
    doResetLevel(classSlug.value, levelParam.value, store)
  }

  return { isLevelCompleted, completeCurrentLevel, resetCurrentLevel }
}
