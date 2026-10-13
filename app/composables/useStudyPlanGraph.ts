import type { useEnrollmentStore } from '~/stores/enrollment'
import type { GraphNode, GraphEdge } from '~/utils/studyPlanGraph'
import { buildStudyPlanGraph } from '~/utils/studyPlanGraph'
import { buildDegreeTitlesMap, buildCourseMap, buildDegreesList, enrichCourseMapWithDegrees } from '~/utils/studyPlanDataParser'
import {
  isPlanned, isEnrolledNode, arePrerequisitesMet, isInProgress,
  getNodeStatus, getNodeStatusColor, getNodeFill, getNodeStroke, getNodeLabelColor
} from '~/utils/studyPlanNodeStatus'
import {
  buildTitleCourseSet, buildFilteredCourseMap, markPlannedEdges
} from '~/utils/studyPlanGraphHelpers'
import { useStudyPlanFilters } from './useStudyPlanFilters'

/**
 * Composable for building and managing the study plan dependency graph.
 * Provides graph nodes, edges, filtering, enrollment status, and plan interactions.
 * @param allCourses - Async data containing all course content entries.
 * @param allDegrees - Async data containing all degree content entries.
 * @param planStore - The study plan Pinia store instance.
 * @param store - The enrollment Pinia store instance.
 * @returns Graph data, status helpers, filter actions, and plan interactions.
 */
export function useStudyPlanGraph(
  allCourses: { value: unknown[] | undefined },
  allDegrees: { value: unknown[] | undefined },
  planStore: ReturnType<typeof import('~/stores/studyPlan').useStudyPlanStore>,
  store: ReturnType<typeof useEnrollmentStore>
) {
  const { app } = useRuntimeConfig()

  const degreeTitlesMap = computed(() => buildDegreeTitlesMap(allDegrees.value || []))
  const courseMap = computed(() => {
    const map = buildCourseMap(allCourses.value || [])
    enrichCourseMapWithDegrees(map, degreeTitlesMap.value)
    return map
  })
  const allDegreesList = computed(() => buildDegreesList(degreeTitlesMap.value))

  const selectedDegrees = computed(() => planStore.selectedDegrees)
  const degreeTargetTitle = computed(() => planStore.degreeTargetTitle)
  const studyPlan = computed(() => planStore.studyPlan)

  const titleCourseSet = computed(() =>
    buildTitleCourseSet([...selectedDegrees.value], degreeTargetTitle.value, degreeTitlesMap.value)
  )

  const filteredCourseMap = computed(() =>
    buildFilteredCourseMap(courseMap.value, titleCourseSet.value, [...selectedDegrees.value], degreeTargetTitle.value, degreeTitlesMap.value)
  )

  const filters = useStudyPlanFilters(
    courseMap, degreeTitlesMap, titleCourseSet, selectedDegrees, degreeTargetTitle,
    allDegreesList, planStore, store
  )

  const _selectedNode = ref<GraphNode | null>(null)
  function selectNode(node: GraphNode) {
    _selectedNode.value = node
  }
  function resetSelectedNode() {
    _selectedNode.value = null
  }
  function isSelected(node: GraphNode) {
    return _selectedNode.value?.id === node.id
  }

  const nodes = ref<GraphNode[]>([])
  const edges = ref<GraphEdge[]>([])
  function buildGraph() {
    const result = buildStudyPlanGraph(filteredCourseMap.value as unknown as Parameters<typeof buildStudyPlanGraph>[0], app.baseURL)
    markPlannedEdges(result.edges, studyPlan.value, filteredCourseMap.value)
    nodes.value = result.nodes
    edges.value = result.edges
  }

  function togglePlanForNode(node: GraphNode) {
    if (node.id === 'student') return
    planStore.toggleStudyPlan(node.id)
    buildGraph()
  }
  function removeFromPlan(planId: string) {
    planStore.removeFromStudyPlan(planId)
    if (_selectedNode.value?.id === planId) _selectedNode.value = null
    buildGraph()
  }
  function getPlanLabel(planId: string) {
    return nodes.value.find(n => n.id === planId)?.label || planId
  }
  function selectPlannedNode(planId: string) {
    const node = nodes.value.find(n => n.id === planId)
    if (node) _selectedNode.value = node
  }

  const onDegreeToggle = (slug: string) => filters.onDegreeToggle(slug, buildGraph)
  const toggleAllDegrees = () => filters.toggleAllDegrees(buildGraph)
  const onTitleChange = (slug: string, title: string) => filters.onTitleChange(slug, title, buildGraph)
  const loadFilterState = () => filters.loadFilterState(buildGraph)
  const enrollAllSelected = (enrolling: Ref<boolean>) => filters.enrollAllSelected(enrolling, buildGraph)

  return {
    courseMap, filteredCourseMap, allDegreesList, selectedDegrees, degreeTargetTitle,
    degreeTitlesMap, titleCourseSet, enrollableCoursesCount: filters.enrollableCoursesCount, studyPlan,
    nodes, edges, buildGraph,
    isPlanned: (n: GraphNode) => isPlanned(n, studyPlan.value),
    isEnrolledNode: (n: GraphNode) => isEnrolledNode(n, store),
    arePrerequisitesMet: (n: GraphNode) => arePrerequisitesMet(n, store),
    isInProgress: (n: GraphNode) => isInProgress(n, store),
    isSelected,
    getNodeStatus: (n: GraphNode) => getNodeStatus(n, store, studyPlan.value),
    getNodeStatusColor: (n: GraphNode) => getNodeStatusColor(n, store, studyPlan.value),
    getNodeFill: (n: GraphNode) => getNodeFill(n, store, studyPlan.value),
    getNodeStroke: (n: GraphNode) => getNodeStroke(n, store, studyPlan.value),
    getNodeLabelColor: (n: GraphNode) => getNodeLabelColor(n, store, studyPlan.value),
    selectedNode: _selectedNode, selectNode, resetSelectedNode,
    togglePlanForNode, removeFromPlan, getPlanLabel, selectPlannedNode,
    enrollAllSelected,
    loadFilterState, onDegreeToggle, toggleAllDegrees, onTitleChange,
    autoAddTargetCourses: filters.autoAddTargetCourses,
    getDegreeTitles: filters.getDegreeTitles
  }
}
