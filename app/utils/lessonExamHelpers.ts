/**
 * Exam task helper functions for lesson pages.
 * Extracted from useLessonPage to keep the composable within line limits.
 */

/**
 * Represents an exam task, either a simple checklist string or a structured milestone object.
 */
export type ExamTask = string | {
  type: string
  text: string
  metric: string
  field: string
  target: number
  label: string
  unit: string
}

/**
 * Returns the type of an exam task.
 * @param task - The exam task to check.
 * @returns 'checklist' for string tasks, or the task's type property.
 */
export function getExamTaskType(task: ExamTask): string {
  if (typeof task === 'string') return 'checklist'
  return task.type || 'checklist'
}

/**
 * Returns the text label of an exam task.
 * @param task - The exam task.
 * @returns The task text or empty string.
 */
export function getExamTaskText(task: ExamTask): string {
  if (typeof task === 'string') return task
  return task.text || ''
}

/**
 * Returns the metric info for a milestone exam task.
 * @param task - The exam task.
 * @returns Object with label, target, and unit.
 */
export function getExamTaskMetric(task: ExamTask): { label: string, target: number, unit: string } {
  if (typeof task === 'object' && task.type === 'milestone') {
    return {
      label: task.label || task.field || '',
      target: task.target || 0,
      unit: task.unit || ''
    }
  }
  return { label: '', target: 0, unit: '' }
}

/**
 * Gets the current value for a milestone task from the enrollment store.
 * @param task - The exam task.
 * @param store - The enrollment store instance.
 * @returns The current metric value.
 */
export function getMilestoneCurrentValue(task: ExamTask, store: { getMetricValueField: (metricSlug: string, fieldId: string) => number }): number {
  if (typeof task !== 'object' || task.type !== 'milestone') return 0
  const metricSlug = task.metric
  const fieldId = task.field
  if (!metricSlug || !fieldId) return 0
  return store.getMetricValueField(metricSlug, fieldId)
}

/**
 * Checks if a milestone task has been achieved.
 * @param task - The exam task.
 * @param store - The enrollment store instance.
 * @returns True if the current value meets or exceeds the target.
 */
export function isMilestoneAchieved(task: ExamTask, store: { getMetricValueField: (metricSlug: string, fieldId: string) => number }): boolean {
  if (typeof task !== 'object' || task.type !== 'milestone') return false
  const current = getMilestoneCurrentValue(task, store)
  return current >= (task.target || 0)
}
