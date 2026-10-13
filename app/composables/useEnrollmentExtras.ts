import type { CardSpacedRep, MetricProgress } from '~/types/enrollment'
import { createCardRep, updateCardRep, getDueCards, getDegreeKnowledgeScore, getKnowledgeBreakdown,
  getMetricValueField, getMetricDataPoints, getMetricLatestValues,
  isMilestoneAchievedForMetric, hasActivityLoggedToday
} from '~/utils/enrollmentHelpers'

export function useSpacedRepetition(cardSpacedRep: Ref<CardSpacedRep[]>, flashcardAnswers: Ref<{ cardId: number, courseName: string, level: number, correct: boolean, answeredAt: number }[]>) {
  function getOrCreateCardRep(cardId: number, courseName: string, degree: string, level: number): CardSpacedRep {
    let entry = cardSpacedRep.value.find(e => e.cardId === cardId)
    if (!entry) {
      entry = createCardRep(cardId, courseName, degree, level)
      cardSpacedRep.value.push(entry)
    }
    return entry
  }
  function recordCardAnswerWithSpacedRep(cardId: number, courseName: string, degree: string, level: number, correct: boolean): CardSpacedRep {
    const entry = getOrCreateCardRep(cardId, courseName, degree, level)
    updateCardRep(entry, correct)
    flashcardAnswers.value.push({ cardId, courseName, level, correct, answeredAt: Date.now() })
    return entry
  }
  function getDueCardsFn(allCards: Array<{ id: number, courseName: string, degree: string, level: number }>): CardSpacedRep[] {
    return getDueCards(cardSpacedRep.value, allCards)
  }
  function getDegreeKnowledgeScoreFn(degree: string): number {
    return getDegreeKnowledgeScore(cardSpacedRep.value, degree)
  }
  function getKnowledgeBreakdownFn() {
    return getKnowledgeBreakdown(cardSpacedRep.value)
  }
  return { getOrCreateCardRep, recordCardAnswerWithSpacedRep, getDueCardsFn, getDegreeKnowledgeScoreFn, getKnowledgeBreakdownFn }
}

export function useMetrics(metricProgress: Ref<MetricProgress[]>) {
  function getMetricProgressFn(metricSlug: string): MetricProgress | undefined {
    return metricProgress.value.find(m => m.metricSlug === metricSlug)
  }
  function getMetricValueFieldFn(metricSlug: string, fieldId: string): number {
    return getMetricValueField(metricProgress.value, metricSlug, fieldId)
  }
  function getMetricDataPointsFn(metricSlug: string, fieldId?: string): MetricDataPoint[] {
    return getMetricDataPoints(metricProgress.value, metricSlug, fieldId)
  }
  function getMetricLatestValuesFn(metricSlug: string): Record<string, number> {
    return getMetricLatestValues(metricProgress.value, metricSlug)
  }
  function isMilestoneAchievedFn(metricSlug: string, milestone: MetricMilestone): boolean {
    return isMilestoneAchievedForMetric(metricProgress.value, metricSlug, milestone)
  }
  function getAchievedMilestoneCount(metricSlug: string, milestones: MetricMilestone[]) {
    return milestones.filter(m => isMilestoneAchievedFn(metricSlug, m)).length
  }
  function logActivity(
    activitySlug: string,
    contributions: Array<{ metric: string, map: Record<string, string> }>,
    fieldValues: Record<string, number>
  ) {
    const now = Date.now()
    for (const contribution of contributions) {
      let progress = metricProgress.value.find(m => m.metricSlug === contribution.metric)
      if (!progress) {
        progress = { metricSlug: contribution.metric, dataPoints: [] }
        metricProgress.value.push(progress)
      }
      for (const [activityField, metricField] of Object.entries(contribution.map)) {
        const value = fieldValues[activityField]
        if (value === undefined || value === null) continue
        if (metricField.startsWith('max')) {
          const current = getMetricValueFieldFn(contribution.metric, metricField)
          if (value <= current) continue
        }
        progress.dataPoints.push({ metricSlug: contribution.metric, fieldId: metricField, value, timestamp: now, activitySlug })
      }
    }
  }
  function deleteDataPoint(metricSlug: string, dataPointIndex: number) {
    const progress = metricProgress.value.find(m => m.metricSlug === metricSlug)
    if (progress?.dataPoints) progress.dataPoints.splice(dataPointIndex, 1)
  }
  function hasActivityLoggedTodayFn(activitySlug: string): boolean {
    return hasActivityLoggedToday(metricProgress.value, activitySlug)
  }
  return { getMetricProgressFn, getMetricValueFieldFn, getMetricDataPointsFn, getMetricLatestValuesFn, isMilestoneAchievedFn, getAchievedMilestoneCount, logActivity, deleteDataPoint, hasActivityLoggedTodayFn }
}
