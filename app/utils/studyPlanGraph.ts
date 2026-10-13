import {
  compareCourseEntries, buildDegreeColumns, placeTier100Nodes,
  placeHigherTier, updateTierEdges, centerGraphAndConnectStudent, smoothEdgePaths
} from './studyPlanGraphLayout'

/**
 * A node in the study plan graph visualization.
 */
export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  level?: number
  degreeLabel?: string
  courseName?: string
  degree?: string
  dependencies?: { course: string, level: number }[]
  path?: string
  image?: string
}

/**
 * An edge connecting two nodes in the study plan graph.
 */
export interface GraphEdge {
  key: string
  from: string
  to: string
  path: string
  planned: boolean
}

/**
 * Information about a course used for graph building.
 */
export interface CourseInfo {
  degree: string
  degreeLabel: string
  courseName: string
  levels: number[]
  dependencies: Map<number, { course: string, level: number }[]>
}

/**
 * A degree title/level definition.
 */
export interface DegreeTitle {
  name: string
  courses: { slug: string, maxLevel: number }[]
}

/**
 * Build the study plan graph nodes and edges from filtered course data.
 */
export function buildStudyPlanGraph(
  filteredCourseMap: Map<string, CourseInfo>,
  baseURL: string
): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodeList: GraphNode[] = []
  const edgeList: GraphEdge[] = []
  const posMap = new Map<string, { x: number, y: number }>()

  const nodeSpacingX = 160
  const intraGroupSpacingX = 140
  const tierSpacingY = 200
  const studentY = 40
  const tier100Y = studentY + tierSpacingY
  const tier200Y = tier100Y + tierSpacingY
  const tier300Y = tier200Y + tierSpacingY

  const studentNode: GraphNode = { id: 'student', label: 'Student', x: 0, y: studentY, image: `${baseURL}img/placeholder.webp` }
  nodeList.push(studentNode)

  // Categorize courses by tier
  const tier100Courses: Array<{ key: string, info: CourseInfo }> = []
  const tier200Courses: Array<{ key: string, info: CourseInfo }> = []
  const tier300Courses: Array<{ key: string, info: CourseInfo }> = []
  for (const [key, info] of filteredCourseMap) {
    if (info.levels.includes(100)) tier100Courses.push({ key, info })
    if (info.levels.includes(200) && info.dependencies.get(200)?.length) tier200Courses.push({ key, info })
    if (info.levels.includes(300) && info.dependencies.get(300)?.length) tier300Courses.push({ key, info })
  }
  tier100Courses.sort(compareCourseEntries)
  tier200Courses.sort(compareCourseEntries)
  tier300Courses.sort(compareCourseEntries)

  // Build degree columns from tier 100
  const { degreeGroups, sortedDegrees, degreeColumns } = buildDegreeColumns(tier100Courses)

  // Place Tier 100
  const tier100Nodes = placeTier100Nodes(sortedDegrees, degreeGroups, degreeColumns, nodeSpacingX, intraGroupSpacingX, tier100Y, baseURL)
  for (const node of tier100Nodes) posMap.set(node.id, { x: node.x, y: node.y })
  spreadNodesHorizontally(tier100Nodes, nodeSpacingX)
  for (const node of tier100Nodes) posMap.set(node.id, { x: node.x, y: node.y })
  nodeList.push(...tier100Nodes)

  // Place Tier 200
  const tier200Result = placeHigherTier(tier200Courses, filteredCourseMap, posMap, tier200Y, 200, 'II', '/200', baseURL)
  spreadNodesHorizontally(tier200Result.nodes, nodeSpacingX)
  updateTierEdges(tier200Result.nodes, edgeList, posMap)
  edgeList.push(...tier200Result.edges)
  nodeList.push(...tier200Result.nodes)

  // Place Tier 300
  const tier300Result = placeHigherTier(tier300Courses, filteredCourseMap, posMap, tier300Y, 300, 'III', '/300', baseURL)
  spreadNodesHorizontally(tier300Result.nodes, nodeSpacingX)
  updateTierEdges(tier300Result.nodes, edgeList, posMap)
  edgeList.push(...tier300Result.edges)
  nodeList.push(...tier300Result.nodes)

  // Center and connect student
  centerGraphAndConnectStudent(nodeList, studentNode, tier100Nodes, edgeList, posMap)

  // Smooth all edge paths
  smoothEdgePaths(edgeList, posMap, nodeList)

  return { nodes: nodeList, edges: edgeList }
}

/**
 * Spread nodes horizontally so no two nodes are closer than minSpacing.
 */
export function spreadNodesHorizontally(nodes: GraphNode[], minSpacing: number) {
  if (nodes.length === 0) return
  nodes.sort((a, b) => a.x - b.x)
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]!
    const curr = nodes[i]!
    if (curr.x - prev.x < minSpacing) {
      curr.x = prev.x + minSpacing
    }
  }
  for (let i = nodes.length - 2; i >= 0; i--) {
    const curr = nodes[i]!
    const next = nodes[i + 1]!
    const gap = next.x - curr.x
    if (gap > minSpacing * 1.5) {
      const desiredX = next.x - minSpacing
      if (i > 0) {
        const prev = nodes[i - 1]!
        if (desiredX - prev.x >= minSpacing) {
          curr.x = desiredX
        }
      } else {
        curr.x = desiredX
      }
    }
  }
}
