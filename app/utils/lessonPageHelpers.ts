/**
 * Helper functions for lesson page state management.
 * Extracted from useLessonPage to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'

export type CourseItem = { stem: string, meta?: { dependencies?: { course: string, level: number }[] } }

/**
 * Finds the first degree that contains a given course.
 * @param allDegrees - All degree content items.
 * @param courseSlug - The course slug to search for.
 * @returns The degree slug, or empty string if not found.
 */
export function findCourseDegree(allDegrees: unknown[] | undefined, courseSlug: string): string {
  if (!allDegrees) return ''
  for (const degree of allDegrees) {
    const levels = (degree as { meta?: { levels?: unknown[] } }).meta?.levels || []
    for (const level of levels as { courses?: { slug?: string }[] }[]) {
      for (const course of level.courses || []) {
        if ((course as { slug?: string }).slug === courseSlug) {
          return (degree as { stem?: string }).stem?.split('/').pop() || ''
        }
      }
    }
  }
  return ''
}

/**
 * Checks if a level is unlocked based on its dependencies.
 * @param classSlug - The class slug identifier.
 * @param levelNum - Level number to check.
 * @param levelItemMap - Map of level numbers to class items.
 * @param store - Enrollment store instance.
 * @returns True if the level is unlocked.
 */
export function checkLevelUnlocked(
  courseSlug: string,
  levelNum: number,
  levelItemMap: Map<number, CourseItem>,
  store: ReturnType<typeof useEnrollmentStore>
): boolean {
  const item = levelItemMap.get(levelNum)
  if (!item) return false
  const deps = (item as { meta?: { dependencies?: { course: string, level: number }[] } }).meta?.dependencies || []
  if (!deps.length) return true
  return store.areDependenciesMet(courseSlug, levelNum, deps)
}

/**
 * Builds a map of level numbers to class items.
 * @param sortedLevels - Array of sorted level data.
 * @returns Map from level number to class item.
 */
export function buildLevelItemMap(
  sortedLevels: { level: number, item: CourseItem }[]
): Map<number, CourseItem> {
  const map = new Map<number, CourseItem>()
  for (const l of sortedLevels) map.set(l.level, l.item)
  return map
}

/**
 * Handles enrollment in a class.
 * @param classSlug - The class slug.
 * @param slug - The class name slug.
 * @param degree - The degree identifier.
 * @param levels - Array of level numbers.
 * @param store - Enrollment store instance.
 */
export function doEnrollInCourse(
  courseSlug: string,
  slug: string,
  degree: string,
  levels: number[],
  store: ReturnType<typeof useEnrollmentStore>
) {
  store.enrollInCourse(courseSlug, slug, degree, levels)
}

/**
 * Completes the current level and awards XP.
 * @param classSlug - The class slug.
 * @param level - Level number.
 * @param store - Enrollment store instance.
 */
export function doCompleteLevel(
  classSlug: string,
  level: number,
  store: ReturnType<typeof useEnrollmentStore>
) {
  store.completeLevel(classSlug, level)
  store.addXp(10)
  store.checkAchievements()
}

/**
 * Resets the current level progress.
 * @param classSlug - The class slug.
 * @param level - Level number.
 * @param store - Enrollment store instance.
 */
export function doResetLevel(
  classSlug: string,
  level: number,
  store: ReturnType<typeof useEnrollmentStore>
) {
  store.resetLevel(classSlug, level)
}

/**
 * Records a flashcard answer.
 * @param fcIndex - Flashcard index.
 * @param courseName - Name of the course.
 * @param level - Level number.
 * @param isCorrect - Whether the answer was correct.
 * @param store - Enrollment store instance.
 */
export function recordFlashcard(
  fcIndex: number,
  courseName: string,
  level: number,
  isCorrect: boolean,
  store: ReturnType<typeof useEnrollmentStore>
) {
  store.recordFlashcardAnswer(fcIndex, courseName, level, isCorrect)
}

/**
 * Gets the CSS class for a flashcard option (wrapper).
 * @param answered - Whether this flashcard has been answered.
 * @param isCorrect - Whether this option is the correct one.
 * @param correctIndex - Index of the correct option.
 * @param getFlashcardOptionClassUtil - Utility function for option classes.
 * @returns CSS class string.
 */
export function getFlashcardOptionClassWrapper(
  answered: boolean | undefined,
  isCorrect: boolean,
  correctIndex: number,
  getFlashcardOptionClassUtil: (answered: boolean, isCorrect: boolean, correctIndex: number) => string
) {
  if (!answered) return 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
  return getFlashcardOptionClassUtil(answered, isCorrect, correctIndex)
}

/**
 * Creates flashcard answer handler.
 * @param lessonData - Lesson data ref.
 * @param flashcardAnswered - Flashcard answered state ref.
 * @param store - Enrollment store instance.
 * @returns Answer flashcard function.
 */
export function createFlashcardAnswerHandler(
  lessonData: { value: { flashcards: { correctIndex: number }[], className: string, level: number } | null },
  flashcardAnswered: { value: Record<number, boolean> },
  store: ReturnType<typeof useEnrollmentStore>
) {
  return function answerFlashcard(fcIndex: number, optIndex: number) {
    if (!lessonData.value) return
    const flashcard = lessonData.value.flashcards[fcIndex]
    if (!flashcard) return
    flashcardAnswered.value[fcIndex] = optIndex === flashcard.correctIndex
    recordFlashcard(fcIndex, lessonData.value.className, lessonData.value.level, flashcardAnswered.value[fcIndex], store)
  }
}

/**
 * Creates flashcard option class handler.
 * @param lessonData - Lesson data ref.
 * @param flashcardAnswered - Flashcard answered state ref.
 * @param getFlashcardOptionClassUtil - Utility function for option classes.
 * @returns Get flashcard option class function.
 */
export function createFlashcardOptionClassHandler(
  lessonData: { value: { flashcards: { correctIndex: number }[] } | null },
  flashcardAnswered: { value: Record<number, boolean> },
  getFlashcardOptionClassUtil: (answered: boolean, isCorrect: boolean, correctIndex: number) => string
) {
  return function getFlashcardOptionClassHandler(fcIndex: number, optIndex: number) {
    const answered = flashcardAnswered.value[fcIndex]
    if (!lessonData.value) return 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
    const flashcard = lessonData.value.flashcards[fcIndex]
    if (!flashcard) return 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
    return getFlashcardOptionClassWrapper(answered, optIndex === flashcard.correctIndex, flashcard.correctIndex, getFlashcardOptionClassUtil)
  }
}

/**
 * Creates SEO meta data for a lesson page.
 * @param lessonData - Lesson data ref.
 */
export function setupLessonSeoMeta(lessonData: { value: { title: string, level: number, body?: string } | null }) {
  useSeoMeta({
    title: computed(() => lessonData.value ? `${lessonData.value.title} - Level ${lessonData.value.level}` : 'Lesson'),
    description: computed(() => {
      if (!lessonData.value?.body) return ''
      const body = lessonData.value.body
      return typeof body === 'string' ? body.slice(0, 160) : ''
    })
  })
}
