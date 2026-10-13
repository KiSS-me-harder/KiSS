/**
 * Helper functions for building the study plan graph layout.
 * Extracted from buildStudyPlanGraph to keep it within line limits.
 */
import type { GraphNode, GraphEdge, CourseInfo } from './studyPlanGraph'

type CourseEntry = { key: string, info: CourseInfo }

/**
 * Sorts course entries by degree label, then course name.
 * @param a - First entry.
 * @param b - Second entry.
 * @returns Comparison result.
 */
export function compareCourseEntries(a: CourseEntry, b: CourseEntry): number {
  const dCmp = a.info.degreeLabel.localeCompare(b.info.degreeLabel)
  if (dCmp !== 0) return dCmp
  return a.info.courseName.localeCompare(b.info.courseName)
}

/**
 * Groups tier 100 courses by degree and assigns column positions.
 * @param tier100Courses - Sorted tier 100 course entries.
 * @returns Degree groups and column map.
 */
export function buildDegreeColumns(tier100Courses: CourseEntry[]) {
  const degreeGroups = new Map<string, CourseEntry[]>()
  for (const { key, info } of tier100Courses) {
    if (!degreeGroups.has(info.degree)) degreeGroups.set(info.degree, [])
    degreeGroups.get(info.degree)!.push({ key, info })
  }
  const sortedDegrees = [...degreeGroups.keys()].sort((a, b) => {
    const aLabel = degreeGroups.get(a)![0]!.info.degreeLabel
    const bLabel = degreeGroups.get(b)![0]!.info.degreeLabel
    return aLabel.localeCompare(bLabel)
  })
  const degreeColumns = new Map<string, number>()
  let col = 0
  for (const deg of sortedDegrees) {
    degreeColumns.set(deg, col++)
  }
  return { degreeGroups, sortedDegrees, degreeColumns }
}

/**
 * Places tier 100 nodes at their positions.
 * @param sortedDegrees - Sorted degree slugs.
 * @param degreeGroups - Groups of classes by degree.
 * @param degreeColumns - Column assignments.
 * @param nodeSpacingX - Horizontal spacing between columns.
 * @param intraGroupSpacingX - Spacing within a group.
 * @param tier100Y - Y position for tier 100.
 * @param baseURL - Base URL for images.
 * @returns Array of placed tier 100 nodes.
 */
export function placeTier100Nodes(
  sortedDegrees: string[],
  degreeGroups: Map<string, CourseEntry[]>,
  degreeColumns: Map<string, number>,
  nodeSpacingX: number,
  intraGroupSpacingX: number,
  tier100Y: number,
  baseURL: string
): GraphNode[] {
  const nodes: GraphNode[] = []
  for (const deg of sortedDegrees) {
    const group = degreeGroups.get(deg) || []
    const baseCol = degreeColumns.get(deg) ?? 0
    for (let i = 0; i < group.length; i++) {
      const { key, info } = group[i]!
      const x = (baseCol * nodeSpacingX) + (i * intraGroupSpacingX)
      nodes.push({
        id: key, label: info.courseName, x, y: tier100Y, level: 100,
        degreeLabel: info.degreeLabel, courseName: info.courseName, degree: info.degree,
        dependencies: info.dependencies.get(100) || [],
        path: `/courses/${key}`, image: `${baseURL}img/degrees/${info.degree}.webp`
      })
    }
  }
  return nodes
}

/**
 * Places a higher tier (200/300) and returns nodes and edges.
 * @param tierCourses - Courses for this tier.
 * @param filteredCourseMap - Full course map.
 * @param posMap - Position map of already placed nodes.
 * @param tierY - Y position for this tier.
 * @param tierLevel - Tier level number (200 or 300).
 * @param tierSuffix - Label suffix (II or III).
 * @param pathSuffix - URL path suffix.
 * @param baseURL - Base URL for images.
 * @returns Array of placed nodes.
 */
export function placeHigherTier(
  tierCourses: CourseEntry[],
  filteredCourseMap: Map<string, CourseInfo>,
  posMap: Map<string, { x: number, y: number }>,
  tierY: number,
  tierLevel: number,
  tierSuffix: string,
  pathSuffix: string,
  baseURL: string
): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  for (const { key, info } of tierCourses) {
    const deps = info.dependencies.get(tierLevel)!
    let depXSum = 0, depCount = 0
    const depFromIds: { id: string, pos: { x: number, y: number } }[] = []

    for (const dep of deps) {
      // dep.course is now the course slug (ID), match directly against the map key
      const dk = dep.course
      const de = filteredCourseMap.get(dk)
      if (de) {
        const pos200 = posMap.get(`${dk}@200`)
        const pos100 = posMap.get(dk)
        const pos = pos200 || pos100
        if (pos) {
          depXSum += pos.x
          depCount++
          const fromId = pos200 ? `${dk}@200` : dk
          depFromIds.push({ id: fromId, pos })
        }
      }
    }
    if (depCount === 0) continue

    const x = depXSum / depCount
    nodes.push({
      id: `${key}@${tierLevel}`, label: `${info.courseName} ${tierSuffix}`,
      x, y: tierY, level: tierLevel, degreeLabel: info.degreeLabel,
      courseName: info.courseName, degree: info.degree, dependencies: deps,
      path: `/courses/${key}${pathSuffix}`, image: `${baseURL}img/degrees/${info.degree}.webp`
    })

    for (const { id: fromId, pos } of depFromIds) {
      edges.push({
        key: `${fromId}->${key}@${tierLevel}`,
        from: fromId, to: `${key}@${tierLevel}`,
        path: `M ${pos.x} ${pos.y} L ${x} ${tierY}`, planned: false
      })
    }
  }
  return { nodes, edges }
}

/**
 * Updates edge paths after nodes are repositioned (spread horizontally).
 * @param nodes - The tier nodes that were repositioned.
 * @param edges - All edges to update.
 * @param posMap - Position map to update.
 */
export function updateTierEdges(
  nodes: GraphNode[],
  edges: GraphEdge[],
  posMap: Map<string, { x: number, y: number }>
) {
  for (const node of nodes) {
    posMap.set(node.id, { x: node.x, y: node.y })
  }
  for (const node of nodes) {
    for (const edge of edges) {
      if (edge.to === node.id) {
        const fromPos = posMap.get(edge.from)
        if (fromPos) edge.path = `M ${fromPos.x} ${fromPos.y} L ${node.x} ${node.y}`
      }
    }
  }
}

/**
 * Centers all class nodes horizontally and adds student edges.
 * @param nodeList - All nodes.
 * @param studentNode - The student node.
 * @param tier100Nodes - Tier 100 nodes to connect from student.
 * @param edgeList - All edges.
 * @param posMap - Position map.
 */
export function centerGraphAndConnectStudent(
  nodeList: GraphNode[],
  studentNode: GraphNode,
  tier100Nodes: GraphNode[],
  edgeList: GraphEdge[],
  posMap: Map<string, { x: number, y: number }>
) {
  if (nodeList.length < 2) return
  const courseNodes = nodeList.filter(n => n.id !== 'student')
  if (courseNodes.length === 0) return

  const allX = courseNodes.map(n => n.x)
  const minX = Math.min(...allX)
  const maxX = Math.max(...allX)
  const graphCenterX = (minX + maxX) / 2

  for (const node of courseNodes) {
    node.x -= graphCenterX
  }

  posMap.clear()
  for (const node of nodeList) {
    posMap.set(node.id, { x: node.x, y: node.y })
  }

  for (const node of tier100Nodes) {
    const fromY = studentNode.y
    const toY = node.y
    const midY = (fromY + toY) / 2
    edgeList.push({
      key: `student->${node.id}`,
      from: 'student', to: node.id,
      path: `M ${studentNode.x} ${fromY} C ${studentNode.x} ${midY}, ${node.x} ${midY}, ${node.x} ${toY}`,
      planned: false
    })
  }
}

/**
 * Converts all edge paths to smooth bezier curves.
 * @param edgeList - All edges.
 * @param posMap - Position map.
 * @param nodeList - All nodes.
 */
export function smoothEdgePaths(
  edgeList: GraphEdge[],
  posMap: Map<string, { x: number, y: number }>,
  nodeList: GraphNode[]
) {
  for (const edge of edgeList) {
    const fromPos = posMap.get(edge.from)
    const toNode = nodeList.find(n => n.id === edge.to)
    if (fromPos && toNode) {
      const fromY = fromPos.y
      const toY = toNode.y
      const midY = (fromY + toY) / 2
      edge.path = `M ${fromPos.x} ${fromY} C ${fromPos.x} ${midY}, ${toNode.x} ${midY}, ${toNode.x} ${toY}`
    }
  }
}
