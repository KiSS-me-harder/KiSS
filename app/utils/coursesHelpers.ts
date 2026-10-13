/**
 * Helper functions for the courses index page.
 * Extracted from useCoursesIndex to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Course level entry for the courses index.
 */
export interface CourseLevelEntry {
  path: string
  courseTitle: string
  title: string
  degree: string
  degreeLabel: string
  level: number
  image: string
  totalLevels: number
  description: string
  courseSlug: string
  dependencies: { course: string, level: number }[]
}

/**
 * Tier configuration for course levels.
 */
export const tierConfig = [
  { level: 100, label: 'Level 100', badge: '1', badgeColor: 'bg-green-500' },
  { level: 200, label: 'Level 200', badge: '2', badgeColor: 'bg-blue-500' },
  { level: 300, label: 'Level 300', badge: '3', badgeColor: 'bg-red-500' }
]

/**
 * Builds a map of course slugs to their level counts.
 * @param allCourses - All course content items.
 * @returns Map of course slug to level count.
 */
export function buildCourseLevelCounts(
  allCourses: unknown[] | undefined
): Map<string, number> {
  if (!allCourses) return new Map()
  const map = new Map<string, Set<number>>()
  for (const item of allCourses) {
    const parts = (item as { stem?: string }).stem?.split('/') || []
    if (parts.length < 3) continue
    const courseName = parts[1] ?? ''
    const level = parseInt(parts[2] ?? '', 10)
    if (isNaN(level)) continue
    if (!map.has(courseName)) map.set(courseName, new Set())
    map.get(courseName)!.add(level)
  }
  const counts = new Map<string, number>()
  for (const [slug, levels] of map) counts.set(slug, levels.size)
  return counts
}

/**
 * Checks if a course level is eligible based on dependencies.
 * @param item - The course level entry.
 * @param store - Enrollment store instance.
 * @returns True if eligible.
 */
export function isCourseEligible(
  item: CourseLevelEntry,
  store: ReturnType<typeof useEnrollmentStore>
): boolean {
  if (!item.dependencies.length) return true
  return store.areDependenciesMet(item.courseSlug, item.level, item.dependencies)
}

/**
 * Generates an abbreviated label for a dependency (e.g., "AF100" from "anal-fundamentals" at level 100).
 * Takes the first letter of each word in the course slug, uppercases them, and appends the level number.
 * @param dep - The dependency object with course slug and level.
 * @returns Abbreviated label string (e.g., "AF100").
 */
export function getAbbreviatedLabel(dep: { course: string, level: number }): string {
  const abbr = dep.course.split('-').map(w => w.charAt(0).toUpperCase()).join('')
  return `${abbr}${dep.level}`
}

/**
 * Gets the first unmet dependency for a course level entry.
 * @param item - The course level entry.
 * @param store - Enrollment store instance.
 * @returns The first unmet dependency or null if all are met.
 */
export function getFirstUnmetDependency(
  item: CourseLevelEntry,
  store: ReturnType<typeof useEnrollmentStore>
): { course: string, level: number } | null {
  if (!item.dependencies.length) return null
  for (const dep of item.dependencies) {
    if (!store.isLevelCompleted(dep.course, dep.level)) {
      return dep
    }
  }
  return null
}

/**
 * Builds course entries for a specific tier level.
 * @param coursesData - All course content items.
 * @param tierLevel - The tier level (100, 200, 300).
 * @param baseURL - Base URL for images.
 * @param courseLevelCounts - Map of course slugs to level counts.
 * @returns Array of course level entries.
 */
export function buildTierEntries(
  coursesData: unknown[],
  tierLevel: number,
  baseURL: string,
  courseLevelCounts: Map<string, number>,
  courseDegrees: Map<string, string> = new Map()
): CourseLevelEntry[] {
  const entries: CourseLevelEntry[] = []
  const seen = new Set<string>()
  for (const item of coursesData) {
    const parts = (item as { stem?: string }).stem?.split('/') || []
    if (parts.length < 3) continue
    const level = parseInt(parts[2] ?? '', 10)
    if (level < tierLevel || level >= tierLevel + 100) continue
    const courseName = parts[1] ?? ''
    if (seen.has(courseName)) continue
    seen.add(courseName)
    const title = (item as { title?: string }).title || ''
    const degree = courseDegrees.get(courseName) || ''
    // Extract dependencies from course frontmatter meta
    const rawDeps = (item as { meta?: { dependencies?: unknown[] } }).meta?.dependencies || []
    const dependencies: { course: string, level: number }[] = []
    for (const dep of rawDeps) {
      const d = dep as { class?: string, level?: number }
      if (d.class && d.level != null) {
        // d.class is now the course ID (slug), e.g. "bimbo-behavior"
        dependencies.push({ course: d.class, level: d.level })
      }
    }
    entries.push({
      path: `/courses/${courseName}`,
      courseTitle: courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      title,
      degree,
      degreeLabel: degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      level: tierLevel,
      image: degree ? `${baseURL}img/degrees/${degree}.webp` : `${baseURL}img/courses/${courseName}.webp`,
      totalLevels: courseLevelCounts.get(courseName) || 0,
      description: '',
      courseSlug: courseName,
      dependencies
    })
  }
  return entries
}

/**
 * Builds level groups (tier groups) for the courses index.
 * @param allCourses - All course content items.
 * @param baseURL - Base URL for images.
 * @returns Array of tier groups with entries.
 */
export function buildLevelGroups(
  allCourses: unknown[] | undefined,
  baseURL: string,
  allDegrees: unknown[] | undefined
) {
  // Build course-to-degree mapping from degree content
  const courseDegrees = new Map<string, string>()
  if (allDegrees) {
    for (const degree of allDegrees) {
      const degreeSlug = (degree as { stem?: string }).stem?.split('/').pop() || ''
      const levels = (degree as { meta?: { levels?: unknown[] } }).meta?.levels || []
      for (const level of levels as { courses?: { slug?: string }[] }[]) {
        for (const course of level.courses || []) {
          const courseSlug = (course as { slug?: string }).slug as string
          if (courseSlug && !courseDegrees.has(courseSlug)) {
            courseDegrees.set(courseSlug, degreeSlug)
          }
        }
      }
    }
  }

  if (!allCourses) return []
  const courseLevelCounts = buildCourseLevelCounts(allCourses)
  const courseByTier = tierConfig.map((config) => {
    const entries = buildTierEntries(allCourses, config.level, baseURL, courseLevelCounts, courseDegrees)
    return { ...config, entries }
  })
  return courseByTier
}

/**
 * Builds structured data JSON-LD for the courses index page.
 * @returns JSON string of structured data.
 */
export function buildCoursesStructuredData(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://kiss-academy.github.io/KiSS/courses/#webpage',
        'url': 'https://kiss-academy.github.io/KiSS/courses/',
        'name': 'Courses',
        'description': 'Browse all available courses at KiSS Academy.',
        'inLanguage': 'en',
        'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kiss-academy.github.io/KiSS/#website',
        'url': 'https://kiss-academy.github.io/KiSS/',
        'name': 'KiSS Academy',
        'description': 'KiSS Academy - A gamified learning platform.',
        'inLanguage': 'en'
      }
    ]
  })
}
