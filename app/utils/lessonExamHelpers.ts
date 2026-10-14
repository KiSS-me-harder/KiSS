/**
 * Exam and metrics helper functions for lesson pages.
 * Extracted from useLessonPage to keep the composable within line limits.
 *
 * New format:
 * - homework: string[] — checklist items
 * - exam: string[] — activity slug references (e.g., "butt-plug-wearing")
 * - metrics: string[] — milestone references (e.g., "anal-endurance/five-min-wear")
 */

/**
 * Represents a homework item — a simple checklist string.
 */
export type HomeworkItem = string

/**
 * Represents an exam activity reference — an activity slug.
 */
export type ExamActivityRef = string

/**
 * Represents a metrics milestone reference — format: "metric-slug/milestone-id".
 */
export type MetricMilestoneRef = string

/**
 * Parses a metric milestone reference string into its components.
 * @param ref - The milestone reference string (e.g., "anal-endurance/five-min-wear").
 * @returns Object with metricSlug and milestoneId, or null if invalid.
 */
export function parseMetricRef(ref: string): { metricSlug: string, milestoneId: string } | null {
  const parts = ref.split('/')
  if (parts.length !== 2) return null
  return { metricSlug: parts[0], milestoneId: parts[1] }
}

/**
 * Checks if all flashcards for a lesson are answered correctly.
 * @param flashcards - Array of flashcard objects.
 * @param flashcardAnswered - Record of answered flashcards.
 * @returns True if all flashcards are answered correctly.
 */
export function areAllFlashcardsDone(
  flashcards: { correctIndex: number }[] | undefined,
  flashcardAnswered: Record<number, boolean>
): boolean {
  if (!flashcards || flashcards.length === 0) return true
  for (let i = 0; i < flashcards.length; i++) {
    if (!flashcardAnswered[i]) return false
  }
  return true
}

/**
 * Checks if all homework items are completed.
 * @param homework - Array of homework items.
 * @param homeworkCompleted - Record of completed homework indices.
 * @returns True if all homework is done.
 */
export function isAllHomeworkDone(
  homework: string[] | undefined,
  homeworkCompleted: Record<number, boolean>
): boolean {
  if (!homework || homework.length === 0) return true
  for (let i = 0; i < homework.length; i++) {
    if (!homeworkCompleted[i]) return false
  }
  return true
}

/**
 * Checks if all exam activities are completed.
 * @param exam - Array of activity slug references.
 * @param isExamActivityDone - Function to check if an activity was done in the last 24 hours.
 * @returns True if all exam activities are completed.
 */
export function isAllExamDone(
  exam: string[] | undefined,
  isExamActivityDone: (activitySlug: string) => boolean
): boolean {
  if (!exam || exam.length === 0) return true
  for (const activity of exam) {
    if (!isExamActivityDone(activity)) return false
  }
  return true
}

/**
 * Checks if all metric milestones are achieved.
 * @param metrics - Array of metric milestone references.
 * @param isMilestoneAchieved - Function to check if a milestone is achieved.
 * @returns True if all metric milestones are achieved.
 */
export function isAllMetricsDone(
  metrics: string[] | undefined,
  isMilestoneAchieved: (ref: string) => boolean
): boolean {
  if (!metrics || metrics.length === 0) return true
  for (const ref of metrics) {
    if (!isMilestoneAchieved(ref)) return false
  }
  return true
}

/**
 * Checks if a lesson is fully completed (flashcards, homework, exam, and metrics).
 * @param flashcards - Array of flashcards.
 * @param flashcardAnswered - Record of answered flashcards.
 * @param homework - Array of homework items.
 * @param homeworkCompleted - Record of completed homework.
 * @param exam - Array of activity slug references.
 * @param isExamActivityDone - Function to check exam activity completion.
 * @param metrics - Array of metric milestone references.
 * @param isMilestoneAchieved - Function to check milestone achievement.
 * @returns True if the lesson is fully completed.
 */
export function isLessonCompleted(
  flashcards: { correctIndex: number }[] | undefined,
  flashcardAnswered: Record<number, boolean>,
  homework: string[] | undefined,
  homeworkCompleted: Record<number, boolean>,
  exam: string[] | undefined,
  isExamActivityDone: (activitySlug: string) => boolean,
  metrics: string[] | undefined,
  isMilestoneAchieved: (ref: string) => boolean
): boolean {
  return areAllFlashcardsDone(flashcards, flashcardAnswered)
    && isAllHomeworkDone(homework, homeworkCompleted)
    && isAllExamDone(exam, isExamActivityDone)
    && isAllMetricsDone(metrics, isMilestoneAchieved)
}
