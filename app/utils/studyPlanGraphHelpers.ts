/**
 * Helper functions for study plan graph filtering and dependency paths.
 * Extracted from useStudyPlanGraph to keep the composable within line limits.
 */
import type { CourseInfo, DegreeTitle, GraphEdge } from './studyPlanGraph'

/**
 * Filtered course info with reduced levels and dependencies.
 */
export interface FilteredCourseInfo {
  degree: string
  degreeLabel: string
  courseName: string
  levels: number[]
  dependencies: Map<number, { course: string, level: number }[]>
}

/**
 * Builds a set of course keys belonging to selected degree target titles.
 * @param selectedDegrees - Array of selected degree slugs.
 * @param degreeTargetTitle - Map of degree slug to target title name.
 * @param degreeTitlesMap - Map of degree slug to title definitions.
 * @returns Set of course keys that belong to target titles.
 */
export function buildTitleCourseSet(
  selectedDegrees: string[],
  degreeTargetTitle: Record<string, string>,
  degreeTitlesMap: Map<string, DegreeTitle[]>
): Set<string> {
  const courseKeys = new Set<string>()
  for (const degreeSlug of selectedDegrees) {
    const targetTitle = degreeTargetTitle[degreeSlug]
    if (!targetTitle) continue
    const titles = degreeTitlesMap.get(degreeSlug)
    if (!titles) continue
    const title = titles.find(t => t.name === targetTitle)
    if (!title) continue
    for (const crs of title.courses) courseKeys.add(crs.slug)
  }
  return courseKeys
}

/**
 * Builds a filtered course map based on selected titles and max levels.
 * @param courseMap - Full course map.
 * @param titleCourseSet - Set of course keys belonging to target titles.
 * @param selectedDegrees - Array of selected degree slugs.
 * @param degreeTargetTitle - Map of degree slug to target title name.
 * @param degreeTitlesMap - Map of degree slug to title definitions.
 * @returns Filtered course map with reduced levels.
 */
export function buildFilteredCourseMap(
  courseMap: Map<string, CourseInfo>,
  titleCourseSet: Set<string>,
  selectedDegrees: string[],
  degreeTargetTitle: Record<string, string>,
  degreeTitlesMap: Map<string, DegreeTitle[]>
): Map<string, FilteredCourseInfo> {
  const map = new Map<string, FilteredCourseInfo>()
  for (const [key, info] of courseMap) {
    if (!titleCourseSet.has(key)) continue
    let maxLevel = 100
    for (const degreeSlug of selectedDegrees) {
      const targetTitle = degreeTargetTitle[degreeSlug]
      if (!targetTitle) continue
      const titles = degreeTitlesMap.get(degreeSlug)
      if (!titles) continue
      const title = titles.find(t => t.name === targetTitle)
      if (!title) continue
      const titleCourse = title.courses.find(c => c.slug === key)
      if (titleCourse) maxLevel = Math.max(maxLevel, titleCourse.maxLevel)
    }
    const filteredLevels = info.levels.filter(l => l <= maxLevel)
    if (filteredLevels.length === 0) continue
    const filteredDeps = new Map<number, { course: string, level: number }[]>()
    for (const [lvl, deps] of info.dependencies) {
      if (lvl <= maxLevel) filteredDeps.set(lvl, deps)
    }
    map.set(key, { ...info, levels: filteredLevels, dependencies: filteredDeps })
  }
  return map
}

/**
 * Finds the dependency key for a course by slug.
 * @param depCourseSlug - The course slug (ID) to find.
 * @param filteredCourseMap - The filtered course map.
 * @returns The matching course key or null.
 */
export function findDependencyKey(depCourseSlug: string, filteredCourseMap: Map<string, FilteredCourseInfo>): string | null {
  // depCourseSlug is now the course ID (slug), e.g. "bimbo-behavior"
  // The map keys are also slugs, so we can match directly
  if (filteredCourseMap.has(depCourseSlug)) return depCourseSlug
  return null
}

/**
 * Builds the dependency path for a given node, collecting all prerequisite nodes.
 * @param nodeId - The starting node ID.
 * @param filteredCourseMap - The filtered course map.
 * @returns Set of node IDs in the dependency path.
 */
export function getDependencyPath(
  nodeId: string,
  filteredCourseMap: Map<string, FilteredCourseInfo>
): Set<string> {
  const path = new Set<string>()
  const stack = [nodeId]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === 'student' || path.has(current)) continue
    path.add(current)
    const baseKey = current.split('@')[0] ?? current
    const tierLevel = parseInt(current.includes('@') ? (current.split('@')[1] ?? '100') : '100', 10)
    const courseInfo = filteredCourseMap.get(baseKey)
    if (!courseInfo) continue
    for (const lvl of [...courseInfo.levels].sort((a, b) => b - a).filter(l => l <= tierLevel)) {
      const deps = courseInfo.dependencies.get(lvl)
      if (deps?.length) {
        for (const dep of deps) {
          const dk = findDependencyKey(dep.course, filteredCourseMap)
          if (!dk) continue
          const depLevels = courseInfo.levels.filter(l => l < tierLevel).sort((a, b) => b - a)
          if (depLevels.length > 0) {
            const dt = depLevels[0]!
            stack.push(dt >= 300 ? `${dk}@300` : dt >= 200 ? `${dk}@200` : dk)
          } else {
            stack.push(dk)
          }
        }
        break
      }
    }
  }
  return path
}

/**
 * Checks if a node is on any planned path.
 * @param nodeId - The node ID to check.
 * @param studyPlan - Set of planned node IDs.
 * @param filteredCourseMap - The filtered course map.
 * @returns True if the node is on a planned path.
 */
export function isOnPlannedPath(
  nodeId: string,
  studyPlan: Set<string>,
  filteredCourseMap: Map<string, FilteredCourseInfo>
): boolean {
  if (nodeId === 'student') return false
  if (studyPlan.has(nodeId)) return true
  for (const planId of studyPlan) {
    if (getDependencyPath(planId, filteredCourseMap).has(nodeId)) return true
  }
  return false
}

/**
 * Marks planned status on all graph edges.
 * @param edges - Array of graph edges.
 * @param studyPlan - Set of planned node IDs.
 * @param filteredCourseMap - The filtered course map.
 */
export function markPlannedEdges(
  edges: GraphEdge[],
  studyPlan: Set<string>,
  filteredCourseMap: Map<string, FilteredCourseInfo>
): void {
  for (const edge of edges) {
    edge.planned = isOnPlannedPath(edge.to, studyPlan, filteredCourseMap)
  }
}
