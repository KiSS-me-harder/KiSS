/**
 * Flashcard helper functions for lesson pages.
 * Extracted from useLessonPage to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Returns the CSS class for a flashcard option based on answer state.
 * @param answered - Whether this flashcard has been answered.
 * @param isCorrectOption - Whether this option is the correct answer.
 * @param flashcardCorrectIndex - The correct answer index.
 * @returns CSS class string for the option button.
 */
export function getFlashcardOptionClass(answered: boolean | undefined, isCorrectOption: boolean, _flashcardCorrectIndex: number): string {
  if (answered === undefined) {
    return 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white cursor-pointer'
  }
  if (isCorrectOption) {
    return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-not-allowed'
  }
  if (answered === false && !isCorrectOption) {
    return 'border-red-500/20 bg-red-500/5 text-white/30 cursor-not-allowed'
  }
  return 'border-white/5 bg-transparent text-white/20 cursor-not-allowed'
}

/**
 * Handles answering a flashcard question.
 * @param fcIndex - The flashcard index.
 * @param optIndex - The selected option index.
 * @param correctIndex - The correct answer index.
 * @param flashcardAnswered - Reactive record of answered flashcards.
 * @param store - The enrollment store.
 * @param className - The class name for recording.
 * @param level - The level number for recording.
 */
export function answerFlashcard(
  fcIndex: number,
  optIndex: number,
  correctIndex: number,
  flashcardAnswered: Record<number, boolean>,
  store: ReturnType<typeof useEnrollmentStore>,
  className: string,
  level: number
) {
  const isCorrect = optIndex === correctIndex
  flashcardAnswered[fcIndex] = isCorrect
  store.recordFlashcardAnswer(fcIndex, className, level, isCorrect)
}
