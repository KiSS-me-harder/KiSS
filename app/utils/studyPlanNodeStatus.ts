/**
 * Node status helper functions for the study plan graph.
 * Extracted from useStudyPlanGraph to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'
import type { GraphNode } from '~/utils/studyPlanGraph'

/**
 * Checks if a node is in the current study plan.
 * @param node - The graph node to check.
 * @param studyPlan - Set of planned node IDs.
 * @returns True if the node is planned.
 */
export function isPlanned(node: GraphNode, studyPlan: Set<string>) {
  return node.id !== 'student' && studyPlan.has(node.id)
}

/**
 * Checks if a node's class is enrolled.
 * @param node - The graph node to check.
 * @param store - The enrollment store.
 * @returns True if enrolled.
 */
export function isEnrolledNode(node: GraphNode, store: ReturnType<typeof useEnrollmentStore>) {
  if (node.id === 'student') return false
  return store.isEnrolled(node.id.split('@')[0] ?? node.id)
}

/**
 * Checks if all prerequisites for a node are met.
 * @param node - The graph node to check.
 * @param store - The enrollment store.
 * @returns True if prerequisites are met.
 */
export function arePrerequisitesMet(node: GraphNode, store: ReturnType<typeof useEnrollmentStore>) {
  if (node.id === 'student' || !node.dependencies?.length) return true
  const baseKey = node.id.split('@')[0] ?? node.id
  return store.areDependenciesMet(baseKey, node.level ?? 100, node.dependencies)
}

/**
 * Checks if a node's class is in progress (some levels completed, some not).
 * @param node - The graph node to check.
 * @param store - The enrollment store.
 * @returns True if in progress.
 */
export function isInProgress(node: GraphNode, store: ReturnType<typeof useEnrollmentStore>) {
  if (node.id === 'student') return false
  const enrollment = store.getEnrollment(node.id.split('@')[0] ?? node.id)
  return !!enrollment && enrollment.levels.some((l: { completed: boolean }) => l.completed) && enrollment.levels.some((l: { completed: boolean }) => !l.completed)
}

/**
 * Returns a human-readable status label for a node.
 * @param node - The graph node.
 * @param store - The enrollment store.
 * @param studyPlan - Set of planned node IDs.
 * @returns Status string.
 */
export function getNodeStatus(
  node: GraphNode,
  store: ReturnType<typeof useEnrollmentStore>,
  studyPlan: Set<string>
) {
  if (node.id === 'student') return 'You'
  if (isInProgress(node, store)) return 'In Progress'
  if (isEnrolledNode(node, store)) return arePrerequisitesMet(node, store) ? 'Enrolled' : 'Locked (enrolled)'
  if (isPlanned(node, studyPlan)) return 'Planned'
  return 'Available'
}

/**
 * Returns a CSS text color class for a node's status.
 * @param node - The graph node.
 * @param store - The enrollment store.
 * @param studyPlan - Set of planned node IDs.
 * @returns CSS color class string.
 */
export function getNodeStatusColor(
  node: GraphNode,
  store: ReturnType<typeof useEnrollmentStore>,
  studyPlan: Set<string>
) {
  if (node.id === 'student') return 'text-purple-400'
  if (isInProgress(node, store)) return 'text-amber-400'
  if (isEnrolledNode(node, store)) return arePrerequisitesMet(node, store) ? 'text-emerald-400' : 'text-gray-400'
  if (isPlanned(node, studyPlan)) return 'text-blue-400'
  return 'text-white/40'
}

/**
 * Returns a fill color for a node based on its status.
 * @param node - The graph node.
 * @param store - The enrollment store.
 * @param studyPlan - Set of planned node IDs.
 * @returns Color hex/rgba string.
 */
export function getNodeFill(
  node: GraphNode,
  store: ReturnType<typeof useEnrollmentStore>,
  studyPlan: Set<string>
) {
  if (node.id === 'student') return '#a855f7'
  if (isInProgress(node, store)) return '#f59e0b'
  if (isEnrolledNode(node, store)) return arePrerequisitesMet(node, store) ? '#10b981' : '#6b7280'
  if (isPlanned(node, studyPlan)) return '#3b82f6'
  return 'rgba(255,255,255,0.1)'
}

/**
 * Returns a stroke color for a node based on its status.
 * @param node - The graph node.
 * @param store - The enrollment store.
 * @param studyPlan - Set of planned node IDs.
 * @returns Color hex/rgba string.
 */
export function getNodeStroke(
  node: GraphNode,
  store: ReturnType<typeof useEnrollmentStore>,
  studyPlan: Set<string>
) {
  if (node.id === 'student') return 'rgba(168,85,247,0.6)'
  if (isInProgress(node, store)) return 'rgba(245,158,11,0.6)'
  if (isEnrolledNode(node, store)) return arePrerequisitesMet(node, store) ? 'rgba(16,185,129,0.6)' : 'rgba(107,114,128,0.5)'
  if (isPlanned(node, studyPlan)) return 'rgba(59,130,246,0.6)'
  return 'rgba(255,255,255,0.08)'
}

/**
 * Returns a label color for a node based on its status.
 * @param node - The graph node.
 * @param store - The enrollment store.
 * @param studyPlan - Set of planned node IDs.
 * @returns Color hex/rgba string.
 */
export function getNodeLabelColor(
  node: GraphNode,
  store: ReturnType<typeof useEnrollmentStore>,
  studyPlan: Set<string>
) {
  if (node.id === 'student') return '#fff'
  if (isInProgress(node, store)) return '#fbbf24'
  if (isEnrolledNode(node, store)) return arePrerequisitesMet(node, store) ? '#34d399' : '#9ca3af'
  if (isPlanned(node, studyPlan)) return '#60a5fa'
  return 'rgba(255,255,255,0.65)'
}
