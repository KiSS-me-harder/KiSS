/**
 * Helper functions for flashcards page.
 * Extracted from useFlashcards to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Flashcard data structure.
 */
export interface Flashcard {
  id: number
  question: string
  options: string[]
  correctIndex: number
  courseName: string
  courseSlug: string
  degree: string
  level: number
}

/**
 * Builds the flashcard deck from course content data.
 * @param allCourses - All course content entries.
 * @param store - The enrollment store.
 * @returns Array of flashcard objects.
 */
export function buildFlashcardDeck(allCourses: unknown[], store: ReturnType<typeof useEnrollmentStore>): Flashcard[] {
  if (!allCourses.length) return []
  const cards: Flashcard[] = []
  let id = 0
  for (const item of allCourses) {
    const flashcardsData = (item as { flashcards?: unknown[] }).flashcards
    if (!flashcardsData || !Array.isArray(flashcardsData) || flashcardsData.length === 0) continue
    const stemParts = (item as { stem?: string }).stem?.split('/') || []
    if (stemParts.length < 3) continue
    const className = stemParts[1] || ''
    const level = parseInt(stemParts[2] ?? '', 10)
    if (isNaN(level)) continue
    if (!store.isEnrolled(className)) continue
    for (const fc of flashcardsData) {
      cards.push({
        id: id++,
        question: (fc as { question?: string }).question || '',
        options: (fc as { options?: string[] }).options || [],
        correctIndex: (fc as { correctIndex?: number }).correctIndex || 0,
        courseName: className, courseSlug: className, degree: '', level
      })
    }
  }
  return cards
}

/**
 * Computes the course knowledge breakdown from flashcard answers.
 * @param allDeckCards - All flashcard deck cards.
 * @param store - The enrollment store.
 * @returns Array of course knowledge stats.
 */
export function computeCourseKnowledgeBreakdown(
  allDeckCards: Flashcard[],
  store: ReturnType<typeof useEnrollmentStore>
) {
  const courseSlugsInDeck = new Map<string, { courseName: string, courseSlug: string, degree: string, cardCount: number }>()
  for (const card of allDeckCards) {
    const key = card.courseSlug
    const existing = courseSlugsInDeck.get(key)
    if (existing) existing.cardCount++
    else courseSlugsInDeck.set(key, { courseName: card.courseName, courseSlug: card.courseSlug, degree: card.degree, cardCount: 1 })
  }
  const courseData: Record<string, { correct: number, incorrect: number }> = {}
  for (const entry of store.cardSpacedRep) {
    if (!courseData[entry.courseName]) courseData[entry.courseName] = { correct: 0, incorrect: 0 }
    courseData[entry.courseName]!.correct += entry.totalCorrect
    courseData[entry.courseName]!.incorrect += entry.totalIncorrect
  }
  const result: Array<{ courseName: string, courseSlug: string, degree: string, score: number, cardsReviewed: number, cardCount: number, totalIncorrect: number }> = []
  for (const [, info] of courseSlugsInDeck) {
    const data = courseData[info.courseName] || { correct: 0, incorrect: 0 }
    const total = data.correct + data.incorrect
    const score = total > 0 ? Math.round((data.correct / total) * 100) : 0
    result.push({
      courseName: info.courseName, courseSlug: info.courseSlug, degree: info.degree,
      score, cardsReviewed: total, cardCount: info.cardCount, totalIncorrect: data.incorrect
    })
  }
  result.sort((a, b) => {
    if (a.cardsReviewed === 0 && b.cardsReviewed === 0) return 0
    if (a.cardsReviewed === 0) return 1
    if (b.cardsReviewed === 0) return -1
    if (a.score !== b.score) return a.score - b.score
    return b.totalIncorrect - a.totalIncorrect
  })
  return result
}
