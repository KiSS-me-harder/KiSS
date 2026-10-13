/**
 * Helper functions for parsing study plan data from content collections.
 * Extracted from useStudyPlanGraph to keep the composable within line limits.
 */
import type { CourseInfo, DegreeTitle } from './studyPlanGraph'

/**
 * Builds a map of degree slugs to their title/level definitions.
 * @param degrees - Array of degree content entries.
 * @returns Map from degree slug to array of degree titles.
 */
export function buildDegreeTitlesMap(degrees: unknown[]): Map<string, DegreeTitle[]> {
  const map = new Map<string, DegreeTitle[]>()
  if (!degrees) return map
  for (const degree of degrees) {
    const stem = (degree as { stem?: string }).stem || ''
    const slug = stem.split('/').pop() || ''
    const levels = (degree as { meta?: { levels?: unknown[] } }).meta?.levels || []
    const titles: DegreeTitle[] = ((levels as unknown[]) as { name?: string, description?: string, courses?: unknown[] }[]).map(l => ({
      name: (l.name as string) || '',
      description: (l.description as string) || '',
      courses: ((l.courses as unknown[]) || []).map(c => ({
        slug: ((c as { slug?: string }).slug as string) || '',
        maxLevel: ((c as { maxLevel?: number }).maxLevel as number) || 100
      }))
    }))
    map.set(slug, titles)
  }
  return map
}

/**
 * Builds a map of course slugs to their level and dependency info.
 * @param courses - Array of course content entries.
 * @returns Map from course key (degree/slug) to CourseInfo.
 */
export function buildCourseMap(courses: unknown[]): Map<string, CourseInfo> {
  const map = new Map<string, CourseInfo>()
  if (!courses) return map
  for (const item of courses) {
    const parts = (item as { stem?: string }).stem?.split('/') || []
    if (parts.length < 3) continue
    const courseName = parts[1] ?? ''
    const level = parseInt(parts[2] ?? '', 10)
    if (isNaN(level)) continue
    const courseTitle = courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const degree = ''
    const degreeLabel = ''
    const key = courseName
    const deps: { course: string, level: number }[] = []
    if (!map.has(key)) {
      map.set(key, { degree, degreeLabel, courseName: courseTitle, levels: [], dependencies: new Map() })
    }
    const entry = map.get(key)!
    if (!entry.levels.includes(level)) entry.levels.push(level)
    if (deps.length > 0) entry.dependencies.set(level, deps)
  }
  for (const [, entry] of map) entry.levels.sort((a, b) => a - b)
  return map
}

/**
 * Builds a sorted list of unique degrees from the degree titles map.
 * @param degreeTitlesMap - Map of degree slugs to their title definitions.
 * @returns Array of degree slug/label pairs, sorted by label.
 */
export function buildDegreesList(degreeTitlesMap: Map<string, DegreeTitle[]>): Array<{ slug: string, label: string }> {
  return Array.from(degreeTitlesMap.entries())
    .map(([slug]) => ({ slug, label: slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Enriches the course map with degree information from the degree titles map.
 * Courses are associated with degrees based on the degree's course references.
 * @param courseMap - Map of course slugs to CourseInfo (with empty degree info).
 * @param degreeTitlesMap - Map of degree slugs to their title definitions.
 */
export function enrichCourseMapWithDegrees(courseMap: Map<string, CourseInfo>, degreeTitlesMap: Map<string, DegreeTitle[]>): void {
  for (const [degreeSlug, titles] of degreeTitlesMap) {
    const degreeLabel = degreeSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    for (const title of titles) {
      for (const courseRef of title.courses) {
        const key = courseRef.slug
        if (courseMap.has(key)) {
          const info = courseMap.get(key)!
          info.degree = degreeSlug
          info.degreeLabel = degreeLabel
        }
      }
    }
  }
}
