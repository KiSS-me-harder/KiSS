import type {
  Achievement, CharacterStats, CardSpacedRep, MetricDataPoint, MetricMilestone, MetricProgress
} from '~/types/enrollment'

// --- Achievement helpers ---

/** Creates the default list of achievements available to the user. */
export function createDefaultAchievements(): Achievement[] {
  return [
    { id: 'first-class', title: 'First Step', description: 'Complete your first class level', icon: 'i-lucide-star', unlocked: false },
    { id: 'five-classes', title: 'Dedicated Student', description: 'Complete 5 class levels', icon: 'i-lucide-award', unlocked: false },
    { id: 'flashcard-master', title: 'Flashcard Master', description: 'Answer 50 flashcards correctly', icon: 'i-lucide-zap', unlocked: false },
    { id: 'obedient', title: 'Obedient', description: 'Reach obedience level 10', icon: 'i-lucide-heart', unlocked: false },
    { id: 'charming', title: 'Charming', description: 'Reach charm level 10', icon: 'i-lucide-sparkles', unlocked: false },
    { id: 'scholar', title: 'Scholar', description: 'Reach knowledge level 10', icon: 'i-lucide-book-open', unlocked: false },
    { id: 'confident', title: 'Confident', description: 'Reach confidence level 10', icon: 'i-lucide-flame', unlocked: false },
    { id: 'flexible', title: 'Flexible', description: 'Reach flexibility level 10', icon: 'i-lucide-wind', unlocked: false },
    { id: 'creative', title: 'Creative', description: 'Reach creativity level 10', icon: 'i-lucide-palette', unlocked: false },
    { id: 'all-stats-max', title: 'Perfectionist', description: 'Max out all stats', icon: 'i-lucide-crown', unlocked: false },
    { id: 'detention-free', title: 'Good Behavior', description: 'Complete a week with no detentions', icon: 'i-lucide-shield-check', unlocked: false },
    { id: 'enrolled-three', title: 'Multi-Tasker', description: 'Enroll in 3 classes simultaneously', icon: 'i-lucide-users', unlocked: false }
  ]
}

/**
 * Checks all achievement conditions and unlocks any that are met (stats-based).
 * @param stats - Current character stats.
 * @param completedLevels - Number of completed class levels.
 * @param enrolledCount - Number of currently enrolled classes.
 * @param flashcardsCorrect - Number of correct flashcard answers.
 * @param achievements - Current achievement list.
 * @returns Updated achievement list with newly unlocked achievements.
 */
export function checkAchievementsForStats(
  stats: CharacterStats,
  completedLevels: number,
  enrolledCount: number,
  flashcardsCorrect: number,
  achievements: Achievement[]
): Achievement[] {
  const updated = achievements.map(a => ({ ...a }))

  if (completedLevels >= 1) unlock(updated, 'first-class')
  if (completedLevels >= 5) unlock(updated, 'five-classes')
  if (enrolledCount >= 3) unlock(updated, 'enrolled-three')
  if (flashcardsCorrect >= 50) unlock(updated, 'flashcard-master')
  if (stats.obedience >= 10) unlock(updated, 'obedient')
  if (stats.charm >= 10) unlock(updated, 'charming')
  if (stats.knowledge >= 10) unlock(updated, 'scholar')
  if (stats.confidence >= 10) unlock(updated, 'confident')
  if (stats.flexibility >= 10) unlock(updated, 'flexible')
  if (stats.creativity >= 10) unlock(updated, 'creative')
  if (Object.values(stats).every(v => v >= 10)) unlock(updated, 'all-stats-max')

  return updated
}

function unlock(achievements: Achievement[], id: string) {
  const a = achievements.find(a => a.id === id)
  if (a && !a.unlocked) {
    a.unlocked = true
    a.unlockedAt = Date.now()
  }
}

// --- Spaced repetition helpers ---

/**
 * Creates a new spaced repetition entry for a flashcard.
 * @param cardId - Unique card identifier.
 * @param courseName - Course the card belongs to.
 * @param degree - Degree program the card is associated with.
 * @param level - Class level of the card.
 * @returns A new CardSpacedRep entry ready for tracking.
 */
export function createCardRep(
  cardId: number, courseName: string, degree: string, level: number
): CardSpacedRep {
  return {
    cardId, courseName, degree, level,
    consecutiveSuccesses: 0, intervalDays: 0, dueDate: 0,
    lastFailed: null, totalCorrect: 0, totalIncorrect: 0
  }
}

/**
 * Updates a spaced repetition entry after an answer.
 * On correct answers, increases interval; on incorrect, resets to immediate.
 * @param entry - The card's spaced repetition record.
 * @param correct - Whether the answer was correct.
 */
export function updateCardRep(entry: CardSpacedRep, correct: boolean): void {
  const now = Date.now()
  const msPerDay = 24 * 60 * 60 * 1000

  if (correct) {
    entry.consecutiveSuccesses++
    entry.totalCorrect++
    entry.intervalDays = entry.consecutiveSuccesses
    entry.dueDate = now + entry.intervalDays * msPerDay
  } else {
    entry.consecutiveSuccesses = 0
    entry.totalIncorrect++
    entry.lastFailed = now
    entry.intervalDays = 0
    entry.dueDate = 0
  }
}

/**
 * Returns all flashcards that are due for review, sorted by priority.
 * Prioritizes cards from weaker degree areas and those with fewer consecutive successes.
 * @param cardSpacedRep - All spaced repetition entries.
 * @param allCards - Current list of available cards.
 * @returns Due cards sorted by urgency.
 */
export function getDueCards(
  cardSpacedRep: CardSpacedRep[],
  allCards: Array<{ id: number, courseName: string, degree: string, level: number }>
): CardSpacedRep[] {
  const now = Date.now()
  const degreeScores: Record<string, { correct: number, incorrect: number }> = {}
  for (const entry of cardSpacedRep) {
    if (!degreeScores[entry.degree]) degreeScores[entry.degree] = { correct: 0, incorrect: 0 }
    degreeScores[entry.degree]!.correct += entry.totalCorrect
    degreeScores[entry.degree]!.incorrect += entry.totalIncorrect
  }

  const degreeWeakness: Record<string, number> = {}
  for (const [degree, scores] of Object.entries(degreeScores)) {
    if (scores.incorrect > 0) {
      degreeWeakness[degree] = scores.incorrect / (scores.correct + scores.incorrect)
    } else if (scores.correct > 0) {
      degreeWeakness[degree] = 0
    } else {
      degreeWeakness[degree] = 0.5
    }
  }

  const cardIdSet = new Set(allCards.map(c => c.id))
  const dueCards: CardSpacedRep[] = []
  for (const entry of cardSpacedRep) {
    if (!cardIdSet.has(entry.cardId)) continue
    if (entry.dueDate <= now) dueCards.push(entry)
  }

  dueCards.sort((a, b) => {
    const weaknessA = degreeWeakness[a.degree] ?? 0.5
    const weaknessB = degreeWeakness[b.degree] ?? 0.5
    if (Math.abs(weaknessA - weaknessB) > 0.01) return weaknessB - weaknessA
    return a.consecutiveSuccesses - b.consecutiveSuccesses
  })

  return dueCards
}

/**
 * Calculates the knowledge score (0–100) for a degree based on flashcard performance.
 * @param cardSpacedRep - All spaced repetition entries.
 * @param degree - The degree to score.
 * @returns Percentage score of correct answers for the degree.
 */
export function getDegreeKnowledgeScore(cardSpacedRep: CardSpacedRep[], degree: string): number {
  const degreeCards = cardSpacedRep.filter(e => e.degree === degree)
  if (degreeCards.length === 0) return 0
  let totalCorrect = 0
  let totalIncorrect = 0
  for (const entry of degreeCards) {
    totalCorrect += entry.totalCorrect
    totalIncorrect += entry.totalIncorrect
  }
  const total = totalCorrect + totalIncorrect
  if (total === 0) return 0
  return Math.round((totalCorrect / total) * 100)
}

/**
 * Returns knowledge breakdown by degree, sorted from weakest to strongest.
 * @param cardSpacedRep - All spaced repetition entries.
 * @returns Array of degree scores with card review counts.
 */
export function getKnowledgeBreakdown(
  cardSpacedRep: CardSpacedRep[]
): Array<{ degree: string, score: number, cardsReviewed: number }> {
  const degreeData: Record<string, { correct: number, incorrect: number }> = {}
  for (const entry of cardSpacedRep) {
    if (!degreeData[entry.degree]) degreeData[entry.degree] = { correct: 0, incorrect: 0 }
    degreeData[entry.degree]!.correct += entry.totalCorrect
    degreeData[entry.degree]!.incorrect += entry.totalIncorrect
  }
  return Object.entries(degreeData).map(([degree, data]) => {
    const total = data.correct + data.incorrect
    const score = total > 0 ? Math.round((data.correct / total) * 100) : 0
    return { degree, score, cardsReviewed: total }
  }).sort((a, b) => a.score - b.score)
}

// --- Metrics helpers ---

/**
 * Returns the latest recorded value for a specific metric field.
 * @param metricProgress - All metric progress records.
 * @param metricSlug - The metric to query.
 * @param fieldId - The field within the metric.
 * @returns The most recent value, or 0 if not found.
 */
export function getMetricValueField(metricProgress: MetricProgress[], metricSlug: string, fieldId: string): number {
  const progress = metricProgress.find(m => m.metricSlug === metricSlug)
  if (!progress || !progress.dataPoints || progress.dataPoints.length === 0) return 0
  const fieldPoints = progress.dataPoints.filter(dp => dp.fieldId === fieldId).sort((a, b) => b.timestamp - a.timestamp)
  return fieldPoints[0]?.value ?? 0
}

/**
 * Returns all data points for a metric, optionally filtered by field, sorted chronologically.
 * @param metricProgress - All metric progress records.
 * @param metricSlug - The metric to query.
 * @param fieldId - Optional field filter.
 * @returns Sorted data points.
 */
export function getMetricDataPoints(metricProgress: MetricProgress[], metricSlug: string, fieldId?: string): MetricDataPoint[] {
  const progress = metricProgress.find(m => m.metricSlug === metricSlug)
  if (!progress || !progress.dataPoints) return []
  let points = progress.dataPoints
  if (fieldId) points = points.filter(dp => dp.fieldId === fieldId)
  return [...points].sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Returns the latest value for each field of a metric.
 * @param metricProgress - All metric progress records.
 * @param metricSlug - The metric to query.
 * @returns Record mapping field IDs to their latest values.
 */
export function getMetricLatestValues(metricProgress: MetricProgress[], metricSlug: string): Record<string, number> {
  const progress = metricProgress.find(m => m.metricSlug === metricSlug)
  if (!progress || !progress.dataPoints || progress.dataPoints.length === 0) return {}
  const fieldLatest: Record<string, { value: number, timestamp: number }> = {}
  for (const dp of progress.dataPoints) {
    const existing = fieldLatest[dp.fieldId]
    if (!existing || dp.timestamp > existing.timestamp) {
      fieldLatest[dp.fieldId] = { value: dp.value, timestamp: dp.timestamp }
    }
  }
  const result: Record<string, number> = {}
  for (const [fieldId, data] of Object.entries(fieldLatest)) {
    result[fieldId] = data.value
  }
  return result
}

/**
 * Checks whether a milestone's requirements are met based on current metric values.
 * @param metricProgress - All metric progress records.
 * @param metricSlug - The metric to check.
 * @param milestone - The milestone definition with required field values.
 * @returns True if all required field values are met or exceeded.
 */
export function isMilestoneAchievedForMetric(metricProgress: MetricProgress[], metricSlug: string, milestone: MetricMilestone): boolean {
  const latestValues = getMetricLatestValues(metricProgress, metricSlug)
  for (const [fieldId, requiredValue] of Object.entries(milestone.requires)) {
    if ((latestValues[fieldId] ?? 0) < requiredValue) return false
  }
  return true
}

/**
 * Checks whether an activity was logged today based on metric data points.
 * @param metricProgress - All metric progress records.
 * @param activitySlug - The activity to check.
 * @returns True if the activity was logged since the start of today.
 */
export function hasActivityLoggedToday(metricProgress: MetricProgress[], activitySlug: string): boolean {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayStart = startOfToday.getTime()
  for (const progress of metricProgress) {
    for (const dp of progress.dataPoints) {
      if (dp.activitySlug === activitySlug && dp.timestamp >= todayStart) return true
    }
  }
  return false
}
