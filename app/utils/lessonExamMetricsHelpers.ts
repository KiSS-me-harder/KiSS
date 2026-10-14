/**
 * Helper functions for exam and metrics checking on lesson pages.
 * Extracted from useLessonPage to keep the composable within line limits.
 */
import { parseMetricRef } from '~/utils/lessonExamHelpers'
import { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Creates functions for checking exam activity completion.
 * @param store - Enrollment store instance.
 * @returns Object with exam checking functions.
 */
export function createExamCheckers(store: ReturnType<typeof useEnrollmentStore>) {
  /**
   * Checks if an exam activity was done in the last 24 hours.
   * @param activitySlug - The activity slug to check.
   * @returns True if the activity was logged within the last 24 hours.
   */
  function isExamActivityDone(activitySlug: string): boolean {
    return store.isActivityDoneRecently(activitySlug)
  }

  /**
   * Counts how many exam activities are completed.
   * @param exam - Array of activity slug references.
   * @returns Number of completed activities.
   */
  function countExamCompleted(exam: string[] | undefined): number {
    if (!exam || exam.length === 0) return 0
    return exam.filter(a => isExamActivityDone(a)).length
  }

  return { isExamActivityDone, countExamCompleted }
}

/**
 * Creates functions for checking metric milestone achievement.
 * @returns Object with metrics checking functions.
 */
export function createMetricsCheckers() {
  /**
   * Checks if a metric milestone has been achieved by looking up the milestone from content.
   * @param ref - The milestone reference string (e.g., "anal-endurance/five-min-wear").
   * @returns True if the milestone requirements are met.
   */
  function isMilestoneAchieved(ref: string): boolean {
    const parsed = parseMetricRef(ref)
    if (!parsed) return false
    const store = useEnrollmentStore()
    const allMetrics = queryCollection('metrics')
      .where('stem', 'LIKE', `metrics/${parsed.metricSlug}%`)
      .allSync()
    for (const item of allMetrics) {
      const milestones = (item as { meta?: { milestones?: unknown[] } }).meta?.milestones as { id: string, requires: Record<string, number> }[] | undefined
      if (milestones) {
        const milestone = milestones.find(m => m.id === parsed.milestoneId)
        if (milestone) {
          return store.isMilestoneAchieved(parsed.metricSlug, milestone)
        }
      }
    }
    return false
  }

  /**
   * Counts how many metric milestones are achieved.
   * @param metrics - Array of milestone references.
   * @returns Number of achieved milestones.
   */
  function countMetricsCompleted(metrics: string[] | undefined): number {
    if (!metrics || metrics.length === 0) return 0
    return metrics.filter(m => isMilestoneAchieved(m)).length
  }

  return { isMilestoneAchieved, countMetricsCompleted }
}
